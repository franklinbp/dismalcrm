import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  HasMany,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import ContactCustomField from "./ContactCustomField";
import Ticket from "./Ticket";

@Table
class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @AllowNull(false)
  @Column
  number: string;

  @AllowNull(false)
  @Default("whatsapp")
  @Column
  channel: string;

  @AllowNull(false)
  @Default("")
  @Column
  email: string;

  @Column
  profilePicUrl: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];

  @BelongsTo(() => Company)
  company: Company;
}

export default Contact;
