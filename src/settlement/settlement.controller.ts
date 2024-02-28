import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { SettlementEntity } from '~/settlement/entities/settlement.entity';

@Controller('settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post()
  create(@Body() settlementData: Partial<SettlementEntity>) {
    return this.settlementService.createSettlement(settlementData);
  }

  @Get('/nearby')
  findNearby(@Query('lat') lat: string, @Query('lng') lng: string) {
    // Convert query parameters to numbers before passing to the service
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    // Ensure the lat and lng are valid numbers
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid latitude or longitude');
    }

    return this.settlementService.findSettlementsWithinRadius(
      latitude,
      longitude,
    );
  }

  @Get('/bounds')
  findInBounds(
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

    return this.settlementService.findSettlementsInBounds(southWest, northEast);
  }
}
