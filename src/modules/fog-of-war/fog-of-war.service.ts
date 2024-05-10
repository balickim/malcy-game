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
    const areas = await this.discoveredAreaEntityRepository.find({
      where: { userId },
      select: ['area', 'id'],
    });

    const convertedAreas = await Promise.all(
      areas.map(async (area) => {
        const result = await this.discoveredAreaEntityRepository
          .createQueryBuilder()
          .select('ST_AsGeoJSON(area)::json', 'area')
          .where('id = :id', { id: area.id })
          .getRawOne();

        const geoJson = result.area;

        if (geoJson.type === 'MultiPolygon') {
          return geoJson.coordinates[0][0].map(([lng, lat]) => [lat, lng]);
        } else if (geoJson.type === 'Polygon') {
          return geoJson.coordinates[0].map(([lng, lat]) => [lat, lng]);
        }
      }),
    );

    return convertedAreas;
  }

  public async findAllVisibleByUser(userId: string) {
    const areas = await this.visibleAreaEntityRepository.find({
      where: { userId },
      select: ['area', 'id'],
    });

    const convertedAreas = await Promise.all(
      areas.map(async (area) => {
        const result = await this.visibleAreaEntityRepository
          .createQueryBuilder()
          .select('ST_AsGeoJSON(area)::json', 'area')
          .where('id = :id', { id: area.id })
          .getRawOne();

        const geoJson = result.area;

        if (geoJson.type === 'MultiPolygon') {
          return geoJson.coordinates[0][0].map(([lng, lat]) => [lat, lng]);
        } else if (geoJson.type === 'Polygon') {
          return geoJson.coordinates[0].map(([lng, lat]) => [lat, lng]);
        }
      }),
    );

    return convertedAreas;
  }

  public async updateDiscoveredArea(
    userId: string,
    lat: number,
    lng: number,
    radiusInMeters: number,
  ) {
    await this.updateVisibleArea(userId, lat, lng, radiusInMeters);

    const sides = 64;

    const newPolygon = () =>
      `ST_Transform(ST_Buffer(ST_Transform(ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), 3857), ${radiusInMeters}, 'quad_segs=${sides}'), 4326)`;

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
      const newArea = this.fogOfWarEntityRepository.create({
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
    const sides = 64;

    const newPolygon = () =>
      `ST_Transform(ST_Buffer(ST_Transform(ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), 3857), ${radiusInMeters}, 'quad_segs=${sides}'), 4326)`;

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
