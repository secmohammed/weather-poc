import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LocationEntity } from './entities/location.entity';

@Module({
  imports: [SequelizeModule.forFeature([LocationEntity])],
})
export class LocationsModule {}
