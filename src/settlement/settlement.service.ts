import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettlementEntity } from '~/settlement/entities/settlement.entity';

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(SettlementEntity)
    private settlementRepository: Repository<SettlementEntity>,
  ) {}

  async createSettlement(
    settlementData: Partial<SettlementEntity>,
  ): Promise<SettlementEntity> {
    const newSettlement = this.settlementRepository.create(settlementData);
    return this.settlementRepository.save(newSettlement);
  }

  async findSettlementsInBounds(
    southWest: { lat: number; lng: number },
    northEast: { lat: number; lng: number },
  ): Promise<SettlementEntity[]> {
    // Directly using ST_MakeEnvelope to create the bounding box geometry
    const query = this.settlementRepository
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
