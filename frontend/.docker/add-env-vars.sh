_writeFrontendEnvVars() {
    ENV_JSON="$(jq --compact-output --null-input 'env | with_entries(select(.key | startswith("REACT_APP_") or startswith("VITE_")))')"
    ENV_JSON_ESCAPED="$(printf "%s" "${ENV_JSON}" | sed -e 's/[\&/]/\\&/g')"
    sed -i "s/<noscript id=\"env-insertion-point\"><\/noscript>/<script>var ENV=${ENV_JSON_ESCAPED}<\/script>/g" ${PUBLIC_HTML}index.html
}

_writeNginxEnvVars() {
    dockerize -template /etc/nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf
}

_appendLineOnce() {
    FILE_PATH=$1
    LINE=$2

    grep -Fqx "$LINE" "$FILE_PATH" 2>/dev/null || printf '%s\n' "$LINE" >> "$FILE_PATH"
}

_addSslConfig() {
    SSL_CERTIFICATE=/etc/nginx/ssl/${1}/fullchain.pem;
    SSL_CERTIFICATE_KEY=/etc/nginx/ssl/${1}/privkey.pem;
    FILE_CONF=/etc/nginx/sites.d/${1}.conf
    FILE_SSL_CONF=/etc/nginx/conf.d/00-ssl-redirect.conf;

    if [ -f ${SSL_CERTIFICATE} ] && [ -f ${SSL_CERTIFICATE_KEY} ]; then
        echo "saving ssl config in ${FILE_CONF}"
        _appendLineOnce "${FILE_SSL_CONF}" 'include include.d/ssl-redirect.conf;'
        _appendLineOnce "${FILE_CONF}" 'include "include.d/ssl.conf";'
        _appendLineOnce "${FILE_CONF}" "ssl_certificate ${SSL_CERTIFICATE};"
        _appendLineOnce "${FILE_CONF}" "ssl_certificate_key ${SSL_CERTIFICATE_KEY};"
    else
        _appendLineOnce "${FILE_CONF}" 'listen 80;'
        echo "ssl ${1} not found >> ${SSL_CERTIFICATE} -> ${SSL_CERTIFICATE_KEY}"
    fi;
}

_writeFrontendEnvVars;
_writeNginxEnvVars;

_addSslConfig 'backend'
_addSslConfig 'frontend'
