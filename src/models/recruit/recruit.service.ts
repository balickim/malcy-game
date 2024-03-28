import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Bull from 'bull';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { sleep } from '~/common/utils';
import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import { QueuesManagerService } from '~/models/queues-manager/queues-manager.service';
import RecruitDto from '~/models/recruit/dtos/recruit.dto';

@Injectable()
export class RecruitService {
  private readonly logger = new Logger(RecruitService.name);

  constructor(
    @InjectRepository(ArmyEntity)
    private armyRepository: Repository<ArmyEntity>,
    private queueService: QueuesManagerService,
    @InjectRedis() private readonly redis: Redis,
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

  async startRecruitment(recruitDto: RecruitDto) {
    const queueName = `settlement_${recruitDto.settlementId}`;
    const queue = await this.queueService.generateQueue(
      queueName,
      this.recruitProcessor(),
    );
    const job = await queue.add(recruitDto);
    this.logger.log(
      `Job added to queue for settlement ${recruitDto.settlementId} with ID: ${job.id}`,
    );
    return 'success';
  }

  recruitProcessor() {
    return async (job: Bull.Job<RecruitDto>, done: Bull.DoneCallback) => {
      const totalUnits = job.data.unitCount;
      const jobId = job.id;

      for (let i = 0; i < totalUnits; i++) {
        const currentProgress = await this.getRecruitmentProgress(
          job.data,
          jobId,
        );
        if (currentProgress < totalUnits) {
          await sleep(5000);
          await this.recruitUnit(job.data, jobId);
          await job.progress(currentProgress + 1);
        } else {
          break;
        }
      }
      done();
    };
  }

  async recruitUnit(
    recruitDto: RecruitDto,
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
    const jobs = await this.queueService.getAllJobsFromQueue(
      `settlement_${settlementId}`,
    );

    if (!jobs) {
      this.logger.warn(`Jobs for settlement ${settlementId} not found.`);
      return [];
    }

    return jobs;
  }

  async saveRecruitmentProgress(
    recruitDto: RecruitDto,
    jobId: number | string,
    progress: number,
  ): Promise<void> {
    const key = `recruitment:${recruitDto.settlementId}:${recruitDto.unitType}:${jobId}`;
    await this.redis.set(key, progress.toString(), 'EX', 60 * 60 * 24 * 7); // Expire after a week
  }

  async getRecruitmentProgress(
    recruitDto: RecruitDto,
    jobId: number | string,
  ): Promise<number> {
    const key = `recruitment:${recruitDto.settlementId}:${recruitDto.unitType}:${jobId}`;
    const progress = await this.redis.get(key);
    return progress ? parseInt(progress, 10) : 0;
  }
}
