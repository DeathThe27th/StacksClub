"use client";

import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { bsc } from "viem/chains";

export function AppProviders({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) return children;
  return <PrivyProvider
    appId={appId}
    config={{
      loginMethods: ["email", "wallet"],
      defaultChain: bsc,
      supportedChains: [bsc],
      appearance: { theme: "dark", accentColor: "#d9ff76" },
      embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
    }}
  >{children}</PrivyProvider>;
}
