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
  DataType,
  Default
} from "sequelize-typescript";

import BotFlow from "./BotFlow";
import BotNode from "./BotNode";
import BotRule from "./BotRule";
import Company from "./Company";
import Contact from "./Contact";
import Ticket from "./Ticket";

export type BotExecutionStatus =
  | "SIMULATED"
  | "OBSERVED"
  | "PROCESSING"
  | "REPLIED"
  | "NO_MATCH"
  | "FAILED"
  | "ACTIVE"
  | "FINISHED"
  | "HANDOFF";

@Table({ tableName: "BotExecutions" })
class BotExecution extends Model<BotExecution> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => BotFlow)
  @Column
  flowId: number;

  @BelongsTo(() => BotFlow)
  flow: BotFlow;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => BotNode)
  @Column
  currentNodeId: number;

  @BelongsTo(() => BotNode)
  currentNode: BotNode;

  @Column
  messageId: string;

  @ForeignKey(() => BotRule)
  @Column
  ruleId: number;

  @BelongsTo(() => BotRule)
  rule: BotRule;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Default("SIMULATED")
  @Column
  status: BotExecutionStatus;

  @Default("simulator")
  @Column
  channel: string;

  @Column(DataType.TEXT)
  lastInput: string;

  @Column(DataType.TEXT)
  lastOutput: string;

  @Column(DataType.TEXT)
  metadataJson: string;

  @Default(1)
  @Column
  attempts: number;

  @Column(DataType.TEXT)
  errorMessage: string;

  @Column
  processedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default BotExecution;
