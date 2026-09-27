# StacksClub — One-Shot Build Brief

Build **StacksClub**, a polished social market for tokenized stocks and creator-made stock baskets on BNB Chain. The repo already exists and is connected to GitHub, Codespaces, and Vercel. Work in the existing repository, adapting to its stack instead of replacing working infrastructure.

## Execution rules

- Before editing the repo, collect all missing secrets in **one secure hidden-input terminal prompt**. Never ask key by key, echo or print values, log them, put them in source, or expose them to browser code.
- Save local secrets atomically to .env.local with restrictive permissions. Ensure it is gitignored. If hidden input is unavailable, ask the user to enter them through Codespaces Secrets; never ask them to paste secrets into chat.
- Once keys have been gathered, keep moving. Make routine product and implementation choices yourself. Do not pause for style preferences, architecture tradeoffs, or decisions already made in this brief.
- Implement the connected app end to end in this run. Do not return a plan or scaffold-only shell.
- Avoid broad or repetitive test suites. Run quick existing build/lint checks and focused smoke checks of core flows, then fix concrete failures.
- Never fake quotes, swaps, stock prices, vault balances, transaction success, users, volume, or performance.
- Ask for the user's isolated deployer wallet private key in the one-time hidden-input key intake below. Never echo, print, log, commit, or expose it to browser code. It is only for deployment tooling, never for app custody or user transactions. Do not silently broadcast or deploy a contract to mainnet; prepare the scripts and dry-run, then let the user explicitly approve the real deployment transaction.
- Preserve sound repo conventions. Use the installed Impeccable skill for visual critique and refinement; inspect the running app in a browser.

## First action: collect keys once

Check existing environment configuration and reuse values already present. Prompt once, with hidden input, for any missing items in this list. Use a temporary shell script with read -s or an equivalent secure prompt; do not put values in command arguments. Write only variable names to .env.example.

Required:
- NEXT_PUBLIC_PRIVY_APP_ID
- PRIVY_APP_SECRET
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- BINANCE_WEB3_API_KEY
- BINANCE_WEB3_API_SECRET
- BSC_RPC_URL (Alchemy BNB Smart Chain mainnet endpoint)
- PINATA_JWT
- DEPLOYER_PRIVATE_KEY (isolated fresh deployment wallet only; never use as an app or user wallet)

Optional:
- BSCSCAN_API_KEY
- NEXT_PUBLIC_APP_URL (default to the existing Vercel URL)

Collect DEPLOYER_PRIVATE_KEY through hidden input in the same one-time prompt. Keep it out of .env.local and all Vercel runtime variables. Hold it only in a restricted, temporary deployment environment; erase any temporary copy as soon as deployment preparation/simulation is complete. Do not use or print it during normal app development. Supabase service-role key, Binance API secret, and Pinata JWT are server-only. Never use NEXT_PUBLIC_ for secrets. If any key is unavailable, continue the full build with an explicit “integration not configured” state and report only the missing variable names at the end.

## Configure the requested Codex tools

Check existing MCPs first and avoid duplicates. Install/configure these, continuing if an install or auth is unavailable:

- Playwright MCP for browser inspection: codex mcp add playwright npx "@playwright/mcp@latest"
- Vercel MCP: codex mcp add vercel --url https://mcp.vercel.com
- Context7 MCP for current framework/library docs. Use its official setup for the installed Codex version.
- Supabase plugin/MCP if and only if this repository uses Supabase; scope it to this project and avoid unnecessary account-level tools.

Use codex mcp list when available. For Solidity use Foundry and OpenZeppelin Contracts as repo dependencies, not an unreviewed “all-in-one Web3 agent” bundle. If this environment cannot install MCPs, include short setup instructions in the final handoff and continue.

## Brand and design

Name: **StacksClub**  
Tagline: **The social market for stocks and Stacks.**

Build a confident, friendly, high-quality financial social app. It should feel clear and lively, not like a casino or generic DeFi dashboard.

- Club Blue: #5B5BF7
- Deep Ink: #0B0D12
- Cloud: #F7F8FC
- Use accessible, restrained green/red movement colors.
- Manrope for headlines; Inter for body/interface.
- Responsive desktop and mobile. Purposeful, quick animation; respect reduced motion. Avoid blur-heavy hover effects.
- Main navigation: Discover, Stocks, Stacks, Portfolio, Profile.
- Use Impeccable to refine layout, hierarchy, typography, empty states, responsive behavior, and polish.

## Product rules

### Stock providers and catalogue

