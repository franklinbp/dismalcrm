import {
  getWhatsappConnectionLimit,
  isAllowedWhatsappNumber
} from "../../../services/WhatsappService/WhatsappConnectionPolicy";

describe("WhatsappConnectionPolicy", () => {
  const originalCountryCode = process.env.WHATSAPP_ALLOWED_COUNTRY_CODE;
  const originalConnectionLimit = process.env.WHATSAPP_MAX_CONNECTIONS;

  afterEach(() => {
    process.env.WHATSAPP_ALLOWED_COUNTRY_CODE = originalCountryCode;
    process.env.WHATSAPP_MAX_CONNECTIONS = originalConnectionLimit;
  });

  it("accepts valid Ecuador WhatsApp numbers", () => {
    process.env.WHATSAPP_ALLOWED_COUNTRY_CODE = "593";

    expect(isAllowedWhatsappNumber("593992554676")).toBe(true);
    expect(isAllowedWhatsappNumber("+593 99 255 4676")).toBe(true);
  });

  it("rejects numbers outside Ecuador and invalid lengths", () => {
    process.env.WHATSAPP_ALLOWED_COUNTRY_CODE = "593";

    expect(isAllowedWhatsappNumber("51999999999")).toBe(false);
    expect(isAllowedWhatsappNumber("593123")).toBe(false);
  });

  it("uses two connections as the safe default", () => {
    delete process.env.WHATSAPP_MAX_CONNECTIONS;
    expect(getWhatsappConnectionLimit()).toBe(2);

    process.env.WHATSAPP_MAX_CONNECTIONS = "4";
    expect(getWhatsappConnectionLimit()).toBe(4);
  });
});
