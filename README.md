# DismalCRM

Instancia independiente de atencion comercial para Dismal. Gestiona contactos,
tickets, conversaciones, campanas y dos conexiones de WhatsApp de Ecuador.

## Aislamiento

- Dominio publico: `https://dismal.vip`
- API y Socket.IO: mismo dominio, bajo `/api` y `/socket.io`
- Proyecto Docker: `dismalcrm`
- Base de datos: `dismalcrm`
- Puertos locales: frontend `7001`, backend `8081`
- Pais permitido para WhatsApp: Ecuador (`593`)
- Maximo de conexiones WhatsApp: `2`

No copie desde MaleskinCRM los directorios `.docker/data`,
`backend/.wwebjs_auth`, `backend/public`, `ssl` ni el archivo `.env`. DismalCRM
debe tener base, sesiones, archivos y secretos propios.

## Preparacion

1. Cree un registro DNS `A` para `dismal.vip` apuntando a la IP publica del VPS.
2. Cree un repositorio Git nuevo para DismalCRM y configure su `origin`.
3. En el VPS clone ese repositorio en `~/DismalCRM`.
4. Copie `.env.example` como `.env` y complete todos los secretos vacios.

Genere secretos independientes, por ejemplo:

```bash
openssl rand -hex 48
```

Defina obligatoriamente en `.env`:

```dotenv
MYSQL_ROOT_PASSWORD=CLAVE_UNICA_Y_SEGURA
JWT_SECRET=SECRETO_UNICO
JWT_REFRESH_SECRET=OTRO_SECRETO_UNICO
BOOTSTRAP_ADMIN_EMAIL=admin@dismal.vip
BOOTSTRAP_ADMIN_PASSWORD=CLAVE_DE_12_O_MAS_CARACTERES
```

El despliegue inicial crea una sola empresa llamada Dismal y el administrador
solo si la base esta vacia. No ejecute `db:seed:legacy` en produccion.

Despues del primer ingreso, cambie la contrasena desde DismalCRM, deje
`BOOTSTRAP_ADMIN_PASSWORD=` vacio y vuelva a desplegar. En una base que ya tiene
usuarios el inicializador no necesita conservar esa clave.

## Despliegue en el VPS

```bash
cd ~/DismalCRM
sh scripts/deploy_easypanel.sh
```

El script construye los contenedores, conecta el frontend a la red de
Easypanel, instala la ruta HTTPS de Traefik y valida la API publica.

Comprobacion:

```bash
docker compose ps
curl -fsS https://dismal.vip/api/healthz
```

Acceso: `https://dismal.vip/login`.

## Dos numeros de Ecuador

En **Conexiones** cree `Dismal Ecuador 1`, lea su QR y espere el estado
`CONNECTED`. Repita con `Dismal Ecuador 2`. El backend rechaza un tercer
registro WhatsApp y desconecta cualquier sesion cuyo numero no empiece por
`593` o no tenga la longitud ecuatoriana valida.

Las dos lineas deben pertenecer a Dismal y no pueden compartir las sesiones de
MaleskinCRM. Asigne colas y usuarios desde la administracion despues de enlazar
cada numero.

## Actualizaciones

```bash
cd ~/DismalCRM
git pull --ff-only origin main
sh scripts/deploy_easypanel.sh
```

Antes de actualizar, respalde la base, `backend/public` y
`backend/.wwebjs_auth`.
