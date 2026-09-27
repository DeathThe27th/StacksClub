import { NextResponse } from "next/server";
import { referenceAssets } from "@/lib/reference-assets";
import { BinanceApiError, describeBinanceError, fetchQuote, isBinanceConfigured, type BinanceQuote } from "@/lib/server/binance";

export async function GET() {
  if (!isBinanceConfigured()) {
    return NextResponse.json({ status: "integration_not_configured", quotes: {}, message: "A Binance API key is required for live underlying quotes." }, { status: 503 });
  }

  const assets = referenceAssets.filter((asset) => asset.provider === "bStocks" && asset.underlyingSymbol);
  const results = await Promise.all(assets.map(async (asset) => {
    try {
      const quote = await fetchQuote(asset.underlyingSymbol!);
      return [asset.symbol, { status: "indicative", underlyingSymbol: asset.underlyingSymbol, quote }] as const;
    } catch (error) {
      const diagnostic = describeBinanceError(error);
      console.warn("Binance quote request failed", {
        symbol: asset.underlyingSymbol,
        code: diagnostic.code,
        ...(error instanceof BinanceApiError ? { upstreamStatus: error.httpStatus, providerCode: error.providerCode } : {}),
      });
      return [asset.symbol, { status: diagnostic.code, underlyingSymbol: asset.underlyingSymbol }] as const;
    }
  }));

  const quotes = Object.fromEntries(results);
  const hasQuote = results.some(([, result]) => result.status === "indicative");
  return NextResponse.json({
    status: hasQuote ? "partial" : results[0]?.[1].status ?? "no_quotes",
    source: "Binance Stocks Trading REST API",
    quotes: quotes as Record<string, { status: string; underlyingSymbol: string; quote?: BinanceQuote }>,
    fetchedAt: new Date().toISOString(),
    tradeRoutes: "not_implemented",
  }, { headers: { "Cache-Control": "s-maxage=15, stale-while-revalidate=30" } });
}
