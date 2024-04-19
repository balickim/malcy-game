import { UnitType } from '~/modules/armies/entities/armies.entity';
import {
  ResourceType,
  SettlementTypes,
} from '~/modules/settlements/entities/settlements.entity';

export const gameConfig = () => ({
  SETTLEMENT: {
    [SettlementTypes.MINING_TOWN]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: 60_000, // 1 minute
      },
      RESOURCES_CAP: {
        [ResourceType.gold]: 4_000, // must be also changed in settlements.entity.ts
        [ResourceType.wood]: 1_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceType.wood]: 1,
        [ResourceType.gold]: 2,
      },
    },
    [SettlementTypes.CASTLE_TOWN]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: 30_000,
        [UnitType.ARCHER]: 60_000,
      },
      RESOURCES_CAP: {
        [ResourceType.gold]: 8_000, // must be also changed in settlements.entity.ts
        [ResourceType.wood]: 2_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceType.wood]: 2,
        [ResourceType.gold]: 4,
      },
    },
    [SettlementTypes.FORTIFIED_SETTLEMENT]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: 15_000,
        [UnitType.ARCHER]: 30_000,
        [UnitType.KNIGHT]: 120_000,
        [UnitType.LUCHADOR]: 280_000,
      },
      RESOURCES_CAP: {
        [ResourceType.gold]: 16_000, // must be also changed in settlements.entity.ts
        [ResourceType.wood]: 4_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceType.wood]: 4,
        [ResourceType.gold]: 8,
      },
    },
    [SettlementTypes.CAPITOL_SETTLEMENT]: {
      MAX: 1,
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: 5_000,
        [UnitType.ARCHER]: 10_000,
        [UnitType.KNIGHT]: 60_000,
        [UnitType.LUCHADOR]: 90_000,
        [UnitType.ARCHMAGE]: 120_000,
      },
      RESOURCES_CAP: {
        [ResourceType.gold]: 100_000, // must be also changed in settlements.entity.ts
        [ResourceType.wood]: 80_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceType.wood]: 30,
        [ResourceType.gold]: 60,
      },
    },
  },
  DEFAULT_MAX_RADIUS_TO_TAKE_ACTION_METERS: 30,
  DEFAULT_MAX_USER_SPEED_METERS_PER_SECOND: 30,
});
