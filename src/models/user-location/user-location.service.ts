import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import Redis from 'ioredis';

export interface IUpdateLocationParams {
  userId: string;
  latitude: number;
  longitude: number;
}

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
      throw new WsException('User has moved too far too quickly.');
    }

    await this.redis.geoadd(
      'userLocations',
      params.longitude,
      params.latitude,
      params.userId,
    );
    const timestamp = Date.now();
    await this.redis.hset(
      `user:location:timestamp`,
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
      'userLocations',
      params.userId,
    );
    if (!userLocation[0]) return true; // accept location if there is none

    const previousTimestamp = await this.redis.hget(
      'user:location:timestamp',
      params.userId,
    );
    const currentTimestamp = Date.now();
    const timeElapsedSec =
      (currentTimestamp - Number(previousTimestamp)) / 1000;

    // Unique temp key for current location
    const tempKey = `tempLocation:${params.userId}:${Date.now()}`;
    await this.redis.geoadd(
      'userLocations',
      params.currentLongitude,
      params.currentLatitude,
      tempKey,
    );
    const distance = await this.redis.geodist(
      'userLocations',
      params.userId,
      tempKey,
      () => 'm',
    );
    await this.redis.zrem('userLocations', tempKey);
    if (!distance) return true;

    console.log('distance', distance);
    console.log('timeElapsedSec', timeElapsedSec);
    const speed = Number(distance) / timeElapsedSec;
    return speed <= 10;
  }
}
