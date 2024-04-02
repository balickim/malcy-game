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
import { RequestRecruitmentDto } from '~/models/recruitments/dtos/recruitments.dto';
import { RecruitmentsService } from '~/models/recruitments/recruitments.service';

@ApiTags('recruit')
@Controller('recruit')
export class RecruitmentsController {
  constructor(private readonly recruitService: RecruitmentsService) {}

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
