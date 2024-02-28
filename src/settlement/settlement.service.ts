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

  // TODO: Replace this method with a PostGIS query for accurate geospatial queries
  async findSettlementsWithinRadius(
    lat: number,
    lng: number,
  ): Promise<SettlementEntity[]> {
    // This is a simplified calculation and might not be accurate for large distances or close to the poles.
    const earthRadiusInKm = 6371;
    const radiusInKm = 1; // search within 1 km radius

    const settlements = await this.settlementRepository.find();
    return settlements.filter((settlement) => {
      const dLat = this.deg2rad(settlement.lat - lat);
      const dLng = this.deg2rad(settlement.lng - lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat)) *
          Math.cos(this.deg2rad(settlement.lat)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = earthRadiusInKm * c; // Distance in km
      return distance <= radiusInKm;
    });
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async findSettlementsInBounds(
    southWest: { lat: number; lng: number },
    northEast: { lat: number; lng: number },
  ): Promise<SettlementEntity[]> {
    return this.settlementRepository
      .createQueryBuilder('settlement')
      .where(
        'settlement.lat >= :southLat AND settlement.lat <= :northLat AND settlement.lng >= :westLng AND settlement.lng <= :eastLng',
        {
          southLat: southWest.lat,
          northLat: northEast.lat,
          westLng: southWest.lng,
          eastLng: northEast.lng,
        },
      )
      .getMany();
  }
}
