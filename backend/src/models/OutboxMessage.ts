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
  Default
} from "sequelize-typescript";

import Campaign from "./Campaign";
import CampaignRecipient from "./CampaignRecipient";
import Sender from "./Sender";

export type OutboxMessageStatus = "PENDING" | "PROCESSING" | "SENT" | "FAILED";

@Table
class OutboxMessage extends Model<OutboxMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Campaign)
  @Column
  campaignId: number;

  @BelongsTo(() => Campaign)
  campaign: Campaign;

  @ForeignKey(() => CampaignRecipient)
  @Column
  recipientId: number;

  @BelongsTo(() => CampaignRecipient)
  recipient: CampaignRecipient;

  @ForeignKey(() => Sender)
  @Column
  senderId?: number;

  @BelongsTo(() => Sender)
  sender: Sender;

  @Column
  to: string;

  @Column
  body: string;

  @Default("PENDING")
  @Column
  status: OutboxMessageStatus;

  @Column
  runAt?: Date;

  @Column
  lockedAt?: Date;

  @Column
  lockedBy?: string;

  @Default(0)
  @Column
  attempts: number;

  @Column
  providerMessageId?: string;

  @Column
  lastError?: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default OutboxMessage;
