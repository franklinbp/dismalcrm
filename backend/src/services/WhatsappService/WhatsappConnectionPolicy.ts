const digitsOnly = (value?: string): string => (value || "").replace(/\D/g, "");

export const getWhatsappConnectionLimit = (): number => {
  const configured = Number(process.env.WHATSAPP_MAX_CONNECTIONS || "2");
  return Number.isInteger(configured) && configured > 0 ? configured : 2;
};

export const getAllowedWhatsappCountryCode = (): string =>
  digitsOnly(process.env.WHATSAPP_ALLOWED_COUNTRY_CODE || "593");

export const getAllowedWhatsappCountryCodes = (): string[] => {
  const configured = process.env.WHATSAPP_ALLOWED_COUNTRY_CODE || "593";

  return configured
    .split(",")
    .map(countryCode => digitsOnly(countryCode))
    .filter(Boolean);
};

export const isAllowedWhatsappNumber = (number?: string): boolean => {
  const normalized = digitsOnly(number);
  const countryCodes = getAllowedWhatsappCountryCodes();

  if (!normalized || countryCodes.length === 0) {
    return false;
  }

  return countryCodes.some(countryCode => {
    if (!normalized.startsWith(countryCode)) {
      return false;
    }

    if (countryCode === "593") {
      return /^593\d{9}$/.test(normalized);
    }

    return true;
  });
};
