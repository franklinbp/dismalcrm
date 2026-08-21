import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import { logger } from "../../utils/logger";

const ImportContactsService = async (userId: number): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp(userId);

  const wbot = getWbot(defaultWhatsapp.id);

  let phoneContacts: any[] = [];

  try {
    logger.warn("ImportContactsService is partially supported in Baileys without store. Fetching contacts from socket is not direct.");
    phoneContacts = []; // Baileys no devuelve lista plana de contactos sin store.
  } catch (err) {
    logger.error(`Could not get whatsapp contacts from phone. Err: ${err}`);
  }

  if (phoneContacts) {
    await Promise.all(
      phoneContacts.map(async ({ number, name }) => {
        if (!number) {
          return null;
        }
        if (!name) {
          name = number;
        }

        const numberExists = await Contact.findOne({
          where: { number }
        });

        if (numberExists) return null;

        return Contact.create({ number, name });
      })
    );
  }
};

export default ImportContactsService;
