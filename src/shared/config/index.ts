import { Dialect } from 'sequelize';
import * as dotenv from 'dotenv';
import * as path from 'path';
const { version } = require('../../../package.json');
dotenv.config({
  path: process.env.NODE_ENV == 'test' ? path.resolve(process.cwd(), '.env.test') : path.resolve(process.cwd(), '.env'),
  debug: true,
});
const config = {
  weather: {
    apiKey: 'e1db0007-660a-4a98-91bb-8cb1f4ac205a',
  },
  database: {
    dialect: String(process.env.DB_DRIVER || 'postgres') as Dialect,
    host: String(process.env.DB_HOST),
    port: Number(process.env.DB_PORT),
    username: String(process.env.DB_USER),
    password: String(process.env.DB_PASSWORD),
    database: String(process.env.DB_DATABASE),
    synchronize: Boolean(process.env.DB_SYNC || false),
    logging: Boolean(process.env.DB_LOGGING || true),
    autoLoadModels: (process.env.SEQUELIZE_AUTOLOAD_MODELS || true) as boolean,
    dialectOptions: {
      connectTimeout: 60000,
    },
  },
  app: {
    name: process.env.APP_NAME || 'weather_app',
    env: process.env.APP_ENV,
    url: process.env.APP_URL,
    port: +process.env.APP_PORT,
    version,
  },
};
export default config;
