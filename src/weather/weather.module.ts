import { HttpModule } from '@nestjs/axios';
import { Module, OnModuleInit } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PollutionEntity } from './entities/pollution.entity';
import { WeatherEntity } from './entities/weather.entity';
import { AirQualityService } from './services/air-quality.service';

import { AirQualityController } from './controllers/air-quality.controller';
import { CronManager } from '../shared/cron/cron.manager';
import { LocationEntity } from '../location/entities/location.entity';
import { GetByCoordinatesDTO } from '@/weather/dtos/get-by-coordinates.dto';
@Module({
  imports: [
    SequelizeModule.forFeature([PollutionEntity, WeatherEntity, LocationEntity]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [AirQualityService, CronManager],
  controllers: [AirQualityController],
})
export class WeatherModule implements OnModuleInit {
  constructor(private airQualityService: AirQualityService, private readonly cron: CronManager) {}
  onModuleInit() {
    this.cron.addCronJob('* * * * *', 'sync-paris-weather-and-pollution-locally-with-third-party', () => {
      return this.airQualityService.getWeatherAndPollutionByCoordinates({
        latitude: 48.856613,
        longitude: 2.352222,
      } as GetByCoordinatesDTO);
    });
  }
}
