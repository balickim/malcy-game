import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { sleep } from '~/common/utils';
import { ArmiesService } from '~/modules/armies/armies.service';
import { ArmyEntity, UnitType } from '~/modules/armies/entities/armies.entity';
import { StartSiegeDto } from '~/modules/combats/dtos/siege.dto';
import { ISiegeJob } from '~/modules/combats/types';
import { ConfigService } from '~/modules/config/config.service';
import { PrivateSettlementDto } from '~/modules/settlements/dtos/settlements.dto';
import { SettlementsService } from '~/modules/settlements/settlements.service';

const bullSettlementSiegeQueueName = (settlementId: string) =>
  `combat:siege:settlement_${settlementId}`;

@Injectable()
export class CombatsService implements OnModuleInit {
  private readonly logger = new Logger(CombatsService.name);

  constructor(
    @Inject(forwardRef(() => SettlementsService))
    private settlementsService: SettlementsService,
    @InjectRedis() private readonly redis: Redis,
    private configService: ConfigService,
    @InjectRepository(ArmyEntity)
    private armyEntityRepository: Repository<ArmyEntity>,
    @Inject(forwardRef(() => ArmiesService))
    private armiesService: ArmiesService,
  ) {}

  // Assigns processors to all active or waiting jobs after server restart
  // bull does not keep processors code in between restarts
  async onModuleInit() {
    const prefix = 'bull:combat:siege:';
    const queueNames = new Set<string>();
    let cursor = '0';

    do {
      const reply = await this.redis.scan(
        cursor,
        'MATCH',
        `${prefix}*`,
        'COUNT',
        '1000',
      );
      cursor = reply[0];
      reply[1].forEach((key: string) => {
        const match = key.match(/^(bull:combat:siege:[^:]+)(?::[^:]+)?$/);
        if (match && match[1]) {
          queueNames.add(match[1].replace('bull:', ''));
        }
      });
    } while (cursor !== '0');

    this.logger.log(
      `Attaching processors to ${[...queueNames].length} existing siege queues...`,
    );

    const attachProcessorsPromises = [...queueNames].map((queueName) => {
      const worker = new Worker(queueName, this.siegeProcessor, {
        connection: this.redis,
      });

      worker.on('completed', (job) => {
        this.logger.log(`Job ${job.id} in queue ${queueName} completed`);
      });

      worker.on('failed', (job, err) => {
        this.logger.error(
          `Job ${job?.id} in queue ${queueName} failed: ${err}`,
        );
      });

      return worker;
    });

    await Promise.all(attachProcessorsPromises);

    this.logger.log('Processors attached successfully to all existing queues.');
  }

  private getBreakthroughChance() {
    return Math.random() * 10;
  }

  private tryBreakthrough(chance: number) {
    return Math.random() < chance / 100;
  }

  private siegeProcessor = async (job: Job<ISiegeJob>) => {
    let breakthroughChance = 0;
    let success = false;

    while (!success) {
      await sleep(10000);

      breakthroughChance += this.getBreakthroughChance();
      if (breakthroughChance > 100) breakthroughChance = 100;

      success = this.tryBreakthrough(breakthroughChance);

      await job.updateProgress(breakthroughChance);

      if (success) {
        const defenderArmy = await this.armyEntityRepository.findOne({
          where: { id: job.data.defenderSettlement.army.id },
        });
        const battleOutcome = this.calculateBattleOutcome(
          job.data.army,
          defenderArmy,
        );
        if (battleOutcome.result === 'Attacker wins') {
        }
        break;
      }
    }
    return 'Siege completed';
  };

