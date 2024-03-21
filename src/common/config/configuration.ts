export default () => ({
  FE_APP_HOST: process.env.FE_APP_HOST,
  PORT: parseInt(process.env.PORT, 10) || 3000,

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
    SYNCHRONIZE: Boolean(process.env.SYNCHRONIZE) || false,
  },
});
