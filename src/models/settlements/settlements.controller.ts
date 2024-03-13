import { Controller, Get, Query } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { ApiTags } from '@nestjs/swagger';

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
}
