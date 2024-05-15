import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { sleep } from '~/common/utils';
import { StartSiegeDto } from '~/modules/combats/dtos/siege.dto';
import { SiegeEntity } from '~/modules/combats/entities/siege.entity';
import { ISiegeJob } from '~/modules/combats/types';
import { ConfigService } from '~/modules/config/config.service';
import { PrivateSettlementDto } from '~/modules/settlements/dtos/settlements.dto';

const bullSettlementSiegeQueueName = (settlementId: string) =>
  `combat:siege:settlement_${settlementId}`;

@Injectable()
export class CombatsService {
  private readonly logger = new Logger(CombatsService.name);

  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectRepository(SiegeEntity)
    private siegeEntityRepository: Repository<SiegeEntity>,
    private configService: ConfigService,
  ) {}

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
        this.logger.log('Siege successful!');
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

    // await this.siegeEntityRepository.insert({ settlement: defenderSettlement });

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
      ...siegeDto,
      defenderSettlement,
      attackerUserId,
    });
    await job.updateProgress(0);

    return job;
  }

  public async getSiegeBySettlementId(settlementId: string) {
    const queueName = bullSettlementSiegeQueueName(settlementId);
    const queue = new Queue<StartSiegeDto>(queueName, {
      connection: this.redis,
    });

    const jobs = await queue.getJobs(['delayed', 'waiting', 'active']);

    if (!jobs.length) {
      return null;
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
}
