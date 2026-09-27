# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Next.js, TypeScript, Tailwind CSS, viem/wagmi-compatible wallet flows, Supabase, Solidity/Foundry contracts where supported by the current repository.

## Users

Primary users are people exploring tokenized stocks on BNB Smart Chain who want to discover, compare, buy, hold, sell, or redeem verified stock-backed assets. Secondary users are creators who publish immutable stock baskets and earn a defined share of stack-buy fees.

## Product Purpose

StacksClub is a social market for tokenized stocks and creator-made stock baskets on BNB Chain. It helps people discover verified assets and community-made stacks, understand provider and route differences, and complete wallet-signed transactions when reliable integrations are available.

## Positioning

The product combines a social discovery layer with provider-aware tokenized-stock market data and immutable creator recipes, while keeping chain state authoritative and clearly separating indicative marks from executable quotes.

## Operating Context

Users browse a feed and verified stock catalogue, inspect provider-specific assets, create or buy immutable stacks, and manage exact per-position balances. Wallet, market-data, quote, upload, and database integrations may be unavailable in local development; unavailable capabilities must be explicit rather than simulated.

## Capabilities and Constraints

- Main navigation: Discover, Stocks, Stacks, Portfolio, Profile.
- BSC chain ID is 56. Assets are identified by provider, chain, and exact contract address, never ticker alone.
- Initial providers are bStocks, xStocks, and Ondo. Only verified allowlisted assets and supported stablecoins may be used.
- Stack recipes contain 2–5 assets with provider labels and weights totaling 100%; recipes are immutable after launch.
- Buy and sell fees are 1%; stack-buy creator share is 25% of the fee and platform share is 75%.
- Buy, sell, and redeem flows must show quote freshness, fees, slippage/minimum received, provider, amounts, network, and transaction status.
- Positions track exact quantities and may be aggregated visually only when lot accounting remains defensible. Indicative mark value is distinct from executable sell quote.
- Privy, Supabase, Binance Web3, Pinata, and BSC RPC are server/integration dependencies. Missing configuration is an honest integration-not-configured state.
- No fabricated people, trades, quotes, balances, performance, volume, charts, or transaction success.

## Brand Commitments

The product name is StacksClub. The tagline is “The social market for stocks and Stacks.” The visual direction is confident, friendly, clear, and lively without casino or generic DeFi-dashboard conventions. Club Blue is #5B5BF7, Deep Ink is #0B0D12, and Cloud is #F7F8FC. Manrope is used for headlines and Inter for body/interface text. Responsive desktop and mobile behavior and reduced-motion support are required.

## Evidence on Hand

The repository contains the authoritative one-shot build brief at `LetsBuildStack.md`. No production credentials, API responses, user content, contracts, or verified market snapshots were present during initialization; future UI must label absent integrations and illustrative examples accordingly.

## Product Principles

- Chain state is authoritative; databases index and accelerate, but never prove ownership.
- Every financial number carries its source, freshness, and whether it is indicative or executable.
- Provider differences are visible before a user signs.
- Social discovery should feel human and useful without inventing social proof.
- Every primary action works when supported or explains plainly why it is unavailable.

## Accessibility & Inclusion

Use accessible contrast, keyboard-visible focus, semantic controls, reduced-motion support, readable responsive layouts, and plain-language transaction/error states. Financial movement colors must not be the sole carrier of meaning.
