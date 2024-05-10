import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DiscoveredAreaEntity } from '~/modules/fog-of-war/entities/discovered-area.entity';
import { VisibleAreaEntity } from '~/modules/fog-of-war/entities/visible-area.entity';

@Injectable()
export class FogOfWarService {
  private readonly logger = new Logger(FogOfWarService.name);

  constructor(
    @InjectRepository(DiscoveredAreaEntity)
    private discoveredAreaEntityRepository: Repository<DiscoveredAreaEntity>,
    @InjectRepository(VisibleAreaEntity)
    private visibleAreaEntityRepository: Repository<VisibleAreaEntity>,
  ) {}

  public async findAllDiscoveredByUser(userId: string) {
    const areas = await this.discoveredAreaEntityRepository
      .createQueryBuilder()
      .select('ST_AsGeoJSON((ST_Dump(area)).geom)::json', 'area')
      .where('"userId" = :userId', { userId })
      .getRawMany();

    const convertedAreas = areas.map((result) => {
      const geoJson = result.area;

      if (geoJson.type === 'Polygon') {
        return geoJson.coordinates[0].map(([lng, lat]) => [lat, lng]);
      } else {
        console.warn('Unexpected GeoJSON type:', geoJson.type);
        return [];
      }
    });

    return convertedAreas;
  }

  public async findAllVisibleByUser(userId: string) {
    const areas = await this.visibleAreaEntityRepository
      .createQueryBuilder()
      .select('ST_AsGeoJSON((ST_Dump(area)).geom)::json', 'area')
      .where('"userId" = :userId', { userId })
      .getRawMany();

    const convertedAreas = areas.map((result) => {
      const geoJson = result.area;

      if (geoJson.type === 'Polygon') {
        return geoJson.coordinates[0].map(([lng, lat]) => [lat, lng]);
      } else {
        console.warn('Unexpected GeoJSON type:', geoJson.type);
        return [];
      }
    });

    return convertedAreas;
  }

  public async updateDiscoveredArea(
    userId: string,
    lat: number,
    lng: number,
    radiusInMeters: number,
  ) {
    await this.updateVisibleArea(userId, lat, lng, radiusInMeters);

    const newPolygon = () =>
      `ST_Buffer(ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusInMeters})::geometry`;

    const discoveredArea = await this.discoveredAreaEntityRepository.findOne({
      where: { userId },
    });

    if (discoveredArea) {
      await this.discoveredAreaEntityRepository
        .createQueryBuilder()
        .update(DiscoveredAreaEntity)
        .set({
          area: () => `ST_Multi(ST_Union(area, ${newPolygon()}))`,
        })
        .where('id = :id', { id: discoveredArea.id })
        .execute();
    } else {
      // @ts-expect-error area needs to be executed () =>
      const newArea = this.discoveredAreaEntityRepository.create({
        userId,
        area: () => newPolygon(),
      });

      await this.discoveredAreaEntityRepository.save(newArea);
    }
  }

  public async updateVisibleArea(
    userId: string,
    lat: number,
    lng: number,
    radiusInMeters: number,
  ) {
    const newPolygon = () =>
      `ST_Buffer(ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusInMeters})::geometry`;

    const visibleArea = await this.visibleAreaEntityRepository.findOne({
      where: { userId },
    });

    if (visibleArea) {
      await this.visibleAreaEntityRepository
        .createQueryBuilder()
        .update(VisibleAreaEntity)
        .set({
          area: () => newPolygon(),
        })
        .where('id = :id', { id: visibleArea.id })
        .execute();
    } else {
      // @ts-expect-error area needs to be executed () =>
      const newArea = this.visibleAreaEntityRepository.create({
        userId,
        area: () => newPolygon(),
      });

      await this.visibleAreaEntityRepository.save(newArea);
    }
  }
}
