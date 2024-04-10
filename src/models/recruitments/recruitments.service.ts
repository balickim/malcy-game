import { InjectRedis } from '@liaoliaots/nestjs-redis';
import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as Bull from 'bull';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { sleep } from '~/common/utils';
import { ArmyEntity, UnitType } from '~/models/armies/entities/armies.entity';
import { QueuesManagerService } from '~/models/queues-manager/queues-manager.service';
import {
  RequestRecruitmentDto,
  ResponseRecruitmentDto,
} from '~/models/recruitments/dtos/recruitments.dto';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { SettlementsService } from '~/models/settlements/settlements.service';
import { UsersEntity } from '~/models/users/entities/users.entity';

const bullSettlementRecruitmentQueueName = (settlementId: string) =>
  `recruitment:settlement_${settlementId}`;
const settlementRecruitmentProgressKey = (
  settlementId: string,
  unitType: UnitType,
  jobId: number | string,
) => `recruitmentProgress:${settlementId}:${unitType}:${jobId}`;

@Injectable()
export class RecruitmentsService implements OnModuleInit {
  private readonly logger = new Logger(RecruitmentsService.name);

  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectRepository(ArmyEntity)
    private armyRepository: Repository<ArmyEntity>,
    private queueService: QueuesManagerService,
    private settlementsService: SettlementsService,
    private configService: ConfigService,
  ) {}

  // Assigns processors to all active or waiting jobs after server restart
  // bull does not keep processors code in between restarts
  async onModuleInit() {
    const prefix = 'bull:recruitment:';
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
        const match = key.match(/^(bull:recruitment:[^:]+)(?::[^:]+)?$/);
        if (match && match[1]) {
          queueNames.add(match[1].replace('bull:', ''));
        }
      });
    } while (cursor !== '0');

    this.logger.log(`Attaching processors to existing recruitment queues...`);
    for (const queueName of queueNames) {
      await this.queueService.generateQueue(queueName, this.recruitProcessor());
    }
    await Promise.all(
      [...queueNames].map((queueName) =>
        this.queueService.generateQueue(queueName, this.recruitProcessor()),
      ),
    );
  }

  public async startRecruitment(
    recruitDto: RequestRecruitmentDto,
    settlement: SettlementsEntity,
  ) {
    const unitRecruitmentTime = this.configService.get<number>(
      `RECRUITMENT_TIMES_MS.${settlement.type}.${recruitDto.unitType}`,
    );

    const unfinishedJobs = await this.getUnfinishedRecruitmentsBySettlementId(
      recruitDto.settlementId,
    );
    let totalDelayMs = 0;
    for (const job of unfinishedJobs) {
      const jobFinishTime = new Date(job.data.finishesOn).getTime();
      const now = Date.now();
      if (jobFinishTime > now) {
        totalDelayMs += jobFinishTime - now;
      }
    }

    const finishesOn = new Date(
      Date.now() + recruitDto.unitCount * unitRecruitmentTime + totalDelayMs,
    );
    const data: ResponseRecruitmentDto = {
      ...recruitDto,
      unitRecruitmentTime,
      finishesOn,
    };

    const queue = await this.queueService.generateQueue(
      bullSettlementRecruitmentQueueName(recruitDto.settlementId),
      this.recruitProcessor(),
    );
    const job: Bull.Job<ResponseRecruitmentDto> = await queue.add(data, {
      delay: totalDelayMs,
      removeOnComplete: true,
      removeOnFail: true,
    });
    this.logger.log(
      `Job added to queue for settlement ${recruitDto.settlementId} with ID: ${job.id}`,
    );
    return job;
  }

  public async cancelRecruitment(
    settlementId: string,
    jobId: string,
    user: UsersEntity,
  ) {
    const settlement =
      await this.settlementsService.getSettlementById(settlementId);
    if (settlement.user.id !== user.id) throw new UnauthorizedException();

    const queue: Bull.Queue = new Bull(
      bullSettlementRecruitmentQueueName(settlementId),
      this.configService.get<string>('REDIS_CONNECTION_STRING'),
    );
    const job: Bull.Job<ResponseRecruitmentDto> = await queue.getJob(jobId);
    await this.saveRecruitmentProgress(job.data, jobId, job.data.unitCount); // save recruitment progress as it's goal to be sure it will not recruit more
    await job.discard();
    await job.moveToCompleted('', true, true);
    return 'success';
  }

  public async getUnfinishedRecruitmentsBySettlementId(settlementId: string) {
    let jobs: Bull.Job<ResponseRecruitmentDto>[] =
      await this.queueService.getJobsFromQueue(
        bullSettlementRecruitmentQueueName(settlementId),
        ['active', 'waiting', 'delayed'],
      );

    jobs = jobs.filter((job) => job !== null);
    if (!jobs) {
      this.logger.debug(`Jobs for settlement ${settlementId} not found.`);
      return [];
    }

    return jobs;
  }

  private recruitProcessor() {
    return async (
      job: Bull.Job<ResponseRecruitmentDto>,
      done: Bull.DoneCallback,
    ) => {
      const totalUnits = job.data.unitCount;
      const jobId = job.id;
      const unitRecruitTimeMs = job.data.unitRecruitmentTime;

      for (let i = 0; i < totalUnits; i++) {
        const currentProgress = await this.getRecruitmentProgress(
          job.data,
          jobId,
        );
        if (currentProgress < totalUnits) {
          await sleep(unitRecruitTimeMs);
          await this.recruitUnit(job.data, jobId);
          await job.progress(currentProgress + 1);

          const remainingUnits = totalUnits - (currentProgress + 1);
          const estimatedFinishTime = new Date(
            Date.now() + remainingUnits * unitRecruitTimeMs,
          );

          await job.update({ ...job.data, finishesOn: estimatedFinishTime });
        } else {
          break;
        }
      }
      done();
    };
  }

  private async recruitUnit(
    recruitDto: RequestRecruitmentDto,
    jobId: Bull.JobId,
  ): Promise<boolean> {
    const currentProgress = await this.getRecruitmentProgress(
      recruitDto,
      jobId,
    );

    if (currentProgress >= recruitDto.unitCount) {
      return false;
    }

    const army = await this.armyRepository.findOne({
      where: { settlementId: recruitDto.settlementId },
    });

    if (!army) {
      throw new Error('Army not found for the given settlement.');
    }

    army[recruitDto.unitType] += 1;
    await this.armyRepository.save(army);

    await this.saveRecruitmentProgress(recruitDto, jobId, currentProgress + 1);
    return true;
  }

  private async saveRecruitmentProgress(
    recruitDto: RequestRecruitmentDto,
    jobId: number | string,
    progress: number,
  ): Promise<void> {
    const key = settlementRecruitmentProgressKey(
      recruitDto.settlementId,
      recruitDto.unitType,
      jobId,
    );
    await this.redis.set(key, progress.toString(), 'EX', 60 * 60 * 24 * 7); // Expire after a week
  }

  private async getRecruitmentProgress(
    recruitDto: RequestRecruitmentDto,
    jobId: number | string,
  ): Promise<number> {
    const key = settlementRecruitmentProgressKey(
      recruitDto.settlementId,
      recruitDto.unitType,
      jobId,
    );
    const progress = await this.redis.get(key);
    return progress ? parseInt(progress, 10) : 0;
  }
}
