export type View = "discover" | "stocks" | "stacks" | "portfolio" | "profile";

export type AssetProvider = "bStocks" | "Ondo";

export type CatalogueAsset = {
  provider: AssetProvider;
  tokenAddress: `0x${string}`;
  symbol: string;
  name: string;
  underlyingTicker: string;
  decimals: number;
  logoUrl: string | null;
  shareRatio: string | null;
  marketStatus: string | null;
  browseAvailable: true;
  contractVerified: boolean;
  stackable: boolean;
  tradeable: false;
  source: "Binance Web3 RWA API";
};
