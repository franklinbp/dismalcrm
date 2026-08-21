# DECISIONES

## Arquitectura de campanas (actual)
- Se consolida un unico motor de campanas en backend Node/TS.
- El envio masivo usa outbox interno, senders y sesiones WhatsApp existentes.
- No se modifica la logica critica de mensajeria (`WbotServices` / `GatewayServices`).

## Operacion en VPS
- Solo se levanta `docker-compose.yaml` para produccion.

## Control de ejecucion
- El worker de backend se controla con `ENABLE_CAMPAIGNS` y `CAMPAIGN_WORKER_ENABLED`.
- Parametros de throughput: `CAMPAIGN_WORKER_BATCH_SIZE`, `CAMPAIGN_WORKER_INTERVAL_MS`, `CAMPAIGN_WORKER_MAX_ATTEMPTS`, `CAMPAIGN_RETRY_*`.
