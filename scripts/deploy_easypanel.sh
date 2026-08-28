#!/usr/bin/env sh
set -eu

SCRIPT_DIR=${0%/*}
[ "$SCRIPT_DIR" = "$0" ] && SCRIPT_DIR=.
ROOT_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
COMPOSE_OVERRIDE="$ROOT_DIR/config/easypanel/docker-compose.override.yml"
TRAEFIK_TEMPLATE="$ROOT_DIR/config/easypanel/traefik-dismalcrm.template.yml"

read_env_value() {
  KEY=$1
  [ -f "$ROOT_DIR/.env" ] || return 0
  sed -n "s/^${KEY}=//p" "$ROOT_DIR/.env" | tail -n 1 | sed 's/^"//;s/"$//'
}

EASYPANEL_PROXY_NETWORK=${EASYPANEL_PROXY_NETWORK:-$(read_env_value EASYPANEL_PROXY_NETWORK)}
EASYPANEL_TRAEFIK_SERVICE=${EASYPANEL_TRAEFIK_SERVICE:-$(read_env_value EASYPANEL_TRAEFIK_SERVICE)}
EASYPANEL_HTTP_ENTRYPOINT=${EASYPANEL_HTTP_ENTRYPOINT:-$(read_env_value EASYPANEL_HTTP_ENTRYPOINT)}
EASYPANEL_HTTPS_ENTRYPOINT=${EASYPANEL_HTTPS_ENTRYPOINT:-$(read_env_value EASYPANEL_HTTPS_ENTRYPOINT)}
EASYPANEL_CERT_RESOLVER=${EASYPANEL_CERT_RESOLVER:-$(read_env_value EASYPANEL_CERT_RESOLVER)}
EASYPANEL_TRAEFIK_CONFIG_DIR=${EASYPANEL_TRAEFIK_CONFIG_DIR:-$(read_env_value EASYPANEL_TRAEFIK_CONFIG_DIR)}
PUBLIC_DOMAIN=${PUBLIC_DOMAIN:-$(read_env_value PUBLIC_DOMAIN)}

EASYPANEL_PROXY_NETWORK=${EASYPANEL_PROXY_NETWORK:-easypanel}
EASYPANEL_TRAEFIK_SERVICE=${EASYPANEL_TRAEFIK_SERVICE:-easypanel-traefik}
EASYPANEL_HTTP_ENTRYPOINT=${EASYPANEL_HTTP_ENTRYPOINT:-http}
EASYPANEL_HTTPS_ENTRYPOINT=${EASYPANEL_HTTPS_ENTRYPOINT:-https}
EASYPANEL_CERT_RESOLVER=${EASYPANEL_CERT_RESOLVER:-letsencrypt}
EASYPANEL_TRAEFIK_CONFIG_DIR=${EASYPANEL_TRAEFIK_CONFIG_DIR:-/data/config}
PUBLIC_DOMAIN=${PUBLIC_DOMAIN:-dismal.vip}
fail() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

compose() {
  docker compose \
    -f "$ROOT_DIR/docker-compose.yaml" \
    -f "$COMPOSE_OVERRIDE" \
    "$@"
}

wait_for_http() {
  SERVICE=$1
  URL=$2
  LABEL=$3
  ATTEMPT=0

  printf 'Esperando %s...\n' "$LABEL"
  while [ "$ATTEMPT" -lt 40 ]; do
    if compose exec -T "$SERVICE" wget -q -O /dev/null "$URL"; then
      printf '%s disponible.\n' "$LABEL"
      return 0
    fi
    ATTEMPT=$((ATTEMPT + 1))
    sleep 3
  done

  fail "$LABEL no respondio despues de 120 segundos."
}

resolve_config_paths() {
  docker inspect "$PROXY_CONTAINER" \
    --format '{{range .Mounts}}{{println .Source "|" .Destination}}{{end}}' |
    while IFS='|' read -r SOURCE DESTINATION; do
      SOURCE=$(printf '%s' "$SOURCE" | sed 's/[[:space:]]*$//')
      DESTINATION=$(printf '%s' "$DESTINATION" | sed 's/^[[:space:]]*//')

      case "$EASYPANEL_TRAEFIK_CONFIG_DIR" in
        "$DESTINATION")
          printf '%s|%s\n' "$SOURCE" "$DESTINATION"
          return 0
          ;;
        "$DESTINATION"/*)
          SUFFIX=${EASYPANEL_TRAEFIK_CONFIG_DIR#"$DESTINATION"}
          printf '%s%s|%s\n' "$SOURCE" "$SUFFIX" "$EASYPANEL_TRAEFIK_CONFIG_DIR"
          return 0
          ;;
        "$SOURCE")
          printf '%s|%s\n' "$SOURCE" "$DESTINATION"
          return 0
          ;;
        "$SOURCE"/*)
          SUFFIX=${EASYPANEL_TRAEFIK_CONFIG_DIR#"$SOURCE"}
          printf '%s|%s%s\n' "$EASYPANEL_TRAEFIK_CONFIG_DIR" "$DESTINATION" "$SUFFIX"
          return 0
          ;;
      esac
    done
}

wait_for_public_https() {
  ATTEMPT=0
  RESPONSE_FILE=$(mktemp)

  printf 'Validando dominio, certificado y API publica...\n'
  while [ "$ATTEMPT" -lt 60 ]; do
    if HTTP_CODE=$(curl -sS \
      --connect-timeout 5 \
      --max-time 10 \
      --resolve "$PUBLIC_DOMAIN:443:127.0.0.1" \
      -o "$RESPONSE_FILE" \
      -w '%{http_code}' \
      "https://$PUBLIC_DOMAIN/api/healthz") &&
      [ "$HTTP_CODE" = "200" ] &&
      grep -q '"status":"ok"' "$RESPONSE_FILE"; then
      rm -f "$RESPONSE_FILE"
      printf 'Dominio, certificado y API publica disponibles.\n'
      return 0
    fi

    ATTEMPT=$((ATTEMPT + 1))
    sleep 3
  done

  rm -f "$RESPONSE_FILE"
  docker service logs --tail 80 "$EASYPANEL_TRAEFIK_SERVICE" >&2 || true
  fail "$PUBLIC_DOMAIN no publico una API HTTPS valida despues de 180 segundos."
}

command -v docker >/dev/null 2>&1 || fail "Docker no esta instalado."
docker compose version >/dev/null 2>&1 || fail "Docker Compose no esta disponible."
docker info >/dev/null 2>&1 || fail "El usuario actual no puede usar Docker."

[ -f "$COMPOSE_OVERRIDE" ] || fail "No existe $COMPOSE_OVERRIDE."
[ -f "$TRAEFIK_TEMPLATE" ] || fail "No existe $TRAEFIK_TEMPLATE."

docker network inspect "$EASYPANEL_PROXY_NETWORK" >/dev/null 2>&1 ||
  fail "No existe la red $EASYPANEL_PROXY_NETWORK de Easypanel."

ATTACHABLE=$(docker network inspect "$EASYPANEL_PROXY_NETWORK" --format '{{.Attachable}}')
[ "$ATTACHABLE" = "true" ] ||
  fail "La red $EASYPANEL_PROXY_NETWORK no es attachable."

docker service inspect "$EASYPANEL_TRAEFIK_SERVICE" >/dev/null 2>&1 ||
  fail "No existe el servicio $EASYPANEL_TRAEFIK_SERVICE."

PROXY_CONTAINER=$(docker ps \
  --filter "name=$EASYPANEL_TRAEFIK_SERVICE" \
  --format '{{.ID}}' | head -n 1)
[ -n "$PROXY_CONTAINER" ] || fail "No se encontro el contenedor activo de Traefik."

CONFIG_PATHS=$(resolve_config_paths)
[ -n "$CONFIG_PATHS" ] ||
  fail "La carpeta $EASYPANEL_TRAEFIK_CONFIG_DIR no corresponde a un montaje de Traefik."
TRAEFIK_HOST_CONFIG_DIR=${CONFIG_PATHS%%|*}
TRAEFIK_CONTAINER_CONFIG_DIR=${CONFIG_PATHS#*|}
TRAEFIK_TARGET="$TRAEFIK_HOST_CONFIG_DIR/dismalcrm.yml"
TRAEFIK_CONTAINER_TARGET="$TRAEFIK_CONTAINER_CONFIG_DIR/dismalcrm.yml"

printf 'Validando Docker Compose...\n'
compose config --quiet

printf 'Construyendo y actualizando DismalCRM...\n'
compose up -d --build

printf 'Verificando servicios internos...\n'
compose ps
wait_for_http frontend http://127.0.0.1/login "el frontend"
wait_for_http backend http://127.0.0.1:3000/healthz "el backend"
wait_for_http frontend http://127.0.0.1/api/healthz "la API interna desde el frontend"

# Recreate the frontend after backend updates so Nginx renders its runtime
# environment and exposes the internal API route through /api.
printf 'Actualizando la conexion interna del frontend...\n'
compose up -d --force-recreate --no-deps frontend
wait_for_http frontend http://127.0.0.1/login "el frontend actualizado"
wait_for_http frontend http://127.0.0.1/api/healthz "la API actualizada desde el frontend"

printf 'Instalando rutas HTTPS de Traefik...\n'
mkdir -p "$TRAEFIK_HOST_CONFIG_DIR"
TMP_CONFIG=$(mktemp)
trap 'rm -f "$TMP_CONFIG"' EXIT HUP INT TERM

sed \
  -e "s/__HTTP_ENTRYPOINT__/$EASYPANEL_HTTP_ENTRYPOINT/g" \
  -e "s/__HTTPS_ENTRYPOINT__/$EASYPANEL_HTTPS_ENTRYPOINT/g" \
  -e "s/__CERT_RESOLVER__/$EASYPANEL_CERT_RESOLVER/g" \
  -e "s/__DOMAIN__/$PUBLIC_DOMAIN/g" \
  "$TRAEFIK_TEMPLATE" > "$TMP_CONFIG"

if [ -f "$TRAEFIK_TARGET" ]; then
  cp "$TRAEFIK_TARGET" "$TRAEFIK_TARGET.backup"
fi
install -m 0644 "$TMP_CONFIG" "$TRAEFIK_TARGET"

docker exec "$PROXY_CONTAINER" test -r "$TRAEFIK_CONTAINER_TARGET" ||
  fail "Traefik no puede leer $TRAEFIK_CONTAINER_TARGET."

printf 'Reiniciando solamente el proxy de Easypanel...\n'
docker service update --force "$EASYPANEL_TRAEFIK_SERVICE" >/dev/null

printf 'Esperando la recarga de Traefik...\n'
ATTEMPT=0
RUNNING=
while [ "$ATTEMPT" -lt 30 ]; do
  RUNNING=$(docker service ls \
    --filter "name=$EASYPANEL_TRAEFIK_SERVICE" \
    --format '{{.Replicas}}')
  [ "$RUNNING" = "1/1" ] && break
  ATTEMPT=$((ATTEMPT + 1))
  sleep 2
done
[ "$RUNNING" = "1/1" ] || fail "Traefik no regreso al estado 1/1."

wait_for_public_https

printf '\nDespliegue completado. Verifique:\n'
printf '  https://%s/login\n' "$PUBLIC_DOMAIN"
printf '  https://%s/api/healthz\n' "$PUBLIC_DOMAIN"
