import { createPublicClient, http, isAddress } from "viem";
import { bsc } from "viem/chains";
import { NextResponse } from "next/server";
import { BinanceApiError, describeBinanceError, fetchRwaTokens } from "@/lib/server/binance";
import { isCatalogueLive, vaultAddress } from "@/lib/config";

const vaultAbi = [{
  type: "function", name: "allowedAsset", stateMutability: "view",
  inputs: [{ name: "asset", type: "address" }], outputs: [{ type: "bool" }],
}] as const;

const erc20Abi = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
] as const;

type CheckedToken = {
  provider: "bStocks" | "Ondo";
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

export async function GET() {
  if (!isCatalogueLive) {
    return NextResponse.json({ status: "integration_not_configured", assets: [], message: "Live market metadata and BSC contract checks are unavailable." }, { status: 503 });
  }

  try {
    const tokens = await fetchRwaTokens();
    const rpc = process.env.BSC_RPC_URL;
    if (!rpc) throw new Error("RPC is not configured");
    const client = createPublicClient({ chain: bsc, transport: http(rpc, { timeout: 7_000 }) });
    const candidates = tokens.filter((token) => token.assetType === 1 || token.assetType === 3);
    const assets = await Promise.all(candidates.map(async (token): Promise<CheckedToken> => {
      const tokenAddress = token.tokenContractAddress as `0x${string}`;
      const base = {
        provider: token.platformId === "bstock" ? "bStocks" as const : "Ondo" as const,
        tokenAddress,
        symbol: token.tokenSymbol,
        name: token.underlyingName || token.tokenName,
        underlyingTicker: token.underlyingTicker,
        decimals: Number(token.decimals),
        logoUrl: token.tokenLogoUrl ?? null,
        shareRatio: token.tokenToShareRatio ?? null,
        marketStatus: token.statusInfo?.marketStatus ?? null,
        browseAvailable: true as const,
        source: "Binance Web3 RWA API" as const,
      };
      if (!isAddress(tokenAddress) || !Number.isInteger(base.decimals) || base.decimals < 0 || base.decimals > 36) {
        return { ...base, contractVerified: false, stackable: false, tradeable: false };
      }

      try {
        const [code, decimals, symbol, stackable] = await Promise.all([
          client.getBytecode({ address: tokenAddress }),
          client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "decimals" }),
          client.readContract({ address: tokenAddress, abi: erc20Abi, functionName: "symbol" }),
          vaultAddress && isAddress(vaultAddress)
            ? client.readContract({ address: vaultAddress, abi: vaultAbi, functionName: "allowedAsset", args: [tokenAddress] })
            : Promise.resolve(false),
        ]);
        const contractVerified = Boolean(code && code !== "0x" && Number(decimals) === base.decimals && symbol.toLowerCase() === base.symbol.toLowerCase());
        return { ...base, contractVerified, stackable: contractVerified && Boolean(stackable), tradeable: false };
      } catch {
        return { ...base, contractVerified: false, stackable: false, tradeable: false };
      }
    }));

    return NextResponse.json({
      status: "provider_data_received",
      assets,
      checkedAt: new Date().toISOString(),
      message: "Browse metadata is from Binance. Only assets with matching BSC bytecode, decimals, and symbol are contract-verified; trade availability requires a fresh executable route.",
    }, { headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" } });
  } catch (error) {
    const diagnostic = describeBinanceError(error);
    console.warn("RWA catalogue request failed", { code: diagnostic.code, ...(error instanceof BinanceApiError ? { upstreamStatus: error.httpStatus, providerCode: error.providerCode } : {}) });
    return NextResponse.json({ status: diagnostic.code, assets: [], message: "Verified provider metadata is temporarily unavailable." }, { status: diagnostic.status });
  }
}
