import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as Bull from 'bull';
import { Repository } from 'typeorm';

import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import RecruitDto from '~/models/recruit/dtos/recruit.dto';

@Injectable()
export class RecruitService {
  private readonly logger = new Logger(RecruitService.name);
  private queues: Map<string, Bull.Queue> = new Map();

  constructor(
    @InjectRepository(ArmyEntity)
    private armyRepository: Repository<ArmyEntity>,
    private configService: ConfigService,
  ) {}

  private getOrCreateQueue(settlementId: string): Bull.Queue {
    let queue = this.queues.get(settlementId);
    if (!queue) {
      queue = new Bull(
        `settlement_${settlementId}`,
        this.configService.get<string>('REDIS_CONNECTION_STRING'),
      );
      queue.process(async (job, done) => {
        for (let i = 0; i < job.data.unitCount; i++) {
          await new Promise((resolve) => setTimeout(resolve, 60000));
          await this.recruitUnit(job.data);
          await job.progress(i + 1);
        }
        done();
      });
      this.queues.set(settlementId, queue);
    }
    return queue;
  }

  async startRecruitment(recruitDto: RecruitDto) {
    const queue = this.getOrCreateQueue(recruitDto.settlementId);
    const job = await queue.add(recruitDto);
    this.logger.log(
      `Job added to queue for settlement ${recruitDto.settlementId} with ID: ${job.id}`,
    );
    return job;
  }

  async recruitUnit(recruitDto: RecruitDto): Promise<void> {
    const army = await this.armyRepository.findOne({
      where: { settlementId: recruitDto.settlementId },
    });

    if (!army) {
      throw new Error('Army not found for the given settlement.');
    }

    army[recruitDto.unitType] += 1;
    await this.armyRepository.save(army);
  }

  async getUnfinishedJobsBySettlementId(
    settlementId: string,
  ): Promise<Bull.Job[]> {
    const queue = this.queues.get(settlementId);

    if (!queue) {
      this.logger.warn(`Queue for settlement ${settlementId} not found.`);
      return [];
    }

    return await queue.getJobs(['waiting', 'active']);
  }
}
