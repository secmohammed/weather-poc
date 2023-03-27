import { Controller, Get, Query } from '@nestjs/common';
import { AirQualityService } from '../services/air-quality.service';
import { GetByCoordinatesDTO } from '../dtos/get-by-coordinates.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('air-quality')
@Controller('/api/air-quality')
export class AirQualityController {
  constructor(private readonly airQualityService: AirQualityService) {}
  @ApiResponse({
    status: 200,
    description: 'Fetch the highest pollution record among our local results by coordinates.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request (Mostly something went wrong with the third party).' })
  @Get('/coordinates/peak')
  get(@Query() query: GetByCoordinatesDTO) {
    return this.airQualityService.getPollutionPeakByCoordinates(query);
  }
  @ApiResponse({ status: 200, description: 'Fetch the pollution and weather record by coordinates.' })
  @ApiResponse({ status: 400, description: 'Bad Request (Mostly something went wrong with the third party).' })
  @Get('/coordinates')
  index(@Query() query: GetByCoordinatesDTO) {
    return this.airQualityService.getWeatherAndPollutionByCoordinates(query);
  }
}
