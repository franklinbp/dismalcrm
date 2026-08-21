# Implementacion Meta Messenger e Instagram

## Objetivo

Unir Facebook Messenger e Instagram Direct a DismalCRM como canales adicionales sin tocar la operacion actual de WhatsApp.

## Estado tecnico

- WhatsApp sigue usando sus sesiones actuales.
- Messenger usa el objeto Meta `page` y se guarda con `channel = facebook`.
- Instagram usa el objeto Meta `instagram` y se guarda con `channel = instagram`.
- El webhook publico queda disponible en:
  - `GET /webhook/meta`
  - `POST /webhook/meta`
  - `GET /webhooks/meta`
  - `POST /webhooks/meta`

## Configuracion grafica recomendada

En DismalCRM entra a:

```text
Configuracion -> Meta Messenger e Instagram
```

Completa:

- `Verify Token`
- `Meta App ID`
- `Meta App Secret`
- `Version Graph API`

Luego entra a:

```text
Conexiones -> Agregar
```

Y crea una conexion por cada canal:

- `Messenger`: ID de pagina Facebook + Page Access Token.
- `Instagram`: ID Instagram Business + Page Access Token.

## Variables opcionales por entorno

Si prefieres configurar por `.env`, tambien se soporta:

```env
META_VERIFY_TOKEN=un_token_seguro_para_validar_webhook
META_APP_ID=app_id_de_meta
META_APP_SECRET=app_secret_de_meta
META_GRAPH_VERSION=v13.0
```

Tambien se mantienen compatibles las variables antiguas:

```env
VERIFY_TOKEN=whaticket
FACEBOOK_APP_ID=app_id_de_meta
FACEBOOK_APP_SECRET=app_secret_de_meta
FACEBOOK_GRAPH_VERSION=v13.0
```

## Configuracion en Meta

1. Crear o usar una app en Meta for Developers.
2. Agregar el producto Messenger.
3. Configurar webhook con:
   - Callback URL: `https://TU_DOMINIO/webhook/meta`
   - Verify Token: el valor de `META_VERIFY_TOKEN`
4. Suscribir los eventos de mensajes de la pagina.
5. Conectar la pagina de Facebook.
6. Para Instagram, la cuenta debe ser profesional y estar vinculada a una pagina de Facebook.
7. Solicitar los permisos necesarios en revision de Meta antes de operar con clientes reales.

## Registro de cuentas Meta en DismalCRM

Cada pagina/cuenta Meta debe existir en la tabla `Whatsapps` con estos campos:

- `name`: nombre visible de la conexion.
- `channel`: `facebook` o `instagram`.
- `status`: `CONNECTED`.
- `facebookPageUserId`: ID externo que llega en `entry.id` del webhook.
- `facebookUserToken`: Page Access Token valido.
- `companyId`: empresa propietaria.

Ejemplo SQL para registrar Messenger:

```sql
insert into `Whatsapps`
  (`name`, `status`, `channel`, `facebookPageUserId`, `facebookUserToken`, `companyId`, `createdAt`, `updatedAt`)
values
  ('Facebook Messenger', 'CONNECTED', 'facebook', 'PAGE_ID', 'PAGE_ACCESS_TOKEN', 1, now(), now());
```

Ejemplo SQL para registrar Instagram:

```sql
insert into `Whatsapps`
  (`name`, `status`, `channel`, `facebookPageUserId`, `facebookUserToken`, `companyId`, `createdAt`, `updatedAt`)
values
  ('Instagram Direct', 'CONNECTED', 'instagram', 'IG_BUSINESS_ACCOUNT_ID', 'PAGE_ACCESS_TOKEN', 1, now(), now());
```

## Prueba controlada

1. Actualizar variables de entorno.
2. Ejecutar migraciones.
3. Reiniciar backend.
4. En Meta, validar el webhook.
5. Enviar un mensaje de prueba desde una cuenta externa a la pagina o Instagram.
6. Revisar logs:

```bash
docker compose logs backend --since=5m
```

7. Confirmar que se crea o actualiza contacto, ticket y mensaje con el canal correcto.

## Criterio de seguridad

No se debe reutilizar la tabla de sesiones WhatsApp como si fuera QR. Para Meta, los registros son conexiones por token y webhook. Si una cuenta Meta no esta registrada, el backend recibe el webhook pero no crea tickets.
