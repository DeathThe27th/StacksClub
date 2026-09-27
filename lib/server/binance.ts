import "server-only";

import { createHmac, randomUUID } from "node:crypto";

const BINANCE_BASE_URL = "https://web3.binance.com/build";
const REQUEST_TIMEOUT_MS = 7_000;
const RECEIVE_WINDOW_MS = "5000";

type BinanceEnvelope<T> = { code: number; msg?: string; data: T };

export class BinanceApiError extends Error {
  constructor(
    readonly kind: "not_configured" | "auth_rejected" | "rate_limited" | "provider_error" | "network_error" | "invalid_response",
    readonly httpStatus?: number,
    readonly providerCode?: number,
  ) {
    super(kind);
    this.name = "BinanceApiError";
  }
}

export function describeBinanceError(error: unknown) {
  if (!(error instanceof BinanceApiError)) return { code: "provider_network_error", status: 502 };
  if (error.kind === "not_configured") return { code: "integration_not_configured", status: 503 };
  if (error.kind === "auth_rejected") return { code: "provider_auth_rejected", status: 502 };
  if (error.kind === "rate_limited") return { code: "provider_rate_limited", status: 503 };
  if (error.kind === "network_error") return { code: "provider_network_error", status: 502 };
  if (error.kind === "invalid_response") return { code: "provider_invalid_response", status: 502 };
  return { code: "provider_error", status: 502 };
}

export type BinanceRwaToken = {
  binanceChainId: string;
  tokenContractAddress: string;
  platformId: "ondo" | "bstock";
  assetType: number;
  tokenName: string;
  tokenSymbol: string;
  tokenLogoUrl?: string | null;
  decimals: string;
  underlyingTicker: string;
  underlyingName: string;
  tokenToShareRatio?: string;
  statusInfo?: { openState?: boolean; marketStatus?: string };
};

function apiKey() { return process.env.BINANCE_WEB3_API_KEY; }
function apiSecret() { return process.env.BINANCE_WEB3_API_SECRET ?? process.env.BINANCE_WEB3_SECRET_KEY; }
export function isBinanceConfigured() { return Boolean(apiKey() && apiSecret()); }

function encodeQuery(params: Record<string, string>) {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

function signature(timestamp: string, method: string, signedPath: string, body: string, secret: string) {
  return createHmac("sha256", secret).update(timestamp + method + signedPath + body, "utf8").digest("base64");
}

async function get<T>(path: string, params: Record<string, string>) {
  const key = apiKey();
  const secret = apiSecret();
  if (!key || !secret) throw new BinanceApiError("not_configured");

  const query = encodeQuery(params);
  const pathWithQuery = query ? `${path}?${query}` : path;
  const signedPath = `/build${pathWithQuery}`;
  const timestamp = new Date().toISOString();
  const nonce = randomUUID();
  let response: Response;
  try {
    response = await fetch(`${BINANCE_BASE_URL}${pathWithQuery}`, {
      method: "GET",
      headers: {
        "X-OC-APIKEY": key,
        "X-OC-TIMESTAMP": timestamp,
        "X-OC-SIGN": signature(timestamp, "GET", signedPath, "", secret),
        "X-OC-RECV-WINDOW": RECEIVE_WINDOW_MS,
        "X-OC-NONCE": nonce,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    throw new BinanceApiError("network_error");
  }

  let body: unknown;
  try { body = await response.json(); }
  catch { throw new BinanceApiError("invalid_response", response.status); }

  if (!response.ok) {
    const providerCode = isRecord(body) && typeof body.code === "number" ? body.code : undefined;
    const kind = response.status === 401 || response.status === 403
      ? "auth_rejected"
      : response.status === 429
        ? "rate_limited"
        : "provider_error";
    throw new BinanceApiError(kind, response.status, providerCode);
  }
  if (!isRecord(body) || typeof body.code !== "number" || body.code !== 0 || !("data" in body)) {
    throw new BinanceApiError("provider_error", response.status, isRecord(body) && typeof body.code === "number" ? body.code : undefined);
  }
  return (body as BinanceEnvelope<T>).data;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function fetchRwaTokens() {
  const result = await get<unknown>("/api/v1/dex/market/rwa/tokens", { binanceChainId: "56" });
  if (!Array.isArray(result)) throw new BinanceApiError("invalid_response");
  return result.filter(isRwaToken);
}

function isRwaToken(value: unknown): value is BinanceRwaToken {
  if (!isRecord(value)) return false;
  return value.binanceChainId === "56"
    && typeof value.tokenContractAddress === "string"
    && /^0x[a-fA-F0-9]{40}$/.test(value.tokenContractAddress)
    && (value.platformId === "ondo" || value.platformId === "bstock")
    && typeof value.tokenName === "string"
    && typeof value.tokenSymbol === "string"
    && typeof value.underlyingTicker === "string"
    && typeof value.decimals === "string";
}

export async function fetchRwaPrice(tokenAddress: string) {
  return get<unknown>("/api/v1/dex/market/rwa/price", {
    binanceChainId: "56",
    tokenContractAddress: tokenAddress,
  });
}
