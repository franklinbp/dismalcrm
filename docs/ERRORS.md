# ERRORS

- Si `ENABLE_CAMPAIGNS=false`, los endpoints y worker de campanas del backend no se ejecutan.
- Si no hay `Sender` online con `whatsappId` valido, el outbox queda en reintento/fallo.
- Si hay errores de sesion WhatsApp, los envios fallan hasta reestablecer conexion QR.
