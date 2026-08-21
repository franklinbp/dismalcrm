import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Setting extends Model<Setting> {
  @PrimaryKey
  @Column
  key: string;

  @Column
  value: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;
}

export default Setting;
