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

export type BotRuleOperand =
  | "CONTAINS"
  | "EQUALS"
  | "STARTS_WITH"
  | "ENDS_WITH"
  | "REGEX";

@Table({ tableName: "BotRules" })
class BotRule extends Model<BotRule> {
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

  @Column
  name: string;

  @Default(true)
  @Column
  active: boolean;

  @Default(1)
  @Column
  priority: number;

  @Default("CONTAINS")
  @Column
  operand: BotRuleOperand;

  @Column(DataType.TEXT)
  keyword: string;

  @Column(DataType.TEXT)
  responseText: string;

  @Column(DataType.TEXT)
  attachmentsJson: string;

  @Column(DataType.TEXT)
  buttonsJson: string;

  @Column(DataType.TEXT)
  catalogJson: string;

  @Column(DataType.TEXT)
  actionsJson: string;

  @Column(DataType.TEXT)
  nextStepJson: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default BotRule;
