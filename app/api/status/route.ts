import { NextResponse } from "next/server";
import { integrations, missingIntegrationNames } from "@/lib/config";

export function GET() {
  return NextResponse.json({
    chain: { name: "BNB Smart Chain", id: 56 },
    integrations,
    missing: missingIntegrationNames(),
    capabilities: {
      marketData: integrations.binance.configured ? "configured" : "not_configured",
      tradeRoutes: "not_implemented",
    },
    mode: "integration-aware-preview",
  });
}
