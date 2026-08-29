import fs from "fs";
import CampaignClient from "../../models/CampaignClient";
import AppError from "../../errors/AppError";
import {
  getCountryCodeFromE164,
  normalizePhoneToE164
} from "../../helpers/PhoneFormatter";
import { logger } from "../../utils/logger";

interface Request {
  file?: Express.Multer.File;
  defaultCountryCode?: string;
  source?: string;
  segment?: string;
  category?: string;
}

interface InvalidRow {
  row: number;
  reason: string;
}

interface ImportSummary {
  totalRows: number;
  created: number;
  updated: number;
  existing: number;
  duplicates: number;
  skipped: number;
  invalidRows: InvalidRow[];
}

type RowData = Record<string, string>;

const HEADER_ALIASES = {
  name: ["name", "nombre", "nome", "fullname", "displayname"],
  tradeName: [
    "tradename",
    "empresa",
    "company",
    "organization",
    "organization1name",
    "organizacion"
  ],
  phone: [
    "phone",
    "phone1value",
    "mobilephone",
    "telefono",
    "celular",
    "movil",
    "numero",
    "number",
    "whatsapp"
  ],
  email: ["email", "email1value", "emailaddress", "correo", "mail"],
  countryCode: ["country", "countrycode", "pais"],
  source: ["source", "origen", "cuenta", "account"],
  segment: ["segment", "segmento", "lista", "grupo", "groupmembership"],
  category: ["category", "categoria", "tipo"]
};

const normalizeHeader = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const sanitizeText = (value?: string | null): string | null => {
  const text = `${value || ""}`.trim();
  return text ? text.slice(0, 255) : null;
};

const countDelimiter = (line: string, delimiter: string): number => {
  let count = 0;
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === delimiter) {
      count += 1;
    }
  }

  return count;
};

const detectDelimiter = (line: string): string => {
  const candidates = [",", ";", "\t"];
  return candidates.sort(
    (left, right) => countDelimiter(line, right) - countDelimiter(line, left)
  )[0];
};

