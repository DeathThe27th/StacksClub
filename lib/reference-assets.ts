export type ReferenceAsset = {
  symbol: string;
  name: string;
  provider: "bStocks" | "xStocks" | "Ondo";
  address: `0x${string}`;
  underlyingSymbol?: string;
};

// Provider contract references published by Trust Wallet and BNB Chain.
// These are for discovery only; StacksClub's allowlist and route checks remain
// unavailable until the integrations are configured.
export const referenceAssets: ReferenceAsset[] = [
  { symbol: "SPCXx", name: "SpaceX", provider: "xStocks", address: "0x68fa48b1c2fe52b3d776e1953e0e782b5044ce28" },
  { symbol: "SPCXon", name: "SpaceX", provider: "Ondo", address: "0xd0a58bc9d88d3ff48c0294cb7e45937d0e41a928" },
  { symbol: "SPCXB", name: "SpaceX", provider: "bStocks", address: "0xbe9d156892e55e7154bcd3cb0fea677f9d3103e1" },
  { symbol: "TSLAB", name: "Tesla", provider: "bStocks", address: "0x5b1910eaad6450e50f816082aa078c41f10c292f", underlyingSymbol: "TSLA" },
  { symbol: "CRCLB", name: "Circle", provider: "bStocks", address: "0x80f3d493ebce97e343c53d29a137942416b4ffc0", underlyingSymbol: "CRCL" },
  { symbol: "MUB", name: "Micron", provider: "bStocks", address: "0xcdf2f3e0fa43c47a6662a91c9e4a7c5f69762699", underlyingSymbol: "MU" },
  { symbol: "SNDKB", name: "SanDisk", provider: "bStocks", address: "0x3ee4df61bd4f867e349beae8bfe07bc31b4850fb", underlyingSymbol: "SNDK" },
  { symbol: "NVDAB", name: "NVIDIA", provider: "bStocks", address: "0x02fca66c1d1afb4e2a7884261eb00f63598a7436", underlyingSymbol: "NVDA" },
  { symbol: "AMDB", name: "AMD", provider: "bStocks", address: "0x75fd4cf6f8392e41e70391d60c90c0d5211603a1", underlyingSymbol: "AMD" },
  { symbol: "EWYB", name: "iShares MSCI South Korea ETF", provider: "bStocks", address: "0xbe82f76637dba2c114c41df856c2c51e522e2cb8", underlyingSymbol: "EWY" },
  { symbol: "INTCB", name: "Intel", provider: "bStocks", address: "0xe614e2fc6c787035ff51f452e8e826bfd32d5283", underlyingSymbol: "INTC" },
  { symbol: "MSTRB", name: "Strategy", provider: "bStocks", address: "0xe87afb3076aeb0f9b14e368de8145ae6a2826a14", underlyingSymbol: "MSTR" },
];
