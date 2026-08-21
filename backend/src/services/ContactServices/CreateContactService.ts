import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
  companyId?: number;
  channel?: string;
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  extraInfo = [],
  companyId,
  channel = "whatsapp"
}: Request): Promise<Contact> => {
  const numberExists = await Contact.findOne({
    where: companyId ? { number, companyId } : { number }
  });

  if (numberExists) {
    throw new AppError("ERR_DUPLICATED_CONTACT");
  }

  const contact = await Contact.create(
    {
      name,
      number,
      email,
      extraInfo,
      companyId,
      channel
    },
    {
      include: ["extraInfo"]
    }
  );

  return contact;
};

export default CreateContactService;
