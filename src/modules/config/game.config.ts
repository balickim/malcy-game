import { UnitType } from '~/modules/armies/entities/armies.entity';
import {
  ResourceType,
  SettlementTypes,
} from '~/modules/settlements/entities/settlements.entity';

interface ResourceCosts {
  [ResourceType.gold]?: number;
  [ResourceType.wood]?: number;
}

interface UnitRecruitment {
  COST: ResourceCosts;
  TIME_MS: number;
}

interface Recruitment {
  [UnitType.SWORDSMAN]?: UnitRecruitment;
  [UnitType.ARCHER]?: UnitRecruitment;
  [UnitType.KNIGHT]?: UnitRecruitment;
  [UnitType.LUCHADOR]?: UnitRecruitment;
  [UnitType.ARCHMAGE]?: UnitRecruitment;
}

interface ResourcesCap {
  [ResourceType.gold]: number;
  [ResourceType.wood]: number;
}

interface ResourceGenerationBase {
  [ResourceType.wood]: number;
  [ResourceType.gold]: number;
}

interface SettlementConfig {
  MAX: number | 'infinite';
  RECRUITMENT: Recruitment;
  RESOURCES_CAP: ResourcesCap;
  RESOURCE_GENERATION_BASE: ResourceGenerationBase;
}

export interface GameConfig {
  DEFAULT_MAX_RADIUS_TO_TAKE_ACTION_METERS: number;
  DEFAULT_MAX_USER_SPEED_METERS_PER_SECOND: number;
  SETTLEMENT: {
    [SettlementTypes.MINING_TOWN]: SettlementConfig;
    [SettlementTypes.CASTLE_TOWN]: SettlementConfig;
    [SettlementTypes.FORTIFIED_SETTLEMENT]: SettlementConfig;
    [SettlementTypes.CAPITOL_SETTLEMENT]: SettlementConfig;
  };
}

export const gameConfig = (): GameConfig => ({
  DEFAULT_MAX_RADIUS_TO_TAKE_ACTION_METERS: 30,
  DEFAULT_MAX_USER_SPEED_METERS_PER_SECOND: 30,

  SETTLEMENT: {
    [SettlementTypes.MINING_TOWN]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceType.gold]: 100,
            [ResourceType.wood]: 20,
          },
          TIME_MS: 60_000,
        },
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
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceType.gold]: 80,
            [ResourceType.wood]: 15,
          },
          TIME_MS: 30_000,
        },
        [UnitType.ARCHER]: {
          COST: {
            [ResourceType.gold]: 200,
            [ResourceType.wood]: 60,
          },
          TIME_MS: 60_000,
        },
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
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceType.gold]: 50,
            [ResourceType.wood]: 7,
          },
          TIME_MS: 15_000,
        },
        [UnitType.ARCHER]: {
          COST: {
            [ResourceType.gold]: 150,
            [ResourceType.wood]: 40,
          },
          TIME_MS: 30_000,
        },
        [UnitType.KNIGHT]: {
          COST: {
            [ResourceType.gold]: 400,
            [ResourceType.wood]: 200,
          },
          TIME_MS: 120_000,
        },
        [UnitType.LUCHADOR]: {
          COST: {
            [ResourceType.gold]: 1000,
            [ResourceType.wood]: 600,
          },
          TIME_MS: 280_000,
        },
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
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceType.gold]: 10,
            [ResourceType.wood]: 1,
          },
          TIME_MS: 5_000,
        },
        [UnitType.ARCHER]: {
          COST: {
            [ResourceType.gold]: 50,
            [ResourceType.wood]: 20,
          },
          TIME_MS: 10_000,
        },
        [UnitType.KNIGHT]: {
          COST: {
            [ResourceType.gold]: 150,
            [ResourceType.wood]: 70,
          },
          TIME_MS: 60_000,
        },
        [UnitType.LUCHADOR]: {
          COST: {
            [ResourceType.gold]: 400,
            [ResourceType.wood]: 200,
          },
          TIME_MS: 90_000,
        },
        [UnitType.ARCHMAGE]: {
          COST: {
            [ResourceType.gold]: 1000,
            [ResourceType.wood]: 400,
          },
          TIME_MS: 120_000,
        },
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
});
