# Campañas (sin tickets)

## Por que las campañas no usan tickets
Las campañas son un flujo independiente del inbox humano. No deben crear ni leer `Tickets` ni `Messages`, ni emitir eventos de socket del chat. Esto evita contaminar la bandeja y mantiene la operacion de soporte intacta. El envio masivo se hace por un gateway directo que usa `whatsappId` y numero destino.

## Flujo de datos
```
Campaign -> CampaignRecipient -> OutboxMessage -> Sender -> WhatsAppSession(whatsappId) -> WhatsAppProvider
```

## Idempotencia
- `CampaignRecipient` tiene `UNIQUE(campaignId, phoneE164)`.
- `OutboxMessage` tiene `UNIQUE(campaignId, recipientId)`.
- El worker bloquea filas con `lockedAt`/`lockedBy` y solo procesa mensajes `PENDING`.

Esto garantiza que cada destinatario tenga un unico outbox por campaña y evita duplicados por ejecuciones concurrentes.

## Rate limit
- El rate se toma de `Sender.ratePerMin` o `Campaign.ratePerMin`.
- Si el rate esta activo, el worker calcula el intervalo minimo entre envios y reprograma `runAt` cuando corresponde.

## Retries
- En caso de error, el worker incrementa `attempts` y reprograma `runAt` con backoff exponencial.
- Al alcanzar `MAX_ATTEMPTS`, el outbox pasa a `FAILED` y el recipient a `FAILED`.

## Gateway de envio directo
El envio se hace con `SendTextByWhatsappId`:
- Obtiene la sesion por `whatsappId`.
- Envia directo a `<phone>@c.us`.
- No crea tickets ni mensajes del inbox.
  - Marca el payload con el prefijo invisible `\u200e` para que el listener del inbox lo ignore.

## Notas operativas
- Si una campaña se cancela, los outbox `PENDING` pasan a `FAILED`.
- El worker solo procesa campañas `READY` o `RUNNING`.
