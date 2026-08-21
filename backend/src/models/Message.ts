import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
import Contact from "./Contact";
import Ticket from "./Ticket";

@Table
class Message extends Model<Message> {
  @PrimaryKey
  @Column
  id: string;

  @Default(0)
  @Column
  ack: number;

  @Default(false)
  @Column
  read: boolean;

  @Default(false)
  @Column
  fromMe: boolean;

  @Column(DataType.TEXT)
  body: string;

  @Default("whatsapp")
  @Column
  channel: string;

  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    const mediaPath = this.getDataValue("mediaUrl");

    if (!mediaPath) return null;
    if (/^(https?:|data:|blob:)/i.test(mediaPath)) return mediaPath;
    if (mediaPath.startsWith("/public/")) return mediaPath;

    return `/public/${mediaPath.replace(/^\/+/, "")}`;
  }

  @Column
  mediaType: string;

  @Default(false)
  @Column
  isDeleted: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @ForeignKey(() => Message)
  @Column
  quotedMsgId: string;

  @BelongsTo(() => Message, "quotedMsgId")
  quotedMsg: Message;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  @BelongsTo(() => Company)
  company: Company;
}

export default Message;
