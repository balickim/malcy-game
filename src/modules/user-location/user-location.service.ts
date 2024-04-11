import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';

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
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private configService: ConfigService,
  ) {}

  public async updateLocation(params: IUpdateLocationParams) {
    const isUserSpeedWithinLimit = await this.isUserSpeedWithinLimit({
      userId: params.userId,
      location: { lat: params.location.lat, lng: params.location.lng },
      limitMetresPerSec: 30,
    });

    if (!isUserSpeedWithinLimit) {
      throw new WsException(
        'User has moved too far too quickly. This new position will not be registered and now is out of sync with the server.',
      );
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
      this.configService.get<number>(
        'DEFAULT_MAX_RADIUS_TO_TAKE_ACTION_METERS',
      );
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

    const defaultMaxUserSpeed = this.configService.get<number>(
      'DEFAULT_MAX_USER_SPEED_METERS_PER_SECOND',
    );
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
