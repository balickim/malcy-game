import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SettlementsDto } from '~/models/settlements/dtos/settlements.dto';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';
import { UsersEntity } from '~/models/users/entities/users.entity';

@Injectable()
export class SettlementsService {
  private readonly logger = new Logger(SettlementsService.name);

  constructor(
    @InjectRepository(SettlementsEntity)
    private settlementsEntityRepository: Repository<SettlementsEntity>,
  ) {}

  async createSettlement(settlementData: SettlementsDto, user: UsersEntity) {
    const { lat, lng, name } = settlementData;

    const locationGeoJSON: GeoJSON.Point = {
      type: 'Point',
      coordinates: [lng, lat],
    };

    const newSettlement = this.settlementsEntityRepository.create({
      name: name,
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
}
