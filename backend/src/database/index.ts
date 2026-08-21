import { Sequelize } from "sequelize-typescript";
import Announcement from "../models/Announcement";
import Baileys from "../models/Baileys";
import BaileysChats from "../models/BaileysChats";
import BotConnection from "../models/BotConnection";
import BotExecution from "../models/BotExecution";
import BotFlow from "../models/BotFlow";
import BotNode from "../models/BotNode";
import BotRule from "../models/BotRule";
import Campaign from "../models/Campaign";
import CampaignClient from "../models/CampaignClient";
import CampaignRecipient from "../models/CampaignRecipient";
import CampaignSetting from "../models/CampaignSetting";
import CampaignShipping from "../models/CampaignShipping";
import Chat from "../models/Chat";
import ChatMessage from "../models/ChatMessage";
import ChatUser from "../models/ChatUser";
import CommercialLead from "../models/CommercialLead";
import CommercialLeadTask from "../models/CommercialLeadTask";
import Company from "../models/Company";
import Contact from "../models/Contact";
import ContactCustomField from "../models/ContactCustomField";
import ContactList from "../models/ContactList";
import ContactListItem from "../models/ContactListItem";
import Help from "../models/Help";
import Invoices from "../models/Invoices";
import Message from "../models/Message";
import OutboxMessage from "../models/OutboxMessage";
import Plan from "../models/Plan";
import Queue from "../models/Queue";
import QueueOption from "../models/QueueOption";
import QuickAnswer from "../models/QuickAnswer";
import QuickMessage from "../models/QuickMessage";
import Schedule from "../models/Schedule";
import Sender from "../models/Sender";
import User from "../models/User";
import Setting from "../models/Setting";
import Subscriptions from "../models/Subscriptions";
import Tag from "../models/Tag";
import Ticket from "../models/Ticket";
import TicketNote from "../models/TicketNote";
import TicketTag from "../models/TicketTag";
import TicketTraking from "../models/TicketTraking";
import UserQueue from "../models/UserQueue";
import UserRating from "../models/UserRating";
import Whatsapp from "../models/Whatsapp";
import WhatsappQueue from "../models/WhatsappQueue";
import WppKey from "../models/WppKey";

// eslint-disable-next-line
const dbConfig = require("../config/database");
// import dbConfig from "../config/database";

const sequelize = new Sequelize(dbConfig);

const models = [
  Announcement,
  Baileys,
  BaileysChats,
  BotFlow,
  BotNode,
  BotRule,
  BotConnection,
  BotExecution,
  Campaign,
  CampaignClient,
  CampaignRecipient,
  CampaignSetting,
  CampaignShipping,
  Chat,
  ChatMessage,
  ChatUser,
  CommercialLead,
  CommercialLeadTask,
  User,
  Company,
  Plan,
  Contact,
  Ticket,
  Message,
  Whatsapp,
  ContactCustomField,
  ContactList,
  ContactListItem,
  Help,
  Invoices,
  Setting,
  Queue,
  QueueOption,
  WhatsappQueue,
  UserQueue,
  QuickAnswer,
  QuickMessage,
  Schedule,
  OutboxMessage,
  Sender,
  Subscriptions,
  Tag,
  TicketNote,
  TicketTag,
  TicketTraking,
  UserRating,
  WppKey
];

sequelize.addModels(models);

export default sequelize;
