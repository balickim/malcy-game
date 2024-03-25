import { Test, TestingModule } from '@nestjs/testing';
import { Redis } from 'ioredis';
import { mockDeep } from 'jest-mock-extended';

import { UserLocationService } from './user-location.service';

describe('UserLocationService', () => {
  let service: UserLocationService;
  let redisMock;

  beforeEach(async () => {
    redisMock = mockDeep<Redis>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'RedisModule:default',
          useValue: redisMock,
        },
        UserLocationService,
      ],
    }).compile();

    service = module.get<UserLocationService>(UserLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkProximity', () => {
    it('should return true if there is no previous location', async () => {
      redisMock.geopos.mockResolvedValue([null]);

      const result = await service.checkProximity({
        userId: 'user1',
        currentLatitude: 1.0,
        currentLongitude: 1.0,
        radius: 100,
      });

      expect(result).toBe(true);
    });

    it('should correctly mock geopos method', async () => {
      redisMock.geopos.mockResolvedValue([[1.0, 2.0]]);
      redisMock.hget.mockResolvedValue('1234567890');
      redisMock.geodist.mockResolvedValue('100');
      const proximityCheck = await service.checkProximity({
        userId: 'testUserId',
        currentLatitude: 1.0,
        currentLongitude: 2.0,
        radius: 100,
      });

      expect(proximityCheck).toBe(true);
      expect(redisMock.geopos).toHaveBeenCalledWith(
        'userLocations',
        'testUserId',
      );
      expect(redisMock.hget).toHaveBeenCalledWith(
        'user:location:timestamp',
        'testUserId',
      );
    });
  });
});
