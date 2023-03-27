import { Table, Model, DataType, BelongsTo, Column, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { LocationEntity } from '../../location/entities/location.entity';
import { WeatherAttribute } from '../interfaces/weather.attribute';

@Table({
  tableName: 'weathers',
  timestamps: true,
  indexes: [
    {
      name: 'fk_location_weather_idx',
      fields: ['location_id'],
      using: 'BTREE',
    },
  ],
})
export class WeatherEntity extends Model<WeatherAttribute, WeatherAttribute> implements WeatherAttribute {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;
  @Column({ type: DataType.INTEGER, field: 'location_id' })
  locationId: number;
  @Column({ type: DataType.FLOAT, field: 'tp' })
  tp: number;
  @Column({ type: DataType.FLOAT, field: 'pr' })
  pr: number;
  @Column({ type: DataType.FLOAT, field: 'hu' })
  hu: number;
  @Column({ type: DataType.FLOAT, field: 'ws' })
  ws: number;
  @Column({ type: DataType.FLOAT, field: 'wd' })
  wd: number;
  @Column({ type: DataType.STRING, field: 'ic' })
  ic: string;
  @CreatedAt
  declare createdAt: Date;
  @UpdatedAt
  declare updatedAt: Date;
  @BelongsTo(() => LocationEntity, {
    foreignKey: 'location_id',
  })
  declare location: LocationEntity;
}
