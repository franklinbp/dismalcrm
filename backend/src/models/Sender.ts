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

import Whatsapp from "./Whatsapp";
import Campaign from "./Campaign";
import OutboxMessage from "./OutboxMessage";

export type SenderStatus = "online" | "offline";

@Table
class Sender extends Model<Sender> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  phone: string;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @Default("offline")
  @Column
  status: SenderStatus;

  @Column
  ratePerMin?: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Campaign)
  campaigns: Campaign[];

  @HasMany(() => OutboxMessage)
  outbox: OutboxMessage[];
}

export default Sender;
