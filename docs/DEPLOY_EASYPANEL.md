# Publicacion segura de DismalCRM

DismalCRM usa un unico origen publico:

- Web: `https://dismal.vip`
- API: `https://dismal.vip/api`
- Socket.IO: `https://dismal.vip/socket.io`
- Archivos: `https://dismal.vip/public`

Esta topologia evita CORS innecesario y permite que Traefik gestione HTTPS.
Los puertos `7001` y `8081` quedan enlazados solamente a `127.0.0.1`.

## Variables esenciales

```dotenv
COMPOSE_PROJECT_NAME=dismalcrm
PUBLIC_DOMAIN=dismal.vip
BACKEND_URL=https://dismal.vip
FRONTEND_URL=https://dismal.vip
BACKEND_SERVER_NAME=
BACKEND_PORT=8081
FRONTEND_PORT=7001
APP_COUNTRY=EC
WHATSAPP_ALLOWED_COUNTRY_CODE=593
WHATSAPP_MAX_CONNECTIONS=2
```

No reutilice secretos ni volumenes de MaleskinCRM. Compruebe que la red
`easypanel` exista y sea `attachable`; despues ejecute:

```bash
cd ~/DismalCRM
sh scripts/deploy_easypanel.sh
```

El archivo dinamico resultante de Traefik es `dismalcrm.yml`. El script
determina el montaje real de `/data/config` antes de escribirlo.
