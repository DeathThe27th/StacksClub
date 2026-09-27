import "server-only";

import { createHmac } from "node:crypto";

const BINANCE_BASE_URL = "https://api.binance.com";
const REQUEST_TIMEOUT_MS = 5_000;

export class BinanceApiError extends Error {
  constructor(
    readonly kind: "auth_rejected" | "rate_limited" | "provider_error" | "network_error" | "invalid_response",
    readonly httpStatus?: number,
    readonly providerCode?: number,
  ) {
    super(kind);
    this.name = "BinanceApiError";
  }
}

export function describeBinanceError(error: unknown) {
  if (!(error instanceof BinanceApiError)) return { code: "provider_network_error", status: 502 };
  if (error.kind === "auth_rejected") return { code: "provider_auth_rejected", status: 502 };
  if (error.kind === "rate_limited") return { code: "provider_rate_limited", status: 503 };
  if (error.kind === "network_error") return { code: "provider_network_error", status: 502 };
  if (error.kind === "invalid_response") return { code: "provider_invalid_response", status: 502 };
  return { code: "provider_error", status: 502 };
}

export type BinanceTokenizedAsset = {
  assetCode: string;
  assetName: string;
  underlyingEquitySymbol: string;
  multiplier: string;
  multiplierValid: boolean;
};

export type BinanceQuote = {
  symbol: string;
  bidPrice: string;
  askPrice: string;
  bidSize: number;
  askSize: number;
};

function apiKey() {
  return process.env.BINANCE_WEB3_API_KEY;
}

export function isBinanceConfigured() {
  return Boolean(apiKey());
}

async function get<T>(path: string, params?: Record<string, string>) {
  const url = new URL(path, BINANCE_BASE_URL);
  Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "X-MBX-APIKEY": apiKey() ?? "" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: 15 },
    });
  } catch {
    throw new BinanceApiError("network_error");
  }
  if (!response.ok) {
    let providerCode: number | undefined;
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "code" in body && typeof body.code === "number") providerCode = body.code;
    } catch { /* Provider returned no JSON error body. */ }
    const kind = response.status === 401 || response.status === 403
      ? "auth_rejected"
      : response.status === 429
        ? "rate_limited"
        : "provider_error";
    throw new BinanceApiError(kind, response.status, providerCode);
  }
  try {
    return await response.json() as T;
  } catch {
    throw new BinanceApiError("invalid_response", response.status);
  }
}

export async function fetchTokenizedAssets() {
  return get<BinanceTokenizedAsset[]>("/sapi/v1/equity/market/tokenized-assets");
}

export async function fetchQuote(symbol: string) {
  return get<BinanceQuote>("/sapi/v1/equity/market/quote", { symbol: symbol.toUpperCase() });
}

/**
 * Binance signed requests use HMAC-SHA-256 over the URL-encoded payload.
 * This helper is intentionally not called by market-data routes, which only
 * require X-MBX-APIKEY. Trade routes should add timestamp/recvWindow and
 * validate the provider schema before calling it.
 */
export function signBinancePayload(payload: string, secret = process.env.BINANCE_WEB3_API_SECRET) {
  if (!secret) throw new Error("Binance API secret is not configured");
  return createHmac("sha256", secret).update(payload).digest("hex");
}
