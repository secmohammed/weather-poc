import { Table, Model, DataType, BelongsTo, Column, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { LocationEntity } from '../../location/entities/location.entity';
import { PollutionAttribute } from '../interfaces/pollution.attribute';

@Table({
  tableName: 'pollutions',
  timestamps: true,
  indexes: [
    {
      name: 'fk_location_pollution_idx',
      fields: ['location_id'],
      using: 'BTREE',
    },
  ],
})
export class PollutionEntity extends Model<PollutionAttribute, PollutionAttribute> implements PollutionAttribute {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;
  @Column({ type: DataType.INTEGER, field: 'location_id' })
  locationId: number;
  @Column({ type: DataType.STRING, field: 'mainus' })
  mainus: string;
  @Column({ type: DataType.STRING, field: 'maincn' })
  maincn: string;
  @Column({ type: DataType.FLOAT, field: 'aqius' })
  aqius: number;
  @Column({ type: DataType.FLOAT, field: 'aqicn' })
  aqicn: number;
  @CreatedAt
  declare createdAt: Date;
  @UpdatedAt
  declare updatedAt: Date;
  @BelongsTo(() => LocationEntity, {
    foreignKey: 'location_id',
  })
  declare location: LocationEntity;
}
