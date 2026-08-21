import { parsePhoneNumberFromString } from "libphonenumber-js";
import AppError from "../errors/AppError";

const normalizeCountry = (countryCode?: string): string | undefined => {
  if (!countryCode) return undefined;
  const trimmed = countryCode.trim().toUpperCase();
  if (trimmed.length !== 2) {
    throw new AppError("Invalid country code", 400);
  }
  return trimmed;
};

export const normalizePhoneToE164 = (
  phone: string,
  countryCode?: string
): string => {
  const value = phone ? phone.trim() : "";
  if (!value) {
    throw new AppError("Phone is required", 400);
  }

  const normalizedCountry = normalizeCountry(countryCode);
  const parsed = parsePhoneNumberFromString(value, normalizedCountry as any);

  if (!parsed || !parsed.isValid()) {
    throw new AppError("Invalid phone number", 400);
  }

  return parsed.number;
};

export const getCountryCodeFromE164 = (phoneE164: string): string | null => {
  const parsed = parsePhoneNumberFromString(phoneE164);
  return parsed?.country || null;
};