- Support bStocks, xStocks, and Ondo tokenized stock tokens on BNB Smart Chain.
- bStocks is the default where available. Users may compare other providers and select one for standalone stock purchases.
- An asset is identified by provider + chain + contract address, never ticker alone. Example: NVDA bStocks and NVDA Ondo are distinct assets.
- Use Binance Web3 APIs for hackathon RWA discovery/market data and Trading/Transaction integration where supported. Read current official docs and use the actual HMAC signing scheme and schemas; do not guess.
- Verify BSC chain ID 56, provider, token contract, decimals, and route availability. Maintain a curated allowlist; never trust creator- or browser-supplied addresses.
- “All available stocks” means supported, verified BNB assets returned by provider/API coverage. Mark unavailable, unsupported, stale, or unrouteable assets honestly.
- Compare provider, available price/quote, 24h movement, liquidity/route availability, and data timestamp. Distinguish indicative price from executable quote.
- Clearly label provider because backing, dividends/corporate actions, liquidity, and issuer redemption options may differ.
- “Redeem underlying” in this app means send exact held token quantities to the user wallet; do not promise issuer cash redemption.

### Sign-in and social profile

- Use Privy for email/social sign-in and embedded/external EVM wallet experience according to current SDK. Account creation comes before wallet details in the UX.
- Onboarding sets username, avatar, and bio. Allow an X profile URL, but do not show a verified badge without actual verification.
- Use Supabase for profiles, Stack metadata, follows, likes, and social/activity indexing. Enforce RLS and verify writes server-side.
- Chain state is authoritative for positions and transactions. Supabase is an index/cache, not proof of ownership.
- Do not fabricate people, trades, market volume, prices, or performance. Any sample content must be clearly labeled.

### Stacks and position ownership

- A Stack is an immutable recipe using verified stock provider tokens only in the initial release.
- Creator selects 2–5 assets, exact provider for each, weights summing to 100%, name, ticker, description, and image/icon. Product creation fee is zero; network gas can still apply.
- Store provider and exact BSC token address in each component. Recipe/weights cannot change after launch.
- Users buy using BNB, USDT, or USDC only where a real route exists. Show estimated allocation and minimum received before signature.
- Minimum buy: $5 for 1–3 assets, $10 for 4–5 assets.
- Do not automatically rebalance. Weights determine the buy recipe, not a promise that market-value weights stay fixed.
- No fungible Stack token. Each buy is individually accounted by a position NFT; in the UI call it a **position** and do not foreground NFT jargon.
- Track exact quantities bought per position. If repeated buys cannot safely be consolidated while preserving cost-basis/lot accounting, mint one NFT per buy and aggregate visually in the portfolio.
- Position valuation is indicative. Show cost basis and P&L only when supported by a defensible cost basis and price source. Separate mark value from executable sell quote.

### Orders, fees, sell, and redeem

- Buy fee 1%; sell fee 1%. For Stack buys, creator receives 25% of the buy fee; platform gets 75%. Standalone stock trades pay platform fee only. Show fee before signing.
- **Sell** converts the proportional underlying quantities to a selected supported settlement asset (USDC, USDT, or BNB), using real quotes, then sends proceeds to the user's wallet net of fee/slippage.
- **Redeem underlying** transfers proportional exact quantities of provider stock tokens back to the user's wallet. It supports partial redemption and does not convert to stablecoin.
- Partial operations must use exact per-position quantities, token decimals, and safe rounding; never over-withdraw.
- Be honest about transaction steps. Multiple swaps may need multiple wallet signatures. Never describe a multi-transaction workflow as atomic.
- If a multi-step buy fails partway, preserve user funds, show a clear resumable/recovery state, and never mark the order complete prematurely. Persist hashes/status and reconcile with chain.
- If the trade API cannot route directly into the vault, swaps execute in the user wallet and a separate user-signed transaction deposits assets. Explain this in the confirmation flow.
- Never route funds through an app-controlled EOA or expose a hot wallet.

## Technical direction

Adapt to the existing repository. If it is Next.js, preserve it.

- Frontend: existing Next.js/TypeScript/Tailwind stack; use existing UI component conventions.
- Wallet: Privy with viem/wagmi-compatible BNB Chain configuration, chain ID 56.
- Server: typed routes for Binance HMAC signing, quotes, catalogue refresh, Pinata upload, and safe Supabase operations.
- Database: Supabase Postgres migrations, RLS, indexes, generated types. Use service role only on server.
- Contracts: Solidity + Foundry + OpenZeppelin. Minimal Stack recipe registry, position NFT, and custody/accounting vault; split only when it materially improves safety.
- Images: server-side Pinata upload with type/size validation; save CID/URL. Include a polished local fallback.
- Prices: expose source and timestamp. Handle market closure, stale data, timeouts, rate limits, missing routes, and provider disagreement.

