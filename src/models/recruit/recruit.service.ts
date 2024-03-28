import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Bull from 'bull';
import { Repository } from 'typeorm';

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
  ) {}

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
    return async (job: Bull.Job<any>, done) => {
      for (let i = 0; i < job.data.unitCount; i++) {
        await new Promise((resolve) => setTimeout(resolve, 60000));
        await this.recruitUnit(job.data);
        await job.progress(i + 1);
      }
      done();
    };
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

  async getUnfinishedJobsBySettlementId(settlementId: string) {
    const jobs = await this.queueService.getAllJobsFromQueue(
      `settlement_${settlementId}`,
      this.recruitProcessor(),
    );

    if (!jobs) {
      this.logger.warn(`Jobs for settlement ${settlementId} not found.`);
      return [];
    }

    return jobs;
  }
}
