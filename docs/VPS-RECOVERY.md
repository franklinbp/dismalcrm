# VPS Recovery Runbook

## Scope
- Active campaign engine: `backend` (Node/TS) only.

## 1) Preconditions
- Run from repo root on VPS.
- Docker + Docker Compose installed.
- `.env` exists at repo root.

## 2) Fast diagnostics
Run:

```bash
./scripts/vps-diagnose.sh | tee vps-diagnose.log
```

Save `vps-diagnose.log`. This is the base for root-cause analysis.

## 3) Clean restart (main stack)
```bash
docker compose down
docker compose up -d --build
docker compose ps
docker compose logs --tail=200 mysql backend frontend
```

Expected:
- `mysql` healthy and accepting connections.
- `backend` without migration/auth errors and with campaign worker enabled.
- `frontend` serves HTML.

## 4) High-probability deployment issues in this repo

### Issue A: campaigns disabled in backend
If `ENABLE_CAMPAIGNS=false`, endpoints/worker stay off.
Set in main stack/backend env:
```bash
ENABLE_CAMPAIGNS=true
CAMPAIGN_WORKER_ENABLED=true
```

### Issue B: missing backend secrets
Main stack requires:
- `MYSQL_ROOT_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

If missing, backend will fail at start by compose variable validation.

### Issue C: stale auth/session files
If WhatsApp session state is broken:
```bash
docker compose down
rm -rf backend/.wwebjs_auth/*
docker compose up -d --build
```
Only do this if you accept re-pairing WhatsApp sessions via QR.

## 5) Health checks
```bash
curl -i http://localhost:${BACKEND_PORT:-5001}/
curl -i http://localhost:${FRONTEND_PORT:-3002}/
curl -i http://localhost:${BACKEND_PORT:-5001}/campaigns
```

## 6) Safe rollback
If latest deploy failed and you have git history:
```bash
git log --oneline -n 5
git checkout <last-known-good-commit>
docker compose down
docker compose up -d --build
```

## 7) What to send for assisted fix
Share:
- `vps-diagnose.log`
- `docker compose ps`
- `docker compose logs --tail=200 backend`
