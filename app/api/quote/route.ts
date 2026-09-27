import { NextRequest, NextResponse } from "next/server";
import { BinanceApiError, describeBinanceError, fetchQuote, isBinanceConfigured } from "@/lib/server/binance";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.trim();
  if (!symbol || !/^[A-Za-z.]{1,12}$/.test(symbol)) return NextResponse.json({ error: "A valid equity symbol is required." }, { status: 400 });
  if (!isBinanceConfigured()) return NextResponse.json({ status: "integration_not_configured", error: "Market data is not configured." }, { status: 503 });
  try {
    const quote = await fetchQuote(symbol);
    return NextResponse.json({ status: "indicative", source: "Binance Stocks Trading REST API", quote, fetchedAt: new Date().toISOString() });
  } catch (cause) {
    const diagnostic = describeBinanceError(cause);
    console.warn("Binance quote request failed", { symbol: symbol.toUpperCase(), code: diagnostic.code, ...(cause instanceof BinanceApiError ? { upstreamStatus: cause.httpStatus, providerCode: cause.providerCode } : {}) });
    return NextResponse.json({ status: diagnostic.code, error: "No live quote is available right now. Retry shortly." }, { status: diagnostic.status });
  }
}
