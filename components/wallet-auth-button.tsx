"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Icon } from "@/components/icons";

export function WalletAuthButton({ className = "connect-button" }: { className?: string }) {
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
    return <button className={className} disabled title="Privy sign-in is not configured"><Icon name="wallet" size={16} />Wallet unavailable</button>;
  }
  return <EnabledWalletAuthButton className={className} />;
}

function EnabledWalletAuthButton({ className }: { className: string }) {
  const { ready, authenticated, login, logout, connectOrCreateWallet } = usePrivy();
  const { wallets } = useWallets();
  if (!ready) return <button className={className} disabled><Icon name="wallet" size={16} />Loading wallet</button>;
  if (authenticated) {
    const wallet = wallets[0]?.address;
    return <button className={className} onClick={() => { if (wallet) void logout(); else connectOrCreateWallet(); }}>
      <Icon name="wallet" size={16} />{wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : "Connect wallet"}
    </button>;
  }
  return <button className={className} onClick={() => login()}><Icon name="wallet" size={16} />Sign in</button>;
}
