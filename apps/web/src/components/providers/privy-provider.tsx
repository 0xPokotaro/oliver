"use client";

import { PrivyProvider as ReactPrivyProvider } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";
import { getPrivyAppId, getPrivyClientId } from "@/lib/config";

export const PrivyProvider = ({ children }: { children: React.ReactNode }) => {
  const appId = getPrivyAppId();
  const clientId = getPrivyClientId();

  return (
    <ReactPrivyProvider
      appId={appId}
      clientId={clientId}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        // Supported chains
        supportedChains: [baseSepolia],
        // Default chain
        defaultChain: baseSepolia,
        // Appearance settings
        appearance: {
          walletChainType: "ethereum-only",
          theme: "light",
          accentColor: "#676FFF",
        },
      }}
    >
      {children}
    </ReactPrivyProvider>
  );
};
