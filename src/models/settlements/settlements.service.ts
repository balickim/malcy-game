import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SettlementsDto } from '~/models/settlements/dtos/settlements.dto';
import { SettlementsEntity } from '~/models/settlements/entities/settlements.entity';

@Injectable()
export class SettlementsService {
  constructor(
    @InjectRepository(SettlementsEntity)
    private settlementsEntityRepository: Repository<SettlementsEntity>,
  ) {}

  async createSettlement(settlementData: SettlementsDto) {
    const { lat, lng, name } = settlementData;

    const locationGeoJSON: GeoJSON.Point = {
      type: 'Point',
      coordinates: [lng, lat],
    };

    const newSettlement = this.settlementsEntityRepository.create({
      name: name,
      location: locationGeoJSON,
    });

    return this.settlementsEntityRepository.save(newSettlement);
  }

  async findSettlementsInBounds(
    southWest: { lat: number; lng: number },
    northEast: { lat: number; lng: number },
  ): Promise<SettlementsDto[]> {
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

    return query.getRawMany();
  }
}