### Contract safety

- Only allowlisted provider token addresses and supported stablecoins. No arbitrary token deposits.
- Decide and enforce NFT transfer policy. Prefer transferable positions only if accounting, redemption, and indexing consistently follow ownerOf; otherwise make them non-transferable and explain why.
- Accounting invariant: each position’s withdrawable amount never exceeds its attributable balance. Never use pooled assets to promise exact deposits to a specific user.
- Use safe ERC20 transfer helpers, reentrancy protection, checked access control, pause/emergency controls with documented authority, custom errors, and events.
- Do not include an owner withdrawal path that can drain accounted user funds. Emergency recovery must exclude all user-accounted balances.
- Fee collection/distribution must be auditable onchain or explicitly identified as indexed/offchain. Do not rely on frontend accounting.
- Handle token return values, decimals, zero amounts, rounding, and failed transfers.
- Add only focused Foundry checks for position accounting, redemption, and access control. Avoid a bloated test suite.
- Include BSC mainnet deployment configuration and local simulation scripts. Do not broadcast without user review and wallet signature.

## Required app experience

1. **Discover:** social feed, featured creator cards, trending verified Stocks/Stacks only when backed by real data, search/categories, follow/like/save.
2. **Stocks:** searchable catalogue, logo, ticker, price, 24h move, provider comparison, route status, buy action.
3. **Stock detail:** provider comparison and buy panel; chart only when reliable historical data exists.
4. **Stack detail:** creator, immutable recipe/weights/provider labels, shareable page, Buy Stack flow.
5. **Create Stack:** choose 2–5 assets and exact provider, set weights with live 100% validation, image and preview, launch once.
6. **Portfolio:** position cards, value/cost basis/P&L where supported, exact token quantities/provider labels, partial Sell/Redeem, transaction history.
7. **Profile:** avatar, handle, bio, X link, created Stacks, positions/activity, follow counts.
8. **Auth/onboarding:** Privy signup first; wallet setup naturally after.
9. **Transaction UX:** fresh quote, expiry, fee, slippage/min received, provider, amounts, network, pending/success/failure/retry.
10. **Settings/help:** provider differences, fee policy, risk explanation, useful support placeholder only if there is no support endpoint.

Every primary button must work or be disabled with a plain reason. No fake charts, fake swaps, or finished-looking placeholder CTAs.

## Binance Web3 API integration

- Read the current official API docs before writing endpoints.
- Implement a small server-side adapter with typed validation, bounded timeouts, and correct HMAC auth.
- Never return API secret or auth signing material to the browser. Redact auth headers/payloads from logs.
- Cache/rate-limit public market data. Keep indicative market data distinct from trade quotes.
- Discover provider assets from RWA API and validate/persist an allowlist.
- Trade flow: request fresh quote, verify chain/token addresses, calculate fees and minimum output, simulate if supported, then ask user wallet to sign.
- Simulation does not replace user confirmation or onchain receipt verification.
- Do not invent endpoints, request/response formats, or support for a token. If no actual route exists, mark it “Not routable yet” and keep the rest of the app useful.

## Data consistency

Create migrations and types for:
- profiles: auth subject, wallet, unique username, avatar, bio, X URL
- assets: provider, chain, token address, symbol/name/decimals, underlying ticker, logo, data source/status/timestamp
- stacks and components: creator, slug/name/ticker/description/image, immutable recipe; asset and weight in basis points
- follows and Stack reactions
- positions and per-position per-asset raw balances, indexed only from verified events
- transactions: user, stack/position, type/status/hashes/quote metadata/timestamps
- auditable creator fee ledger/claims

Use idempotent indexing, unique constraints, feed/search indexes, RLS, and chain reconciliation. Never treat client-supplied state as proof of a transaction or ownership.

## Finish and handoff

Complete implementation in this run. End with a concise handoff stating:
- what works;
- local run command and Vercel URL if available;
- missing environment variable names only;
- whether Binance quote/swap routes are live or constrained by provider/API support;
- contract deployment status (never imply deployed when only scripts exist);
- only genuine user-dependent next steps, such as completing OAuth or signing deployment.

Do not stop to ask style, screen, architecture, or product questions. Use this brief and your judgment; ship the strongest coherent implementation the current repository supports.
