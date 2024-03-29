import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IExpressRequestWithUser } from '~/models/auth/guards/jwt.guard';
import { RequestRecruitmentDto } from '~/models/recruit/dtos/recruit.dto';
import { RecruitService } from '~/models/recruit/recruit.service';

@ApiTags('recruit')
@Controller('recruit')
export class RecruitController {
  constructor(private readonly recruitService: RecruitService) {}

  @Post('/')
  async startRecruitment(
    @Request() req: IExpressRequestWithUser,
    @Body() recruitDto: RequestRecruitmentDto,
  ) {
    return this.recruitService.startRecruitment(recruitDto);
  }

  @Get(':settlementId')
  async getUnfinishedJobs(@Param('settlementId') settlementId: string) {
    return this.recruitService.getUnfinishedJobsBySettlementId(settlementId);
  }

  @Delete(':settlementId/:jobId')
  async cancelRecruitment(
    @Request() req: IExpressRequestWithUser,
    @Param('settlementId') settlementId: string,
    @Param('jobId') jobId: string,
  ) {
    return this.recruitService.cancelRecruitment(settlementId, jobId, req.user);
  }
}