  public async startSiege(
    siegeDto: StartSiegeDto,
    attackerUserId: string,
    defenderSettlement: PrivateSettlementDto,
  ) {
    if (defenderSettlement.user.id === attackerUserId) {
      throw new BadRequestException('You cannot besiege your own settlement');
    }
    const existingSiege = await this.getSiegeBySettlementId(
      defenderSettlement.id,
    );
    if (existingSiege) {
      throw new BadRequestException('This settlement is already besieged');
    }
    const userArmy = await this.armyEntityRepository.findOne({
      where: { userId: attackerUserId },
    });
    const areTroopsAvailable = this.armiesService.areTroopsAvailable(
      userArmy,
      siegeDto.army,
    );
    if (!areTroopsAvailable) {
      throw new NotFoundException('Not enough troops in the settlement');
    }

    const queue = new Queue<ISiegeJob>(
      bullSettlementSiegeQueueName(defenderSettlement.id),
      { connection: this.redis },
    );
    new Worker(
      bullSettlementSiegeQueueName(defenderSettlement.id),
      this.siegeProcessor,
      { connection: this.redis },
    );
    const job: Job<ISiegeJob> = await queue.add('siege', {
      army: siegeDto.army,
      defenderSettlement,
      attackerUserId,
    });
    await job.updateProgress(0);
    const deductedArmy = this.armiesService.deductUnits(
      userArmy,
      siegeDto.army,
    );
    await this.armyEntityRepository.save(deductedArmy);

    return job;
  }

  public async getSiegeBySettlementId(settlementId: string) {
    const queueName = bullSettlementSiegeQueueName(settlementId);
    const queue = new Queue<StartSiegeDto>(queueName, {
      connection: this.redis,
    });

    const jobs = await queue.getJobs(['delayed', 'waiting', 'active']);

    if (!jobs.length) {
      return false;
    }

    const job = jobs[0];

    const currentTime = Date.now();
    const delayUntil = job.timestamp + job.opts.delay;
    const remainingDelay = delayUntil - currentTime;

    return {
      jobId: job.id,
      data: job.data,
      remainingDelay: remainingDelay > 0 ? remainingDelay : 0,
      progress: job.progress,
    };
  }

  public calculateBattleOutcome(
    attackerArmy: Record<UnitType, number>,
    defenderArmy: Record<UnitType, number>,
  ): {
    result: 'Attacker wins' | 'Defender wins' | string;
    attackerLosses: Record<UnitType, number>;
    defenderLosses: Record<UnitType, number>;
  } {
    let attackerPower = 0;
    let defenderPower = 0;

    for (const unitType in attackerArmy) {
      const unitCount = attackerArmy[unitType as UnitType];
      const unitStats =
        this.configService.gameConfig.COMBAT[unitType as UnitType];
      attackerPower +=
        unitCount * (unitStats.ATTACK + unitStats.DEFENSE + unitStats.HEALTH);
    }

    for (const unitType in defenderArmy) {
      const unitCount = defenderArmy[unitType as UnitType];
      const unitStats =
        this.configService.gameConfig.COMBAT[unitType as UnitType];
      defenderPower +=
        unitCount * (unitStats.ATTACK + unitStats.DEFENSE + unitStats.HEALTH);
    }

    let result = '';
    const attackerLosses: Record<UnitType, number> = {
      [UnitType.SWORDSMAN]: 0,
      [UnitType.ARCHER]: 0,
      [UnitType.KNIGHT]: 0,
      [UnitType.LUCHADOR]: 0,
      [UnitType.ARCHMAGE]: 0,
    };
    const defenderLosses: Record<UnitType, number> = {
      [UnitType.SWORDSMAN]: 0,
      [UnitType.ARCHER]: 0,
      [UnitType.KNIGHT]: 0,
      [UnitType.LUCHADOR]: 0,
      [UnitType.ARCHMAGE]: 0,
    };

    if (attackerPower > defenderPower) {
      result = 'Attacker wins';
      for (const unitType in attackerArmy) {
        const unitCount = attackerArmy[unitType as UnitType];
        attackerLosses[unitType as UnitType] = Math.floor(
          unitCount * (defenderPower / attackerPower),
        );
      }
      for (const unitType in defenderArmy) {
        defenderLosses[unitType as UnitType] =
          defenderArmy[unitType as UnitType]; // 100% loss for defender
      }
    } else {
      result = 'Defender wins';
      for (const unitType in defenderArmy) {
        const unitCount = defenderArmy[unitType as UnitType];
        defenderLosses[unitType as UnitType] = Math.floor(
          unitCount * (attackerPower / defenderPower),
        );
      }
      for (const unitType in attackerArmy) {
        attackerLosses[unitType as UnitType] =
          attackerArmy[unitType as UnitType]; // 100% loss for attacker
      }
    }

    return { result, attackerLosses, defenderLosses };
  }
}