const parseDelimitedLine = (line: string, delimiter: string): string[] => {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (!quoted && char === delimiter) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const aliasMatches = (header: string, aliases: string[]): boolean =>
  aliases.includes(normalizeHeader(header));

const resolveFieldIndex = (
  headers: string[],
  field: keyof typeof HEADER_ALIASES
): number =>
  headers.findIndex(header => aliasMatches(header, HEADER_ALIASES[field]));

const hasKnownHeader = (headers: string[]): boolean =>
  headers.some(header =>
    Object.values(HEADER_ALIASES).some(aliases => aliasMatches(header, aliases))
  );

const rowValue = (
  row: string[],
  indexes: Record<string, number>,
  field: string,
  fallbackIndex: number
): string => {
  const index = indexes[field] ?? -1;
  if (index >= 0) return row[index] || "";
  return row[fallbackIndex] || "";
};

const mergeLabels = (
  current?: string | null,
  incoming?: string | null
): string | null => {
  const values = `${current || ""},${incoming || ""}`
    .split(/[,;|]/)
    .map(value => value.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const unique = values.filter(value => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.length ? unique.join(", ").slice(0, 255) : null;
};

const shouldReplaceName = (
  currentName?: string | null,
  nextName?: string | null,
  phone?: string
): boolean => {
  if (!nextName) return false;
  if (!currentName) return true;
  if (!phone) return false;
  return currentName.replace(/\D/g, "") === phone.replace(/\D/g, "");
};

const parseCountry = (
  rowCountry?: string | null,
  defaultCountryCode?: string
): string => {
  const country = sanitizeText(rowCountry) || sanitizeText(defaultCountryCode) || "EC";
  const normalized = normalizeHeader(country);

  if (["ec", "ecuador", "593"].includes(normalized)) return "EC";
  if (["pe", "peru", "51"].includes(normalized)) return "PE";

  return country.toUpperCase();
};

const getAllowedCountries = (): string[] => {
  const configured =
    process.env.CAMPAIGN_CLIENT_ALLOWED_COUNTRIES ||
    process.env.APP_COUNTRY ||
    "EC";

  if (configured.trim() === "*") return [];

  return configured
    .split(",")
    .map(country => parseCountry(country))
    .filter(Boolean);
};

const ImportCampaignClientsService = async ({
  file,
  defaultCountryCode = "EC",
  source,
  segment,
  category
}: Request): Promise<ImportSummary> => {
  if (!file?.path) {
    throw new AppError("CSV file is required", 400);
  }

  const summary: ImportSummary = {
    totalRows: 0,
    created: 0,
    updated: 0,
    existing: 0,
    duplicates: 0,
    skipped: 0,
    invalidRows: []
  };

  const defaultSource = sanitizeText(source);
  const defaultSegment = sanitizeText(segment);
  const defaultCategory = sanitizeText(category);

  try {
    const text = (await fs.promises.readFile(file.path, "utf8")).replace(
      /^\uFEFF/,
      ""
    );
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length === 0) {
      throw new AppError("CSV file is empty", 400);
    }

    const delimiter = detectDelimiter(lines[0]);
    const firstRow = parseDelimitedLine(lines[0], delimiter);
    const withHeader = hasKnownHeader(firstRow);
    const headers = withHeader ? firstRow : [];
    const indexes = {
      name: resolveFieldIndex(headers, "name"),
      tradeName: resolveFieldIndex(headers, "tradeName"),
      phone: resolveFieldIndex(headers, "phone"),
      email: resolveFieldIndex(headers, "email"),
      countryCode: resolveFieldIndex(headers, "countryCode"),
      source: resolveFieldIndex(headers, "source"),
      segment: resolveFieldIndex(headers, "segment"),
      category: resolveFieldIndex(headers, "category")
    };
    const dataLines = withHeader ? lines.slice(1) : lines;
    const processedPhones = new Set<string>();
    const allowedCountries = getAllowedCountries();

    for (let index = 0; index < dataLines.length; index += 1) {
      const rowNumber = index + (withHeader ? 2 : 1);
      const parsed = parseDelimitedLine(dataLines[index], delimiter);
      summary.totalRows += 1;

      const rawPhone = rowValue(parsed, indexes, "phone", 0);
      const countryCode = parseCountry(
        rowValue(parsed, indexes, "countryCode", 4),
        defaultCountryCode
      );

      if (!rawPhone) {
        summary.skipped += 1;
        if (summary.invalidRows.length < 20) {
          summary.invalidRows.push({ row: rowNumber, reason: "Telefono vacio" });
        }
        continue;
      }

      let phoneE164 = "";

      try {
        phoneE164 = normalizePhoneToE164(rawPhone, countryCode);
      } catch (err) {
        summary.skipped += 1;
        if (summary.invalidRows.length < 20) {
          summary.invalidRows.push({
            row: rowNumber,
            reason: `Telefono invalido: ${rawPhone}`
          });
        }
        continue;
      }

      if (processedPhones.has(phoneE164)) {
        summary.duplicates += 1;
        continue;
      }

      processedPhones.add(phoneE164);

      const name = sanitizeText(rowValue(parsed, indexes, "name", 1)) || phoneE164;
      const tradeName = sanitizeText(rowValue(parsed, indexes, "tradeName", 5));
      const email = sanitizeText(rowValue(parsed, indexes, "email", 2));
      const rowSource =
        sanitizeText(rowValue(parsed, indexes, "source", 6)) || defaultSource;
      const rowSegment =
        sanitizeText(rowValue(parsed, indexes, "segment", 7)) || defaultSegment;
      const rowCategory =
        sanitizeText(rowValue(parsed, indexes, "category", 3)) || defaultCategory;
      const finalCountry = getCountryCodeFromE164(phoneE164) || countryCode;

      if (
        allowedCountries.length > 0 &&
        !allowedCountries.includes(finalCountry)
      ) {
        summary.skipped += 1;
        if (summary.invalidRows.length < 20) {
          summary.invalidRows.push({
            row: rowNumber,
            reason: `Pais no autorizado para este CRM: ${finalCountry}`
          });
        }
        continue;
      }

      const existing = await CampaignClient.findOne({ where: { phoneE164 } });

      if (!existing) {
        await CampaignClient.create({
          name,
          tradeName,
          phoneE164,
          countryCode: finalCountry,
          email,
          category: rowCategory,
          source: rowSource,
          segment: rowSegment
        });
        summary.created += 1;
        continue;
      }

      const nextData: RowData = {};

      if (shouldReplaceName(existing.name, name, phoneE164)) {
        nextData.name = name;
      }

      if (!existing.tradeName && tradeName) {
        nextData.tradeName = tradeName;
      }

      if (!existing.email && email) {
        nextData.email = email;
      }

      if (!existing.countryCode && finalCountry) {
        nextData.countryCode = finalCountry;
      }

      const mergedCategory = mergeLabels(existing.category, rowCategory);
      const mergedSource = mergeLabels(existing.source, rowSource);
      const mergedSegment = mergeLabels(existing.segment, rowSegment);

      if (mergedCategory !== (existing.category || null)) {
        nextData.category = mergedCategory || "";
      }

      if (mergedSource !== (existing.source || null)) {
        nextData.source = mergedSource || "";
      }

      if (mergedSegment !== (existing.segment || null)) {
        nextData.segment = mergedSegment || "";
      }

      if (Object.keys(nextData).length > 0) {
        await existing.update(nextData);
        summary.updated += 1;
      } else {
        summary.existing += 1;
      }
    }

    return summary;
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.error(`Campaign clients CSV import failed: ${err}`);
    throw new AppError("Could not import campaign clients", 500);
  } finally {
    fs.promises.unlink(file.path).catch(() => undefined);
  }
};

export default ImportCampaignClientsService;
