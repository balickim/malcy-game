import { CronExpression } from '@nestjs/schedule';

import { UnitType } from '~/modules/armies/entities/armies.entity';
import {
  ResourceTypeEnum,
  SettlementTypesEnum,
} from '~/modules/settlements/entities/settlements.entity';

export interface IResource {
  [ResourceTypeEnum.gold]: number;
  [ResourceTypeEnum.wood]: number;
}

interface UnitRecruitment {
  COST: IResource;
  TIME_MS: number;
}

interface Recruitment {
  [UnitType.SWORDSMAN]?: UnitRecruitment;
  [UnitType.ARCHER]?: UnitRecruitment;
  [UnitType.KNIGHT]?: UnitRecruitment;
  [UnitType.LUCHADOR]?: UnitRecruitment;
  [UnitType.ARCHMAGE]?: UnitRecruitment;
}

interface SettlementConfig {
  MAX: number | 'infinite';
  RECRUITMENT: Recruitment;
  RESOURCES_CAP: IResource;
  RESOURCE_GENERATION_BASE: IResource;
}

export interface GameConfig {
  DEFAULT_MAX_RADIUS_TO_TAKE_ACTION_METERS: number;
  PLAYER_DISCOVER_RADIUS_METERS: number;
  DEFAULT_MAX_USER_SPEED_METERS_PER_SECOND: number;
  USER_IS_ONLINE_SECONDS: number;
  DEFAULT_RESOURCE_DISPOSITION_RATE: CronExpression;
  SETTLEMENT: {
    [SettlementTypesEnum.MINING_TOWN]: SettlementConfig;
    [SettlementTypesEnum.CASTLE_TOWN]: SettlementConfig;
    [SettlementTypesEnum.FORTIFIED_SETTLEMENT]: SettlementConfig;
    [SettlementTypesEnum.CAPITOL_SETTLEMENT]: SettlementConfig;
  };
}

export const gameConfig = (): GameConfig => ({
  DEFAULT_MAX_RADIUS_TO_TAKE_ACTION_METERS: 30,
  DEFAULT_MAX_USER_SPEED_METERS_PER_SECOND: 30,
  PLAYER_DISCOVER_RADIUS_METERS: 300,
  USER_IS_ONLINE_SECONDS: 60,
  DEFAULT_RESOURCE_DISPOSITION_RATE: CronExpression.EVERY_10_SECONDS,

  SETTLEMENT: {
    [SettlementTypesEnum.MINING_TOWN]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceTypeEnum.gold]: 100,
            [ResourceTypeEnum.wood]: 20,
          },
          TIME_MS: 60_000,
        },
      },
      RESOURCES_CAP: {
        [ResourceTypeEnum.gold]: 4_000, // must be also changed in settlements.entity.ts
        [ResourceTypeEnum.wood]: 1_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceTypeEnum.wood]: 1,
        [ResourceTypeEnum.gold]: 2,
      },
    },

    [SettlementTypesEnum.CASTLE_TOWN]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceTypeEnum.gold]: 80,
            [ResourceTypeEnum.wood]: 15,
          },
          TIME_MS: 30_000,
        },
        [UnitType.ARCHER]: {
          COST: {
            [ResourceTypeEnum.gold]: 200,
            [ResourceTypeEnum.wood]: 60,
          },
          TIME_MS: 60_000,
        },
      },
      RESOURCES_CAP: {
        [ResourceTypeEnum.gold]: 8_000, // must be also changed in settlements.entity.ts
        [ResourceTypeEnum.wood]: 2_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceTypeEnum.wood]: 2,
        [ResourceTypeEnum.gold]: 4,
      },
    },

    [SettlementTypesEnum.FORTIFIED_SETTLEMENT]: {
      MAX: 'infinite',
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceTypeEnum.gold]: 50,
            [ResourceTypeEnum.wood]: 7,
          },
          TIME_MS: 15_000,
        },
        [UnitType.ARCHER]: {
          COST: {
            [ResourceTypeEnum.gold]: 150,
            [ResourceTypeEnum.wood]: 40,
          },
          TIME_MS: 30_000,
        },
        [UnitType.KNIGHT]: {
          COST: {
            [ResourceTypeEnum.gold]: 400,
            [ResourceTypeEnum.wood]: 200,
          },
          TIME_MS: 120_000,
        },
        [UnitType.LUCHADOR]: {
          COST: {
            [ResourceTypeEnum.gold]: 1000,
            [ResourceTypeEnum.wood]: 600,
          },
          TIME_MS: 280_000,
        },
      },
      RESOURCES_CAP: {
        [ResourceTypeEnum.gold]: 16_000, // must be also changed in settlements.entity.ts
        [ResourceTypeEnum.wood]: 4_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceTypeEnum.wood]: 4,
        [ResourceTypeEnum.gold]: 8,
      },
    },

    [SettlementTypesEnum.CAPITOL_SETTLEMENT]: {
      MAX: 1,
      RECRUITMENT: {
        [UnitType.SWORDSMAN]: {
          COST: {
            [ResourceTypeEnum.gold]: 10,
            [ResourceTypeEnum.wood]: 1,
          },
          TIME_MS: 5_000,
        },
        [UnitType.ARCHER]: {
          COST: {
            [ResourceTypeEnum.gold]: 50,
            [ResourceTypeEnum.wood]: 20,
          },
          TIME_MS: 10_000,
        },
        [UnitType.KNIGHT]: {
          COST: {
            [ResourceTypeEnum.gold]: 150,
            [ResourceTypeEnum.wood]: 70,
          },
          TIME_MS: 60_000,
        },
        [UnitType.LUCHADOR]: {
          COST: {
            [ResourceTypeEnum.gold]: 400,
            [ResourceTypeEnum.wood]: 200,
          },
          TIME_MS: 90_000,
        },
        [UnitType.ARCHMAGE]: {
          COST: {
            [ResourceTypeEnum.gold]: 1000,
            [ResourceTypeEnum.wood]: 400,
          },
          TIME_MS: 120_000,
        },
      },
      RESOURCES_CAP: {
        [ResourceTypeEnum.gold]: 100_000, // must be also changed in settlements.entity.ts
        [ResourceTypeEnum.wood]: 80_000, // must be also changed in settlements.entity.ts
      },
      RESOURCE_GENERATION_BASE: {
        [ResourceTypeEnum.wood]: 30,
        [ResourceTypeEnum.gold]: 60,
      },
    },
  },
});
