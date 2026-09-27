# StacksClub

StacksClub is a Next.js/TypeScript app for exploring tokenized stocks and creator-made Stacks on BNB Smart Chain (chain ID 56). Listings, contract checks, wallet identity, and transaction capabilities are shown as separate states.

## Run locally

```bash
npm install
npm run dev
```

The app runs in read-only preview mode when integrations are missing. It does not invent prices, balances, quotes, social activity, or transaction receipts. Executable trades and Stack creation remain disabled until their wallet, provider, allowlist, and onchain flows are implemented and verified end to end.

## Environment

Copy `.env.example` to `.env.local`, fill it using your secret manager, and keep `.env.local` at mode `600`. Server-only values include `PRIVY_APP_SECRET`, `SUPABASE_SECRET_KEY`, `BINANCE_WEB3_API_SECRET`, `PINATA_JWT`, and `BSCSCAN_API_KEY`. The isolated deployment key is deliberately not part of `.env.local` or Vercel.

## Server adapters

- `GET /api/status` reports configured integration capabilities without exposing values.
- `GET /api/catalogue` reads Binance's BSC RWA catalogue and checks token bytecode, symbol, and decimals against BSC RPC. Stack allowlisting is a separate contract check.
- `GET /api/quote` and `GET /api/quotes` return unavailable states; they do not fabricate quotes.
- `GET`/`PUT /api/profile` verify the Privy access token server-side before accessing the matching Supabase profile.
- `POST /api/uploads` authenticates with Privy, checks image type/size, and uploads through Pinata.

Binance Web3 requests are signed server-side with the documented timestamp, receive window, exact path/query, and HMAC-SHA-256 preimage. Credentials and signatures are never sent to the browser.

## Contracts

`contracts/StacksClubVault.sol` combines immutable Stack recipes, non-transferable position NFTs, exact per-position token accounting, proportional redemption, fee collection, and an owner-managed allowlist. `script/simulate-deploy.sh` is simulation-only and does not broadcast. Foundry is required to compile and simulate the contract. Review the contract, deployer, gas estimate, treasury, and constructor values before any BSC mainnet broadcast.

## Database

Apply `supabase/migrations/202609270001_initial.sql` to create profile, asset, Stack, follow/reaction, transaction-cache, and creator-fee-ledger tables with RLS. Position balances and ownership are read from the contract; Supabase is not their source of truth.

## Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
forge build
```
