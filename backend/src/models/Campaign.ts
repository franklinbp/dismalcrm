import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";

import Sender from "./Sender";
import CampaignRecipient from "./CampaignRecipient";
import OutboxMessage from "./OutboxMessage";

export type CampaignStatus =
  | "DRAFT"
  | "READY"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

export type CampaignSenderMode = "SINGLE" | "ROUND_ROBIN";

@Table
class Campaign extends Model<Campaign> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Default("DRAFT")
  @Column
  status: CampaignStatus;

  @Column
  messageBody: string;

  @Column
  mediaUrl?: string;

  @Column
  mediaType?: string;

  @Default("SINGLE")
  @Column
  senderMode: CampaignSenderMode;

  @ForeignKey(() => Sender)
  @Column
  senderId?: number;

  @BelongsTo(() => Sender)
  sender: Sender;

  @Column
  ratePerMin?: number;

  @Column
  scheduleAt?: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => CampaignRecipient)
  recipients: CampaignRecipient[];

  @HasMany(() => OutboxMessage)
  outbox: OutboxMessage[];
}

export default Campaign;
