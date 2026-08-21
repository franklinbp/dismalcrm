import Sender from "../../models/Sender";
import Whatsapp from "../../models/Whatsapp";

const ListSendersService = async (): Promise<Sender[]> => {
  const senders = await Sender.findAll({
    include: [{ model: Whatsapp }],
    order: [["createdAt", "DESC"]]
  });

  return senders;
};

export default ListSendersService;
