const digitsOnly = (value?: string): string => (value || "").replace(/\D/g, "");

export const getWhatsappConnectionLimit = (): number => {
  const configured = Number(process.env.WHATSAPP_MAX_CONNECTIONS || "2");
  return Number.isInteger(configured) && configured > 0 ? configured : 2;
};

export const getAllowedWhatsappCountryCode = (): string =>
  digitsOnly(process.env.WHATSAPP_ALLOWED_COUNTRY_CODE || "593");

export const isAllowedWhatsappNumber = (number?: string): boolean => {
  const normalized = digitsOnly(number);
  const countryCode = getAllowedWhatsappCountryCode();

  if (!normalized || !countryCode || !normalized.startsWith(countryCode)) {
    return false;
  }

  if (countryCode === "593") {
    return /^593\d{9}$/.test(normalized);
  }

  return true;
};
