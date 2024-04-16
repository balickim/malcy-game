import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

import { ConfigService } from '~/modules/config/config.service';
import { ActionType } from '~/modules/event-log/entities/event-log.entity';
import { EventLogService } from '~/modules/event-log/event-log.service';

interface LatLng {
  lat: number;
  lng: number;
}

export interface IUpdateLocationParams {
  userId: string;
  location: LatLng;
}

const userLocationsKey = 'user:locations';
const userLocationTimestampKey = 'user:location:timestamp';
@Injectable()
export class UserLocationService {
  private readonly logger = new Logger(UserLocationService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private configService: ConfigService,
    private eventLogService: EventLogService,
  ) {}

  public async updateLocation(params: IUpdateLocationParams) {
    const isUserSpeedWithinLimit = await this.isUserSpeedWithinLimit({
      userId: params.userId,
      location: { lat: params.location.lat, lng: params.location.lng },
      limitMetresPerSec: 30,
    });

    if (!isUserSpeedWithinLimit) {
      this.logger.warn(`USER MOVED TOO FAR TOO QUICKLY ID: ${params.userId}`);
      await this.eventLogService.logEvent({
        actionType: ActionType.securityIncident,
        actionByUserId: params.userId,
        description: 'User moved too far too quickly',
      });
    }

    await this.redis.geoadd(
      userLocationsKey,
      params.location.lng,
      params.location.lat,
      params.userId,
    ); // Change old user location to new one
    await this.redis.hset(
      userLocationTimestampKey,
      params.userId,
      Date.now().toString(),
    ); // change old location timestamp to new one

    return 'success';
  }

  public async getUserLocation(params: { userId: string }) {
    const [lng, lat] = (
      await this.redis.geopos(userLocationsKey, params.userId)
    )[0];
    return { lat: Number(lat), lng: Number(lng) };
  }

  public async isUserWithinRadius(params: {
    userId: string;
    location: LatLng;
    radiusMetres?: number;
  }): Promise<boolean> {
    const defaultMaxInRadiusDistanceToTakeActionMeters =
      this.configService.gameConfig.DEFAULT_MAX_RADIUS_TO_TAKE_ACTION_METERS;
    const distance = await this.calculateDistance(params);
    return (
      distance !== null &&
      distance <=
        (params.radiusMetres || defaultMaxInRadiusDistanceToTakeActionMeters)
    );
  }

  private async isUserSpeedWithinLimit(params: {
    userId: string;
    location: LatLng;
    limitMetresPerSec?: number;
  }): Promise<boolean> {
    const distance = await this.calculateDistance(params);
    const previousTimestamp = await this.redis.hget(
      userLocationTimestampKey,
      params.userId,
    );
    const timeElapsedSec = (Date.now() - Number(previousTimestamp)) / 1000;

    const defaultMaxUserSpeed =
      this.configService.gameConfig.DEFAULT_MAX_USER_SPEED_METERS_PER_SECOND;
    return (
      distance !== null &&
      distance / timeElapsedSec <=
        (params.limitMetresPerSec || defaultMaxUserSpeed)
    );
  }

  private async calculateDistance(params: {
    userId: string;
    location: LatLng;
  }) {
    const tempLocationKey = `tempLocation:${params.userId}:${Date.now()}`;
    await this.redis.geoadd(
      userLocationsKey,
      params.location.lng,
      params.location.lat,
      tempLocationKey,
    );
    const distance = await this.redis.geodist(
      userLocationsKey,
      params.userId,
      tempLocationKey,
      () => 'm',
    );
    await this.redis.zrem(userLocationsKey, tempLocationKey);

    return distance ? Number(distance) : 0;
  }
}
