'use client'

import {PrivyProvider as ReactPrivyProvider} from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { createConfig, http } from 'wagmi';
import { avalanche } from 'viem/chains';

const wagmiConfig = createConfig({
  chains: [avalanche],
  transports: {
    [avalanche.id]: http(),
  },
});

export const PrivyProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactPrivyProvider
      appId="cmjs6bu1o00nnl10deie6wnie"
      clientId="client-WY6UH1jTQC1e8QEkoKnm9EQR7dMsWGHuEbnHDrDJBs9yB"
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        },
        // Supported chains
        supportedChains: [avalanche],
        // Default chain
        defaultChain: avalanche,
        // Appearance settings
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        {children}
      </WagmiProvider>
    </ReactPrivyProvider>
  )
}
