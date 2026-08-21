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
import Company from "./Company";

export type BotNodeType =
  | "START"
  | "INTENT"
  | "MENU"
  | "RESPONSE"
  | "ACTION"
  | "HUMAN_HANDOFF";

@Table({ tableName: "BotNodes" })
class BotNode extends Model<BotNode> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => BotFlow)
  @Column
  flowId: number;

  @BelongsTo(() => BotFlow)
  flow: BotFlow;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Default("RESPONSE")
  @Column
  type: BotNodeType;

  @Column
  title: string;

  @Default(0)
  @Column
  positionX: number;

  @Default(0)
  @Column
  positionY: number;

  @Column(DataType.TEXT)
  configJson: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default BotNode;
