# STATUS

- Active campaign engine: backend Node/TS (`backend/src/services/CampaignServices/*`).
- Active flow: `Campaign -> CampaignRecipient -> OutboxMessage -> Sender -> WhatsApp`.
- Active worker in backend (`startCampaignWorker`) with locks, retries and rate limiting.
- Operational flags: `ENABLE_CAMPAIGNS` and `CAMPAIGN_WORKER_ENABLED`.
