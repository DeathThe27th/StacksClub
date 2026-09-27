export type IntegrationKey = "privy" | "supabase" | "binance" | "rpc" | "pinata";

const env = process.env;

export const integrations: Record<IntegrationKey, { label: string; configured: boolean; detail: string }> = {
  privy: {
    label: "Wallet & sign-in",
    configured: Boolean(env.NEXT_PUBLIC_PRIVY_APP_ID && env.PRIVY_APP_SECRET),
    detail: "Privy app ID and server secret",
  },
  supabase: {
    label: "Profiles & social",
    configured: Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.SUPABASE_SERVICE_ROLE_KEY),
    detail: "Supabase URL, anon key, and service role key",
  },
  binance: {
    label: "Binance market data",
    configured: Boolean(env.BINANCE_WEB3_API_KEY),
    detail: "Binance API key",
  },
  rpc: {
    label: "BSC chain reads",
    configured: Boolean(env.BSC_RPC_URL),
    detail: "BSC mainnet RPC endpoint",
  },
  pinata: {
    label: "Stack artwork",
    configured: Boolean(env.PINATA_JWT),
    detail: "Pinata server token",
  },
};

export const isCatalogueLive = integrations.binance.configured && integrations.rpc.configured;
export const isWalletReady = integrations.privy.configured && integrations.rpc.configured;

export function missingIntegrationNames() {
  return Object.values(integrations)
    .filter((integration) => !integration.configured)
    .map((integration) => integration.detail);
}
