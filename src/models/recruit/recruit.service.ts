import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';

import { ArmyEntity } from '~/models/armies/entities/armies.entity';
import RecruitDto from '~/models/recruit/dtos/recruit.dto';

@Injectable()
export class RecruitService {
  private readonly logger = new Logger(RecruitService.name);

  constructor(
    @InjectQueue('recruitQueue') private recruitQueue: Queue,
    @InjectRepository(ArmyEntity)
    private armyRepository: Repository<ArmyEntity>,
  ) {}

  async startRecruitment(recruitDto: RecruitDto) {
    const job = await this.recruitQueue.add('recruit', recruitDto);
    this.logger.log(`Job added to recruitQueue with ID: ${job.id}`);
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

  async getUnfinishedJobsBySettlementId(settlementId: string) {
    const jobs = await this.recruitQueue.getJobs(['waiting', 'active']);
    return jobs.filter((job) => job.data.settlementId === settlementId);
  }

  async cancelRecruitment(jobId: string): Promise<void> {
    return this.recruitQueue.removeJobs(jobId);
  }
}
