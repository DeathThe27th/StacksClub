# StacksClub

StacksClub is a Next.js/TypeScript preview of a social market for verified tokenized stocks and creator-made stock baskets on BNB Chain.

## Run locally

```bash
npm install
npm run dev
```

The local app works in integration-aware preview mode. It never invents prices, balances, social activity, quotes, or transaction receipts when a provider or wallet integration is unavailable.

## Environment

Copy the names in `.env.example` into your local environment. Keep `.env.local` at mode `600`. Server-only values include `PRIVY_APP_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `BINANCE_WEB3_API_SECRET`, `PINATA_JWT`, and any deployment private key. The isolated deployment key is deliberately not part of `.env.local`.

## Server adapters

- `GET /api/status` reports configured integration capabilities without exposing values.
- `GET /api/catalogue` calls Binance's tokenized-assets market-data endpoint when configured, but does not treat provider coverage as a verified BSC token allowlist.
- `GET /api/quote?symbol=AAPL` returns an explicitly indicative quote when available.
- `POST /api/uploads` validates artwork input and remains gated until the production Pinata upload policy is approved.

The Binance market-data adapter follows the current documented API-key header flow. HMAC-SHA-256 signing is isolated for future signed endpoints and is not used for unsigned market-data calls.

## Contracts

`contracts/` contains the focused registry, non-transferable position NFT, and custody/accounting vault. `script/simulate-deploy.sh` is simulation-only and does not broadcast. Review contract code and deployment addresses before any real deployment transaction.

## Database

`supabase/migrations/202609270001_initial.sql` defines profiles, allowlisted assets, immutable stacks/components, reactions, positions/balances, transactions, and creator fee ledger tables with RLS policies and indexes.
