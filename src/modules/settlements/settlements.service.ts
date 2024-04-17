import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GeoJSON, Repository } from 'typeorm';

import { ArmyEntity, UnitType } from '~/modules/armies/entities/armies.entity';
import { ActionType } from '~/modules/event-log/entities/event-log.entity';
import { EventLogService } from '~/modules/event-log/event-log.service';
import { SettlementsDto } from '~/modules/settlements/dtos/settlements.dto';
import TransferArmyDto from '~/modules/settlements/dtos/transferArmyDto';
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
    private eventLogService: EventLogService,
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

    try {
      const settlement =
        await this.settlementsEntityRepository.save(newSettlement);
      this.logger.log(`CREATED NEW SETTLEMENT WITH ID: ${settlement.id}`);
      this.eventLogService
        .logEvent({
          actionType: ActionType.settlementCreated,
          actionByUserId: user.id,
        })
        .catch((error) =>
          this.logger.error(`FAILED TO LOG EVENT --${error}--`),
        );
    } catch (error) {
      this.logger.log(`CREATED NEW SETTLEMENT FAILED: --${error}--`);
    }
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
            username: result.user_username,
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
    pickUpArmyDto: TransferArmyDto,
    settlement: SettlementsEntity,
  ) {
    if (
      settlement.army[UnitType.SWORDSMAN] < pickUpArmyDto[UnitType.SWORDSMAN] ||
      settlement.army[UnitType.ARCHER] < pickUpArmyDto[UnitType.ARCHER] ||
      settlement.army[UnitType.KNIGHT] < pickUpArmyDto[UnitType.KNIGHT] ||
      settlement.army[UnitType.LUCHADOR] < pickUpArmyDto[UnitType.LUCHADOR] ||
      settlement.army[UnitType.ARCHMAGE] < pickUpArmyDto[UnitType.ARCHMAGE]
    ) {
      throw new NotFoundException('Not enough troops in the settlement');
    }

    settlement.army[UnitType.SWORDSMAN] -= pickUpArmyDto[UnitType.SWORDSMAN];
    settlement.army[UnitType.ARCHER] -= pickUpArmyDto[UnitType.ARCHER];
    settlement.army[UnitType.KNIGHT] -= pickUpArmyDto[UnitType.KNIGHT];
    settlement.army[UnitType.LUCHADOR] -= pickUpArmyDto[UnitType.LUCHADOR];
    settlement.army[UnitType.ARCHMAGE] -= pickUpArmyDto[UnitType.ARCHMAGE];

    const userArmy = await this.armyEntityRepository.findOne({
      where: { userId: settlement.user.id },
    });

    userArmy[UnitType.SWORDSMAN] += pickUpArmyDto[UnitType.SWORDSMAN];
    userArmy[UnitType.ARCHER] += pickUpArmyDto[UnitType.ARCHER];
    userArmy[UnitType.KNIGHT] += pickUpArmyDto[UnitType.KNIGHT];
    userArmy[UnitType.LUCHADOR] += pickUpArmyDto[UnitType.LUCHADOR];
    userArmy[UnitType.ARCHMAGE] += pickUpArmyDto[UnitType.ARCHMAGE];

    await this.armyEntityRepository.save(settlement.army);
    await this.armyEntityRepository.save(userArmy);

    return {
      userArmy: {
        [UnitType.SWORDSMAN]: userArmy[UnitType.SWORDSMAN],
        [UnitType.ARCHER]: userArmy[UnitType.ARCHER],
        [UnitType.KNIGHT]: userArmy[UnitType.KNIGHT],
        [UnitType.LUCHADOR]: userArmy[UnitType.LUCHADOR],
        [UnitType.ARCHMAGE]: userArmy[UnitType.ARCHMAGE],
      },
      settlementArmy: {
        [UnitType.SWORDSMAN]: settlement.army[UnitType.SWORDSMAN],
        [UnitType.ARCHER]: settlement.army[UnitType.ARCHER],
        [UnitType.KNIGHT]: settlement.army[UnitType.KNIGHT],
        [UnitType.LUCHADOR]: settlement.army[UnitType.LUCHADOR],
        [UnitType.ARCHMAGE]: settlement.army[UnitType.ARCHMAGE],
      },
    };
  }

  async putDownArmy(
    putDownArmyDto: TransferArmyDto,
    settlement: SettlementsEntity,
  ) {
    const userArmy = await this.armyEntityRepository.findOne({
      where: { userId: settlement.user.id },
    });

    if (
      userArmy[UnitType.SWORDSMAN] < putDownArmyDto[UnitType.SWORDSMAN] ||
      userArmy[UnitType.ARCHER] < putDownArmyDto[UnitType.ARCHER] ||
      userArmy[UnitType.KNIGHT] < putDownArmyDto[UnitType.KNIGHT] ||
      userArmy[UnitType.LUCHADOR] < putDownArmyDto[UnitType.LUCHADOR] ||
      userArmy[UnitType.ARCHMAGE] < putDownArmyDto[UnitType.ARCHMAGE]
    ) {
      throw new NotFoundException('Not enough troops in the user army');
    }

    userArmy[UnitType.SWORDSMAN] -= putDownArmyDto[UnitType.SWORDSMAN];
    userArmy[UnitType.ARCHER] -= putDownArmyDto[UnitType.ARCHER];
    userArmy[UnitType.KNIGHT] -= putDownArmyDto[UnitType.KNIGHT];
    userArmy[UnitType.LUCHADOR] -= putDownArmyDto[UnitType.LUCHADOR];
    userArmy[UnitType.ARCHMAGE] -= putDownArmyDto[UnitType.ARCHMAGE];

    settlement.army[UnitType.SWORDSMAN] += putDownArmyDto[UnitType.SWORDSMAN];
    settlement.army[UnitType.ARCHER] += putDownArmyDto[UnitType.ARCHER];
    settlement.army[UnitType.KNIGHT] += putDownArmyDto[UnitType.KNIGHT];
    settlement.army[UnitType.LUCHADOR] += putDownArmyDto[UnitType.LUCHADOR];
    settlement.army[UnitType.ARCHMAGE] += putDownArmyDto[UnitType.ARCHMAGE];

    await this.armyEntityRepository.save(settlement.army);
    await this.armyEntityRepository.save(userArmy);

    return {
      userArmy: {
        [UnitType.SWORDSMAN]: userArmy[UnitType.SWORDSMAN],
        [UnitType.ARCHER]: userArmy[UnitType.ARCHER],
        [UnitType.KNIGHT]: userArmy[UnitType.KNIGHT],
        [UnitType.LUCHADOR]: userArmy[UnitType.LUCHADOR],
        [UnitType.ARCHMAGE]: userArmy[UnitType.ARCHMAGE],
      },
      settlementArmy: {
        [UnitType.SWORDSMAN]: settlement.army[UnitType.SWORDSMAN],
        [UnitType.ARCHER]: settlement.army[UnitType.ARCHER],
        [UnitType.KNIGHT]: settlement.army[UnitType.KNIGHT],
        [UnitType.LUCHADOR]: settlement.army[UnitType.LUCHADOR],
        [UnitType.ARCHMAGE]: settlement.army[UnitType.ARCHMAGE],
      },
    };
  }
}
