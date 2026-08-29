import { Op, Sequelize } from "sequelize";
import CampaignClient from "../../models/CampaignClient";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  countryCode?: string;
  category?: string;
  source?: string;
  segment?: string;
}

interface Response {
  clients: CampaignClient[];
  count: number;
  hasMore: boolean;
}

const ListCampaignClientService = async ({
  searchParam = "",
  pageNumber = "1",
  countryCode = "",
  category = "",
  source = "",
  segment = ""
}: Request): Promise<Response> => {
  const normalized = searchParam.toLowerCase().trim();
  const normalizedCountry = countryCode.trim().toUpperCase();
  const normalizedCategory = category.toLowerCase().trim();
  const normalizedSource = source.toLowerCase().trim();
  const normalizedSegment = segment.toLowerCase().trim();
  const filters = [];

  if (normalized) {
    filters.push({
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            "LIKE",
            `%${normalized}%`
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("tradeName")),
            "LIKE",
            `%${normalized}%`
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("phoneE164")),
            "LIKE",
            `%${normalized}%`
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("email")),
            "LIKE",
            `%${normalized}%`
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("category")),
            "LIKE",
            `%${normalized}%`
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("source")),
            "LIKE",
            `%${normalized}%`
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("segment")),
            "LIKE",
            `%${normalized}%`
          )
        ]
      });
  }

  if (normalizedCountry) {
    filters.push({ countryCode: normalizedCountry });
  }

  if (normalizedCategory) {
    filters.push(
      Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("category")),
        "LIKE",
        `%${normalizedCategory}%`
      )
    );
  }

  if (normalizedSource) {
    filters.push(
      Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("source")),
        "LIKE",
        `%${normalizedSource}%`
      )
    );
  }

  if (normalizedSegment) {
    filters.push(
      Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("segment")),
        "LIKE",
        `%${normalizedSegment}%`
      )
    );
  }

  const whereCondition = filters.length > 0 ? { [Op.and]: filters } : {};

  const limit = 20;
  const offset = limit * (+pageNumber - 1);
  const shouldLoadAll = pageNumber === "all";

  const { count, rows: clients } = await CampaignClient.findAndCountAll({
    where: whereCondition,
    limit: shouldLoadAll ? undefined : limit,
    offset: shouldLoadAll ? undefined : offset,
    order: [["name", "ASC"]]
  });

  const hasMore = shouldLoadAll ? false : count > offset + clients.length;

  return { clients, count, hasMore };
};

export default ListCampaignClientService;
