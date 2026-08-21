const findWhatsappById = jest.fn();
const getDefaultWhatsapp = jest.fn();
const sendText = jest.fn();

jest.mock("../../../helpers/GetDefaultWhatsApp", () => ({
  __esModule: true,
  default: (...args: any[]) => getDefaultWhatsapp(...args)
}));

jest.mock("../../../models/Whatsapp", () => ({
  __esModule: true,
  default: {
    findByPk: (...args: any[]) => findWhatsappById(...args)
  }
}));

jest.mock("../../../services/GatewayServices/SendTextByWhatsappId", () => ({
  __esModule: true,
  default: (...args: any[]) => sendText(...args)
}));

const SendGatewayTextService =
  require("../../../services/GatewayServices/SendGatewayTextService").default;

describe("SendGatewayTextService", () => {
  it("sends with the requested WhatsApp session without creating inbox state", async () => {
    findWhatsappById.mockResolvedValue({ id: 34 });
    sendText.mockResolvedValue({});

    const result = await SendGatewayTextService({
      whatsappId: 34,
      number: "+593 99 255 4676",
      body: "Venta confirmada"
    });

    expect(findWhatsappById).toHaveBeenCalledWith(34);
    expect(sendText).toHaveBeenCalledWith({
      whatsappId: 34,
      to: "+593 99 255 4676",
      body: "Venta confirmada",
      skipInbox: true
    });
    expect(result).toEqual({ whatsappId: 34 });
  });

  it("uses the default WhatsApp session when no line is selected", async () => {
    getDefaultWhatsapp.mockResolvedValue({ id: 35 });
    sendText.mockResolvedValue({});

    await SendGatewayTextService({
      number: "51999999999",
      body: "Pedido confirmado"
    });

    expect(sendText).toHaveBeenCalledWith(
      expect.objectContaining({ whatsappId: 35, skipInbox: true })
    );
  });
});
