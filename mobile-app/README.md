# DismalCRM Mobile

Aplicacion Expo independiente, identificada como `com.dismal.crm` y conectada
a `https://dismal.vip`.

```bash
npm install
npm run typecheck
npx eas build --platform android --profile preview
```

El perfil `preview` produce un APK instalable. Genere el APK solamente despues
de publicar y validar `https://dismal.vip/api/healthz`.
