import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ArmyEntity } from '~/modules/armies/entities/armies.entity';
import PickUpArmyDto from '~/modules/settlements/dtos/pickUpArmy.dto';
import PutDownArmyDto from '~/modules/settlements/dtos/putDownArmy.dto';
import { SettlementsDto } from '~/modules/settlements/dtos/settlements.dto';
import { SettlementsEntity } from '~/modules/settlements/entities/settlements.entity';
import { UserLocationService } from '~/modules/user-location/user-location.service';
import { UsersEntity } from '~/modules/users/entities/users.entity';

@Injectable()
export class SettlementsService {
  private readonly logger = new Logger(SettlementsService.name);

  constructor(
    @InjectRepository(SettlementsEntity)
    private settlementsEntityRepository: Repository<SettlementsEntity>,
    @InjectRepository(ArmyEntity)
    private armyEntityRepository: Repository<ArmyEntity>,
    private userLocationService: UserLocationService,
  ) {}

  async createSettlement(settlementData: { name: string }, user: UsersEntity) {
    const userLocation = await this.userLocationService.getUserLocation({
      userId: user.id,
    });

    const locationGeoJSON: GeoJSON.Point = {
      type: 'Point',
      coordinates: [userLocation.lng, userLocation.lat],
    };

    const newSettlement = this.settlementsEntityRepository.create({
      name: settlementData.name,
      location: locationGeoJSON,
      user,
    });

    return this.settlementsEntityRepository.save(newSettlement);
  }

  async findSettlementsInBounds(
    southWest: { lat: number; lng: number },
    northEast: { lat: number; lng: number },
  ): Promise<SettlementsDto[]> {
    try {
      const query = this.settlementsEntityRepository
        .createQueryBuilder('settlement')
        .select([
          'settlement.id AS id',
          'settlement.name AS name',
          'settlement.type AS type',
          'ST_X(settlement.location) AS lng',
          'ST_Y(settlement.location) AS lat',
        ])
        .leftJoinAndSelect('settlement.user', 'user')
        .where(
          `settlement.location && ST_MakeEnvelope(:southWestLng, :southWestLat, :northEastLng, :northEastLat, 4326)`,
          {
            southWestLng: southWest.lng,
            southWestLat: southWest.lat,
            northEastLng: northEast.lng,
            northEastLat: northEast.lat,
          },
        );

      const rawResults = await query.getRawMany();

      return rawResults.map((result) => {
        return {
          id: result.id,
          name: result.name,
          type: result.type,
          lng: result.lng,
          lat: result.lat,
          user: {
            id: result.user_id,
            nick: result.user_nick,
            email: result.user_email,
            createdAt: result.user_createdAt,
            updatedAt: result.user_updatedAt,
            deletedAt: result.user_deletedAt,
          },
        };
      });
    } catch (e) {
      this.logger.error(
        `FINDING SETTLEMENTS IN BOUNDS southWest.lat:${southWest.lat}, southWest.lng:${southWest.lng}, northEast.lat:${northEast.lat}, northEast.lng:${northEast.lng} FAILED`,
      );
    }
  }

  async getUsersSettlementGarrisonById(id: string, user: UsersEntity) {
    const settlement = await this.settlementsEntityRepository.findOne({
      where: { id },
      relations: ['user', 'army'],
    });
    if (!settlement)
      throw new NotFoundException(`Settlement not found with ID: ${id}`);

    if (settlement.user.id !== user.id) {
      throw new NotFoundException(
        `User does not own settlement with ID: ${id}`,
      );
    }

    return settlement.army;
  }

  async getSettlementById(id: string) {
    const settlement = await this.settlementsEntityRepository.findOne({
      where: { id },
      relations: ['user', 'army'],
    });
    if (!settlement)
      throw new NotFoundException(`Settlement not found with ID: ${id}`);

    return settlement;
  }

  async pickUpArmy(
    pickUpArmyDto: PickUpArmyDto,
    settlement: SettlementsEntity,
  ) {
    if (
      settlement.army.knights < pickUpArmyDto.knights ||
      settlement.army.archers < pickUpArmyDto.archers
    ) {
      throw new NotFoundException('Not enough troops in the settlement');
    }

    settlement.army.knights -= pickUpArmyDto.knights;
    settlement.army.archers -= pickUpArmyDto.archers;

    const userArmy = await this.armyEntityRepository.findOne({
      where: { userId: settlement.user.id },
    });

    userArmy.knights += pickUpArmyDto.knights;
    userArmy.archers += pickUpArmyDto.archers;

    await this.armyEntityRepository.save(settlement.army);
    await this.armyEntityRepository.save(userArmy);

    return {
      userArmy: {
        knights: userArmy.knights,
        archers: userArmy.archers,
      },
      settlementArmy: {
        knights: settlement.army.knights,
        archers: settlement.army.archers,
      },
    };
  }

  async putDownArmy(
    putDownArmyDto: PutDownArmyDto,
    settlement: SettlementsEntity,
  ) {
    const userArmy = await this.armyEntityRepository.findOne({
      where: { userId: settlement.user.id },
    });

    if (
      userArmy.knights < putDownArmyDto.knights ||
      userArmy.archers < putDownArmyDto.archers
    ) {
      throw new NotFoundException('Not enough troops in the user army');
    }

    userArmy.knights -= putDownArmyDto.knights;
    userArmy.archers -= putDownArmyDto.archers;

    settlement.army.knights += putDownArmyDto.knights;
    settlement.army.archers += putDownArmyDto.archers;

    await this.armyEntityRepository.save(settlement.army);
    await this.armyEntityRepository.save(userArmy);

    return {
      userArmy: {
        knights: userArmy.knights,
        archers: userArmy.archers,
      },
      settlementArmy: {
        knights: settlement.army.knights,
        archers: settlement.army.archers,
      },
    };
  }
}
