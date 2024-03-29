import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as Bull from 'bull';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { sleep } from '~/common/utils';
import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { QueuesManagerService } from '~/models/queues-manager/queues-manager.service';
import {
  RequestRecruitmentDto,
  ResponseRecruitmentDto,
} from '~/models/recruit/dtos/recruit.dto';
import { SettlementsService } from '~/models/settlements/settlements.service';
import { UsersEntity } from '~/models/users/entities/users.entity';

const settlementRecruitmentQueueName = (settlementId: string) =>
  `settlement_${settlementId}`;

@Injectable()
export class RecruitService {
  private readonly logger = new Logger(RecruitService.name);

  constructor(
    @InjectRepository(ArmyEntity)
    private armyRepository: Repository<ArmyEntity>,
    private queueService: QueuesManagerService,
    @InjectRedis() private readonly redis: Redis,
    private settlementsService: SettlementsService,
    private configService: ConfigService,
  ) {}

  // TODO assign processors to all active or waiting jobs after server restart
  // bull does not keep processors code in between restarts
  // async onModuleInit() {
  //   const queueNames =
  //     await this.queueService.getAllSettlementRecruitmentQueueNames();
  //
  //   for (const queueName of queueNames) {
  //     await this.queueService.generateQueue(queueName, this.recruitProcessor());
  //   }
  // }

  async startRecruitment(recruitDto: RequestRecruitmentDto) {
    const { type } = await this.settlementsService.getSettlementById(
      recruitDto.settlementId,
    );
    const unitRecruitmentTime = this.configService.get<number>(
      `RECRUITMENT_TIMES_MS.${type}.${recruitDto.unitType}`,
    );
    const finishesOn = new Date(
      Date.now() + recruitDto.unitCount * unitRecruitmentTime,
    );
    const data: ResponseRecruitmentDto = {
      ...recruitDto,
      unitRecruitmentTime,
      finishesOn,
    };

    const queue = await this.queueService.generateQueue(
      settlementRecruitmentQueueName(recruitDto.settlementId),
      this.recruitProcessor(),
    );
    const job: Bull.Job<ResponseRecruitmentDto> = await queue.add(data, {
      removeOnComplete: true,
      removeOnFail: true,
    });
    this.logger.log(
      `Job added to queue for settlement ${recruitDto.settlementId} with ID: ${job.id}`,
    );
    return job;
  }

  recruitProcessor() {
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

  async recruitUnit(
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

  async getUnfinishedJobsBySettlementId(settlementId: string) {
    let jobs: Bull.Job<ResponseRecruitmentDto>[] =
      await this.queueService.getJobsFromQueue(
        settlementRecruitmentQueueName(settlementId),
        ['active', 'waiting'],
      );

    jobs = jobs.filter((job) => job !== null);
    if (!jobs) {
      this.logger.debug(`Jobs for settlement ${settlementId} not found.`);
      return [];
    }

    return jobs;
  }

  async saveRecruitmentProgress(
    recruitDto: RequestRecruitmentDto,
    jobId: number | string,
    progress: number,
  ): Promise<void> {
    const key = `recruitment:${recruitDto.settlementId}:${recruitDto.unitType}:${jobId}`;
    await this.redis.set(key, progress.toString(), 'EX', 60 * 60 * 24 * 7); // Expire after a week
  }

  async getRecruitmentProgress(
    recruitDto: RequestRecruitmentDto,
    jobId: number | string,
  ): Promise<number> {
    const key = `recruitment:${recruitDto.settlementId}:${recruitDto.unitType}:${jobId}`;
    const progress = await this.redis.get(key);
    return progress ? parseInt(progress, 10) : 0;
  }

  async cancelRecruitment(
    settlementId: string,
    jobId: string,
    user: UsersEntity,
  ) {
    const settlement =
      await this.settlementsService.getSettlementById(settlementId);
    if (settlement.user.id !== user.id) throw new UnauthorizedException();

    const queue: Bull.Queue = new Bull(
      settlementRecruitmentQueueName(settlementId),
      this.configService.get<string>('REDIS_CONNECTION_STRING'),
    );
    const job = await queue.getJob(jobId);
    await job.discard();
    await job.moveToCompleted('', true, true);
    return 'success';
  }
}
