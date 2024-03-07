import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SettlementsEntity } from '~/models/settlement/entities/settlements.entity';
import { SettlementsDto } from '~/models/settlement/dtos/settlements.dto';

@Injectable()
export class SettlementsService {
  constructor(
    @InjectRepository(SettlementsEntity)
    private settlementsEntityRepository: Repository<SettlementsEntity>,
  ) {}

  async createSettlement(
    settlementData: Partial<SettlementsEntity>,
  ): Promise<SettlementsEntity> {
    const newSettlement =
      this.settlementsEntityRepository.create(settlementData);
    return this.settlementsEntityRepository.save(newSettlement);
  }

  async findSettlementsInBounds(
    southWest: { lat: number; lng: number },
    northEast: { lat: number; lng: number },
  ): Promise<SettlementsDto[]> {
    // Directly using ST_MakeEnvelope to create the bounding box geometry
    const query = this.settlementsEntityRepository
      .createQueryBuilder('settlement')
      // Using the && operator to check if the location intersects with the bounding box
      // Notice the direct injection of ST_MakeEnvelope into the query string
      .select([
        'settlement.id AS id',
        'settlement.name AS name',
        'ST_X(settlement.location) AS lng',
        'ST_Y(settlement.location) AS lat',
      ])
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
