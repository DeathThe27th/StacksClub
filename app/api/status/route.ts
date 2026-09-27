import { NextResponse } from "next/server";
import { integrations, missingIntegrationNames, treasuryAddress, vaultAddress } from "@/lib/config";

export function GET() {
  return NextResponse.json({
    chain: { name: "BNB Smart Chain", id: 56 },
    integrations,
    missing: missingIntegrationNames(),
    contract: {
      deployed: Boolean(vaultAddress),
      treasuryConfigured: Boolean(treasuryAddress && /^0x[\da-fA-F]{40}$/.test(treasuryAddress)),
      mainnetDeployment: "requires explicit user approval after review",
    },
    capabilities: {
      marketData: integrations.binance.configured ? "configured" : "not_configured",
      verifiedCatalogue: integrations.binance.configured && integrations.rpc.configured ? "onchain_checks_enabled" : "not_configured",
      tradeRoutes: "disabled_until_end_to_end_wallet_flow_is_verified",
      positions: vaultAddress ? "read_from_contract" : "contract_not_deployed",
    },
    mode: "truthful-capability-gating",
  });
}
