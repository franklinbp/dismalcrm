import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement
} from "sequelize-typescript";

@Table
class CampaignClient extends Model<CampaignClient> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  tradeName?: string;

  @Column
  phoneE164: string;

  @Column
  countryCode?: string;

  @Column
  email?: string;

  @Column
  category?: string;

  @Column
  source?: string;

  @Column
  segment?: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignClient;
