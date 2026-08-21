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
  DataType
} from "sequelize-typescript";

import BotFlow from "./BotFlow";
import BotNode from "./BotNode";
import Company from "./Company";

@Table({ tableName: "BotConnections" })
class BotConnection extends Model<BotConnection> {
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

  @ForeignKey(() => BotNode)
  @Column
  sourceNodeId: number;

  @BelongsTo(() => BotNode, "sourceNodeId")
  sourceNode: BotNode;

  @ForeignKey(() => BotNode)
  @Column
  targetNodeId: number;

  @BelongsTo(() => BotNode, "targetNodeId")
  targetNode: BotNode;

  @Column(DataType.TEXT)
  conditionJson: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default BotConnection;
