import { Table, Model, DataType, Column, HasMany } from 'sequelize-typescript';
import { LocationAttribute, LocationType } from '../interfaces/location.attribute';

@Table({
  tableName: 'locations',
  timestamps: false,
  indexes: [
    {
      name: 'fk_location_parent_idx',
      fields: ['parent_id'],
      using: 'BTREE',
    },
  ],
})
export class LocationEntity extends Model<LocationAttribute, LocationAttribute> implements LocationAttribute {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  declare id: number;
  @Column({ type: DataType.STRING, field: 'name', allowNull: false })
  name: string;
  @Column({ type: DataType.INTEGER, allowNull: true, field: 'parent_id' })
  declare parentId: number | null;
  @Column({
    allowNull: false,
    type: DataType.ENUM({
      values: Object.values(LocationType),
    }),
  })
  declare type: LocationType;
  @HasMany(() => LocationEntity, {
    foreignKey: 'parent_id',
  })
  children: LocationEntity[];
}
