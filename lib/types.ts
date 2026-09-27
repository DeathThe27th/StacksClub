export type View = "discover" | "stocks" | "stacks" | "portfolio" | "profile";

export type AssetProvider = "bStocks" | "xStocks" | "Ondo";

export type CatalogueAsset = {
  provider: AssetProvider;
  symbol: string;
  name: string;
  status: "verified" | "pending" | "not-routable";
  contractAddress?: `0x${string}`;
  chainId: 56;
  decimals?: number;
  dataTimestamp?: string;
};
