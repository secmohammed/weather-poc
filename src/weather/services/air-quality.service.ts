import { CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { GetByCoordinatesDTO } from '@/weather/dtos/get-by-coordinates.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { NearestCityResponse } from '../types/responses/airvisual';
import { InjectModel } from '@nestjs/sequelize';
import { PollutionEntity } from '../entities/pollution.entity';
import { WeatherEntity } from '../entities/weather.entity';
import { LocationEntity } from '../../location/entities/location.entity';
import { LocationType } from '../../location/interfaces/location.attribute';
import { literal } from 'sequelize';
import { Cache } from 'cache-manager';

@Injectable()
export class AirQualityService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @InjectModel(PollutionEntity)
    private readonly pollutions: typeof PollutionEntity,
    @InjectModel(WeatherEntity)
    private readonly weathers: typeof WeatherEntity,
    @InjectModel(LocationEntity)
    private readonly locations: typeof LocationEntity,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache
  ) {}
  async getPollutionPeakByCoordinates(payload: GetByCoordinatesDTO) {
    let state = await this.cacheManager.get(`lat:${payload.latitude}-long:${payload.longitude}`);
    if (!state) {
      const key = this.config.get<string>('weather.apiKey');
      try {
        const res = (await firstValueFrom(
          this.http.get(`
          http://api.airvisual.com/v2/nearest_city?lat=${payload.latitude}&lon=${payload.longitude}&key=${key}
    `)
        )) as unknown as { data: NearestCityResponse };
        await this.cacheManager.set(`lat:${payload.latitude}-long:${payload.longitude}`, res.data.data.state);
        state = res.data.data.state;
      } catch (e) {
        const message = e.response?.data?.data?.message || e.toString();
        throw new HttpException(`Something went wrong: ${message}`, HttpStatus.BAD_REQUEST);
      }
    }

    return this.pollutions.findOne({
      order: [['peak', 'DESC']],
      group: ['PollutionEntity.id'],
      attributes: [...Object.keys(this.pollutions.getAttributes()), [literal('SUM(aqicn + aqius)'), 'peak']],
      include: [
        {
          attributes: [],
          required: true,
          model: LocationEntity,
          as: 'location',
          where: {
            type: LocationType.STATE,
            name: state,
          },
        },
      ],
    });
  }
  async getWeatherAndPollutionByCoordinates(payload: GetByCoordinatesDTO) {
    const key = this.config.get<string>('weather.apiKey');
    try {
      const res = (await firstValueFrom(
        this.http.get(`
          http://api.airvisual.com/v2/nearest_city?lat=${payload.latitude}&lon=${payload.longitude}&key=${key}
    `)
      )) as unknown as { data: NearestCityResponse };

      const [country] = await this.locations.findOrCreate({
        where: {
          name: res.data.data.country,
          type: LocationType.COUNTRY,
          parentId: null,
        },
      });
      const [city] = await this.locations.findOrCreate({
        where: {
          name: res.data.data.city,
          type: LocationType.CITY,
          parentId: country.id,
        },
      });
      const [state] = await this.locations.findOrCreate({
        where: {
          name: res.data.data.state,
          type: LocationType.STATE,
          parentId: city.id,
        },
      });
      const [[pollution], [weather]] = await Promise.all([
        this.pollutions.findOrCreate({
          where: {
            ...Object.keys(res.data.data.current.pollution).reduce((prev, current) => {
              if (current == 'ts') {
                return prev;
              }
              prev[current] = res.data.data.current.pollution[current];
              return prev;
            }, {}),
            locationId: state.id,
            createdAt: new Date(res.data.data.current.pollution.ts),
          },
        }),
        this.weathers.findOrCreate({
          where: {
            ...Object.keys(res.data.data.current.weather).reduce((prev, current) => {
              if (current == 'ts') {
                return prev;
              }
              prev[current] = res.data.data.current.weather[current];
              return prev;
            }, {}),
            locationId: state.id,
            createdAt: new Date(res.data.data.current.weather.ts),
          },
        }),
      ]);
      return {
        location: res.data.data.location,
        pollution,
        weather,
      };
    } catch (e) {
      const message = e.response?.data?.data?.message || e.toString();
      throw new HttpException(`Something went wrong: ${message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
