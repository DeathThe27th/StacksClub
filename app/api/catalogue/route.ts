import { NextResponse } from "next/server";
import { BinanceApiError, describeBinanceError, isBinanceConfigured } from "@/lib/server/binance";
import { integrations } from "@/lib/config";
import { fetchTokenizedAssets } from "@/lib/server/binance";

export async function GET() {
  if (!isBinanceConfigured()) {
    return NextResponse.json({
      status: "integration_not_configured",
      assets: [],
      message: "A Binance API key is required to fetch provider market data. BSC RPC is only needed for on-chain verification.",
    }, { status: 503 });
  }

  try {
    const providerAssets = await fetchTokenizedAssets();
    return NextResponse.json({
      status: "provider_data_received",
      assets: [],
      providerCoverage: providerAssets,
      message: "Provider coverage is available. BSC contract allowlist validation is still required before displaying assets.",
      dataTimestamp: new Date().toISOString(),
    }, { headers: { "Cache-Control": "s-maxage=15, stale-while-revalidate=60" } });
  } catch (error) {
    const diagnostic = describeBinanceError(error);
    console.warn("Binance catalogue request failed", { code: diagnostic.code, ...(error instanceof BinanceApiError ? { upstreamStatus: error.httpStatus, providerCode: error.providerCode } : {}) });
    return NextResponse.json({ status: diagnostic.code, assets: [], message: "Binance provider data is temporarily unavailable. Retry shortly." }, { status: diagnostic.status });
  }
}
