"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";
import { avalanche } from "viem/chains";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

const dynamicEnvironmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ?? "";

if (!dynamicEnvironmentId) {
  throw new Error("NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is not set");
}

const evmNetworks = [
  {
    blockExplorerUrls: [avalanche.blockExplorers.default.url],
    chainId: avalanche.id,
    chainName: avalanche.name,
    iconUrls: ["https://app.dynamic.xyz/assets/networks/avax.svg"],
    name: avalanche.name,
    nativeCurrency: {
      decimals: 18,
      name: "AVAX",
      symbol: "AVAX",
      iconUrl: "https://app.dynamic.xyz/assets/networks/avax.svg",
    },
    networkId: avalanche.id,
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    vanityName: avalanche.name,
  },
];

const config = createConfig({
  chains: [avalanche],
  multiInjectedProviderDiscovery: false,
  transports: {
    [avalanche.id]: http(),
  },
});

export const DynamicProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <DynamicContextProvider
      settings={{
        // Find your environment id at https://app.dynamic.xyz/dashboard/developer
        environmentId: dynamicEnvironmentId,
        initialAuthenticationMode: "connect-and-sign",
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks,
        },
      }}
    >
      <WagmiProvider config={config}>
        <DynamicWagmiConnector>{children}</DynamicWagmiConnector>
      </WagmiProvider>
    </DynamicContextProvider>
  );
};
