import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default,
  HasMany
} from "sequelize-typescript";

import Campaign from "./Campaign";
import OutboxMessage from "./OutboxMessage";

export type CampaignRecipientStatus = "PENDING" | "RETRYING" | "SENT" | "FAILED";

@Table
class CampaignRecipient extends Model<CampaignRecipient> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Campaign)
  @Column
  campaignId: number;

  @BelongsTo(() => Campaign)
  campaign: Campaign;

  @Column
  phoneE164: string;

  @Column
  name?: string;

  @Default("PENDING")
  @Column
  status: CampaignRecipientStatus;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => OutboxMessage)
  outbox: OutboxMessage[];
}

export default CampaignRecipient;
