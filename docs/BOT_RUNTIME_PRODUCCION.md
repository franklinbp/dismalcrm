# Bot visual en produccion

## Objetivo

El motor visual permite responder mensajes reales de WhatsApp con reglas
deterministas, adjuntos locales y acciones comerciales. Cada ejecucion pertenece
a una empresa y queda auditada por flujo, regla, ticket y mensaje.

El bot no se activa solamente por instalar la actualizacion. Deben cumplirse
estas tres condiciones:

1. `BOT_RUNTIME_ENABLED=true` en el backend.
2. El flujo debe estar marcado como **Listo**.
3. El flujo debe estar **Publicado en WhatsApp**.

## Controles de seguridad

- Un mensaje se procesa una sola vez mediante `companyId + channel + messageId`.
- Un flujo publicado tiene prioridad sobre el contestador automatico legado.
- Si no coincide una regla, el mensaje continua al enrutamiento normal de colas.
- Si una ejecucion falla, queda en `FAILED` y no reenvia automaticamente para
  evitar respuestas duplicadas.
- No se responde en grupos, mensajes enviados por el usuario ni tickets que ya
  tienen un agente asignado.
- Los contactos, tickets, mensajes, reglas y ejecuciones quedan aislados por
  empresa.
- Solo se permiten adjuntos dentro de `backend/public`; se rechazan rutas fuera
  de esa carpeta y URL externas.
- Un flujo publicado no puede editarse. Primero debe retirarse de produccion.
- Solo puede existir un flujo publicado por canal y empresa.

## Despliegue seguro

1. Actualizar el codigo y reconstruir los contenedores con el interruptor
   apagado:

   ```bash
   BOT_RUNTIME_ENABLED=false
   docker compose up -d --build
   ```

2. Confirmar que el backend esta sano y que la migracion fue aplicada:

   ```bash
   docker compose ps
   docker compose logs --tail=200 backend
   ```

3. Entrar en **Automatizaciones Bot**, instalar o revisar reglas y usar
   **Probar regla** y **Simular**. Marcar el flujo como **Listo**.

4. Para adjuntos, colocar el archivo en el volumen persistente de
   `backend/public`. Por ejemplo, la fuente
   `catalogos/catalogo-general.pdf` debe existir físicamente en:

   ```text
   backend/public/catalogos/catalogo-general.pdf
   ```

5. Habilitar el motor y recrear solamente el backend:

   ```bash
   BOT_RUNTIME_ENABLED=true
   docker compose up -d --force-recreate backend
   ```

6. Recargar la consola. Debe aparecer **Motor habilitado**. Publicar el flujo y
   enviar un mensaje de prueba desde un numero controlado.

7. Revisar **Actividad de produccion**. Los estados esperados son:

   - `REPLIED`: respuesta enviada.
   - `HANDOFF`: respuesta enviada y ticket transferido a atencion humana.
   - `NO_MATCH`: ninguna regla coincidio; continua el flujo normal.
   - `FAILED`: error registrado y envio automatico detenido para ese mensaje.

## Apagado de emergencia

Retirar el flujo desde la consola o deshabilitar globalmente el motor:

```bash
BOT_RUNTIME_ENABLED=false
docker compose up -d --force-recreate backend
```

El historial queda disponible en `BotExecutions` y no se eliminan reglas,
contactos ni conversaciones.
