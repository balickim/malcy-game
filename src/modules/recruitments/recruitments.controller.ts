import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IsWithinLocation } from '~/common/decorators/is-within-location.decorator';
import { IExpressRequestWithUser } from '~/modules/auth/guards/jwt.guard';
import { RequestRecruitmentDto } from '~/modules/recruitments/dtos/recruitments.dto';
import { RecruitmentsService } from '~/modules/recruitments/recruitments.service';
import {
  IExpressRequestWithUserAndSettlement,
  NearSettlementLocationGuard,
} from '~/modules/user-location/guards/near-settlement-location.guard';

@ApiTags('recruitments')
@Controller('recruitments')
export class RecruitmentsController {
  constructor(private readonly recruitService: RecruitmentsService) {}

  @Post('/')
  @UseGuards(NearSettlementLocationGuard)
  @IsWithinLocation('settlementId')
  async startRecruitment(
    @Request() req: IExpressRequestWithUserAndSettlement,
    @Body() recruitDto: RequestRecruitmentDto,
  ) {
    return this.recruitService.startRecruitment(recruitDto, req.settlement);
  }

  @Get(':settlementId')
  async getUnfinishedJobs(@Param('settlementId') settlementId: string) {
    return this.recruitService.getUnfinishedRecruitmentsBySettlementId(
      settlementId,
    );
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
