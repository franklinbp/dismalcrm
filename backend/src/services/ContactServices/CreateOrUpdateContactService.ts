import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
  companyId?: number;
  channel?: string;
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  extraInfo = [],
  companyId,
  channel = "whatsapp"
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");

  const io = getIO();
  let contact: Contact | null;

  contact = await Contact.findOne({
    where: companyId ? { number, companyId } : { number }
  });

  if (contact) {
    await contact.update({
      name: name || contact.name,
      profilePicUrl,
      channel,
      companyId: companyId || contact.companyId
    });

    io.emit("contact", {
      action: "update",
      contact
    });
  } else {
    contact = await Contact.create({
      name,
      number,
      profilePicUrl,
      email,
      isGroup,
      extraInfo,
      companyId,
      channel
    });

    io.emit("contact", {
      action: "create",
      contact
    });
  }

  return contact;
};

export default CreateOrUpdateContactService;
