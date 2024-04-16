import { UnitType } from '~/modules/armies/entities/armies.entity';
import {
  ResourceType,
  SettlementTypes,
} from '~/modules/settlements/entities/settlements.entity';

// export enum UnitType {
//   SWORDSMAN = 'swordsman',
//   ARCHER = 'archer',
//   KNIGHT = 'knight',
//   LUCHADOR = 'luchador',
//   ARCHMAGE = 'archmage',
// }

export const gameConfig = () => ({
  SETTLEMENT: {
    [SettlementTypes.MINING_TOWN]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.knights]: 60_000, // 1 minute
        [UnitType.archers]: 120_000, // 2 minutes
      },
      RESOURCES_CAP: {
        [ResourceType.gold]: 4_000, // Change these also in entities
        [ResourceType.wood]: 1_000, // Change these also in entities
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceType.wood]: 1,
        [ResourceType.gold]: 2,
      },
    },
    [SettlementTypes.CASTLE_TOWN]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.knights]: 30_000,
        [UnitType.archers]: 60_000,
      },
      RESOURCES_CAP: {
        [ResourceType.gold]: 8_000,
        [ResourceType.wood]: 2_000,
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceType.wood]: 2,
        [ResourceType.gold]: 4,
      },
    },
    [SettlementTypes.FORTIFIED_SETTLEMENT]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.knights]: 15_000,
        [UnitType.archers]: 30_000,
      },
      RESOURCES_CAP: {
        [ResourceType.gold]: 16_000,
        [ResourceType.wood]: 4_000,
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceType.wood]: 4,
        [ResourceType.gold]: 8,
      },
    },
    [SettlementTypes.CAPITOL_SETTLEMENT]: {
      MAX: 1,
      RECRUITMENT: {
        [UnitType.knights]: 5_000,
        [UnitType.archers]: 10_000,
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
