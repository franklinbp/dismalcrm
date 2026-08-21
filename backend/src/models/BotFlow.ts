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
  HasMany,
  DataType,
  Default
} from "sequelize-typescript";

import Company from "./Company";
import BotConnection from "./BotConnection";
import BotExecution from "./BotExecution";
import BotNode from "./BotNode";
import BotRule from "./BotRule";

@Table({ tableName: "BotFlows" })
class BotFlow extends Model<BotFlow> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string;

  @Default("all")
  @Column
  channel: string;

  @Default(true)
  @Column
  active: boolean;

  @Default(false)
  @Column
  runtimeEnabled: boolean;

  @Default(1)
  @Column
  priority: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => BotNode)
  nodes: BotNode[];

  @HasMany(() => BotRule)
  rules: BotRule[];

  @HasMany(() => BotConnection)
  connections: BotConnection[];

  @HasMany(() => BotExecution)
  executions: BotExecution[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default BotFlow;
