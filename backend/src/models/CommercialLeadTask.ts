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

import CommercialLead from "./CommercialLead";
import Company from "./Company";

export type CommercialLeadTaskStatus = "PENDING" | "DONE" | "CANCELED";

@Table({ tableName: "CommercialLeadTasks" })
class CommercialLeadTask extends Model<CommercialLeadTask> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => CommercialLead)
  @Column
  leadId: number;

  @BelongsTo(() => CommercialLead)
  lead: CommercialLead;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  title: string;

  @Column
  dueAt: Date;

  @Default("PENDING")
  @Column
  status: CommercialLeadTaskStatus;

  @Column
  priority: string;

  @Column(DataType.TEXT)
  notes: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CommercialLeadTask;
