import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';

export interface IUpdateLocationParams {
  userId: string;
  latitude: number;
  longitude: number;
}

const userLocationsKey = 'user:locations';
const userLocationTimestampKey = 'user:location:timestamp';
@Injectable()
export class UserLocationService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async updateLocation(params: IUpdateLocationParams): Promise<void> {
    const isWithinProximity = await this.checkProximity({
      userId: params.userId,
      currentLatitude: params.latitude,
      currentLongitude: params.longitude,
      radius: 100,
    });

    if (!isWithinProximity) {
      throw new WsException(
        'User has moved too far too quickly. This new position will not be registered and now is out of sync with the server.',
      );
    }

    await this.redis.geoadd(
      userLocationsKey,
      params.longitude,
      params.latitude,
      params.userId,
    );
    const timestamp = Date.now();
    await this.redis.hset(
      userLocationTimestampKey,
      params.userId,
      timestamp.toString(),
    );
  }

  async checkProximity(params: {
    userId: string;
    currentLatitude: number;
    currentLongitude: number;
    radius: number;
  }): Promise<boolean> {
    const userLocation = await this.redis.geopos(
      userLocationsKey,
      params.userId,
    );
    if (!userLocation[0]) return true; // accept location if there is none

    const previousTimestamp = await this.redis.hget(
      userLocationTimestampKey,
      params.userId,
    );
    const currentTimestamp = Date.now();
    const timeElapsedSec =
      (currentTimestamp - Number(previousTimestamp)) / 1000;

    // Unique temp key for current location
    const tempKey = `tempLocation:${params.userId}:${Date.now()}`;
    await this.redis.geoadd(
      userLocationsKey,
      params.currentLongitude,
      params.currentLatitude,
      tempKey,
    );
    const distance = await this.redis.geodist(
      userLocationsKey,
      params.userId,
      tempKey,
      () => 'm',
    );
    await this.redis.zrem(userLocationsKey, tempKey);
    if (!distance) return true;

    console.log('distance', distance);
    console.log('timeElapsedSec', timeElapsedSec);
    const speed = Number(distance) / timeElapsedSec;
    return speed <= 10;
  }
}