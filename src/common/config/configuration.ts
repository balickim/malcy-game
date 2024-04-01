import { UnitType } from '~/models/armies/entities/armies.entity';
import {
  ResourceType,
  SettlementType,
} from '~/models/settlements/entities/settlements.entity';

export default () => ({
  FE_APP_HOST: process.env.FE_APP_HOST,
  PORT: parseInt(process.env.PORT, 10) || 3000,

  RECRUITMENT_TIMES_MS: {
    [SettlementType.village]: {
      [UnitType.knights]: 60_000, // 1 minute
      [UnitType.archers]: 120_000, // 2 minutes
    },
    [SettlementType.town]: {
      [UnitType.knights]: 30_000, // 30 seconds
      [UnitType.archers]: 60_000, // 1 minute
    },
    [SettlementType.city]: {
      [UnitType.knights]: 15_000, // 15 seconds
      [UnitType.archers]: 30_000, // 30 seconds
    },
  },

  SETTLEMENT_RESOURCE_MAX: {
    [ResourceType.gold]: 4_000, // Change these also in entities
    [ResourceType.wood]: 1_000, // Change these also in entities
  },
  SETTLEMENT_RESOURCE_GENERATION_BASE_VALUE: {
    [SettlementType.village]: {
      [ResourceType.wood]: 1,
      [ResourceType.gold]: 2,
    },
    [SettlementType.town]: {
      [ResourceType.wood]: 3,
      [ResourceType.gold]: 6,
    },
    [SettlementType.city]: {
      [ResourceType.wood]: 9,
      [ResourceType.gold]: 18,
    },
  },

  JWT: {
    JWT_SECRET: process.env.JWT_SECRET,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '31d',
  },
  DATABASE: {
    HOST: process.env.DB_HOST,
    PORT: parseInt(process.env.DB_PORT, 10) || 5432,
    DATABASE: process.env.DB_DATABASE,
    USERNAME: process.env.DB_USERNAME,
    PASSWORD: process.env.DB_PASSWORD,
    SYNCHRONIZE: Boolean(process.env.DB_SYNCHRONIZE) || false,
  },
  REDIS_CONNECTION_STRING: process.env.REDIS_CONNECTION_STRING,
});
