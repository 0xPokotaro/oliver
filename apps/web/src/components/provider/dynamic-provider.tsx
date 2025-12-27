"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { http } from "viem";
import { avalancheFuji } from "viem/chains";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";

const evmNetworks = [
  {
    blockExplorerUrls: [avalancheFuji.blockExplorers.default.url],
    chainId: avalancheFuji.id,
    chainName: avalancheFuji.name,
    iconUrls: ["https://app.dynamic.xyz/assets/networks/avax.svg"],
    name: avalancheFuji.name,
    nativeCurrency: {
      decimals: 18,
      name: "AVAX",
      symbol: "AVAX",
      iconUrl: "https://app.dynamic.xyz/assets/networks/avax.svg",
    },
    networkId: avalancheFuji.id,
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    vanityName: avalancheFuji.name,
  },
];

const config = createConfig({
  chains: [avalancheFuji],
  multiInjectedProviderDiscovery: false,
  transports: {
    [avalancheFuji.id]: http(),
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
        environmentId: "b4a79b14-9a41-4dbe-8425-174c937951eb",
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
