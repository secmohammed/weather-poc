import { IsLatitude, IsLongitude, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetByCoordinatesDTO {
  @ApiProperty({
    default: 48.856613,
    description: 'latitude of the place you want to get weather/pollution for',
  })
  @IsNumberString()
  @IsLatitude()
  latitude: number;
  @ApiProperty({
    default: 2.352222,
    description: 'longitude of the place you want to get weather/pollution for',
  })
  @IsNumberString()
  @IsLongitude()
  longitude: number;
}
