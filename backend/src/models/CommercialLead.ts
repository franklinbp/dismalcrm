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
import Contact from "./Contact";
import Ticket from "./Ticket";
import CommercialLeadTask from "./CommercialLeadTask";

export type CommercialLeadStatus =
  | "NEW"
  | "QUOTED"
  | "FOLLOW_UP"
  | "WON"
  | "LOST"
  | "NO_RESPONSE";

export type CommercialCustomerType = "FINAL" | "WHOLESALE" | "UNKNOWN";

@Table({ tableName: "CommercialLeads" })
class CommercialLead extends Model<CommercialLead> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Default("whatsapp")
  @Column
  channel: string;

  @Default("WhatsApp")
  @Column
  origin: string;

  @Default("NEW")
  @Column
  status: CommercialLeadStatus;

  @Default("UNKNOWN")
  @Column
  customerType: CommercialCustomerType;

  @Column(DataType.TEXT)
  interest: string;

  @Column(DataType.DECIMAL(10, 2))
  estimatedValue: number;

  @Column
  nextActionAt: Date;

  @Column
  lastContactAt: Date;

  @Column(DataType.TEXT)
  notes: string;

  @HasMany(() => CommercialLeadTask)
  tasks: CommercialLeadTask[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CommercialLead;
