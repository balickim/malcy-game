import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import RecruitDto from '~/models/recruit/dtos/recruit.dto';
import { RecruitService } from '~/models/recruit/recruit.service';

const baseUnitRecruitmentTimeMs = 60000; // 1 minute
// const baseUnitRecruitmentTimeMs = 1; // 1 ms
@Processor('recruitQueue')
export class RecruitJobConsumer {
  constructor(private readonly recruitService: RecruitService) {}

  @Process('recruit')
  async handleRecruitment(job: Job<RecruitDto>) {
    for (let i = 0; i < job.data.unitCount; i++) {
      await this.recruitService.recruitUnit(job.data);

      await job.progress(i);

      await new Promise((resolve) =>
        setTimeout(resolve, baseUnitRecruitmentTimeMs),
      );
    }

    return { finishedUnits: job.data.unitCount };
  }
}
