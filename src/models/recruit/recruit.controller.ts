import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IExpressRequestWithUser } from '~/models/auth/guards/jwt.guard';
import RecruitDto from '~/models/recruit/dtos/recruit.dto';
import { RecruitService } from '~/models/recruit/recruit.service';

@ApiTags('recruit')
@Controller('recruit')
export class RecruitController {
  constructor(private readonly recruitService: RecruitService) {}

  @Post('/')
  async startRecruitment(
    @Request() req: IExpressRequestWithUser,
    @Body() recruitDto: RecruitDto,
  ) {
    return this.recruitService.startRecruitment(recruitDto);
  }

  @Get(':settlementId')
  async getUnfinishedJobs(@Param('settlementId') settlementId: string) {
    return this.recruitService.getUnfinishedJobsBySettlementId(settlementId);
  }
}
