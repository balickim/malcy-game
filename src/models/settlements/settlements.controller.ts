import { Body, Controller, Get, Post, Query, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IExpressRequestWithUser } from '~/models/auth/guards/jwt.guard';
import { SettlementsDto } from '~/models/settlements/dtos/settlements.dto';

import { SettlementsService } from './settlements.service';

@ApiTags('settlements')
@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get('/bounds')
  async findInBounds(
    @Query('southWestLat') southWestLat: string,
    @Query('southWestLng') southWestLng: string,
    @Query('northEastLat') northEastLat: string,
    @Query('northEastLng') northEastLng: string,
  ) {
    const southWest = {
      lat: parseFloat(southWestLat),
      lng: parseFloat(southWestLng),
    };
    const northEast = {
      lat: parseFloat(northEastLat),
      lng: parseFloat(northEastLng),
    };

    return await this.settlementsService.findSettlementsInBounds(
      southWest,
      northEast,
    );
  }

  @Post('/')
  async createSettlement(
    @Request() req: IExpressRequestWithUser,
    @Body() settlementData: SettlementsDto,
  ) {
    return this.settlementsService.createSettlement(settlementData, req.user);
  }
}
