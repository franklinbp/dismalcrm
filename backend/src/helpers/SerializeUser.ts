import Queue from "../models/Queue";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";

interface SerializedUser {
  id: number;
  companyId: number;
  name: string;
  email: string;
  profile: string;
  queues: Queue[];
  whatsapp: Whatsapp;
}

export const SerializeUser = (user: User): SerializedUser => {
  return {
    id: user.id,
    companyId: user.companyId,
    name: user.name,
    email: user.email,
    profile: user.profile,
    queues: user.queues,
    whatsapp: user.whatsapp
  };
};
