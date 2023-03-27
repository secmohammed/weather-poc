import { CacheModule, Module } from '@nestjs/common';
import { LocationsModule } from './location/location.module';
import { WeatherModule } from './weather/weather.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './shared/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(config.app.name, {
              prettyPrint: true,
            }),
            winston.format.colorize({ all: true })
          ),
        }),
      ],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (c: ConfigService) => c.get('database'),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      cache: true,
      load: [() => config],
      isGlobal: true,
    }),
    LocationsModule,
    WeatherModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
