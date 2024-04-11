import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { IsWithinLocation } from '~/common/decorators/is-within-location.decorator';
import { ResponseMessage } from '~/common/decorators/response_message.decorator';
import { IExpressRequestWithUser } from '~/modules/auth/guards/jwt.guard';
import PickUpArmyDto from '~/modules/settlements/dtos/pickUpArmy.dto';
import PutDownArmyDto from '~/modules/settlements/dtos/putDownArmy.dto';
import {
  IExpressRequestWithUserAndSettlement,
  NearSettlementLocationGuard,
} from '~/modules/user-location/guards/near-settlement-location.guard';

import { SettlementsService } from './settlements.service';

@ApiTags('settlements')
@Controller('settlements')
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get('/bounds')
  @ResponseMessage('Fetched Settlements Succesfully')
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
    @Body() settlementData: { name: string },
  ) {
    return this.settlementsService.createSettlement(settlementData, req.user);
  }

  @Get(':id')
  async getSettlementById(
    @Request() req: IExpressRequestWithUser,
    @Param() params: { id: string },
  ) {
    return this.settlementsService.getUsersSettlementGarrisonById(
      params.id,
      req.user,
    );
  }

  @Post('/pick-up-army')
  @UseGuards(NearSettlementLocationGuard)
  @IsWithinLocation('settlementId')
  @ResponseMessage('Army transferred successfully')
  async pickUpArmy(
    @Request() req: IExpressRequestWithUserAndSettlement,
    @Body() pickUpArmyDto: PickUpArmyDto,
  ) {
    return this.settlementsService.pickUpArmy(pickUpArmyDto, req.settlement);
  }

  @Post('/put-down-army')
  @UseGuards(NearSettlementLocationGuard)
  @IsWithinLocation('settlementId')
  @ResponseMessage('Army transferred successfully')
  async putDownArmy(
    @Request() req: IExpressRequestWithUserAndSettlement,
    @Body() putDownArmyDto: PutDownArmyDto,
  ) {
    return this.settlementsService.putDownArmy(putDownArmyDto, req.settlement);
  }
}
