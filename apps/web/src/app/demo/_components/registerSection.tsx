"use client";

import { Button } from "@/components/ui/button";
import { isEthereumWallet } from '@dynamic-labs/ethereum'; 
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  toMultichainNexusAccount,
  getMEEVersion,
  MEEVersion,
  createMeeClient,
} from "@biconomy/abstractjs";
import { avalanche } from 'viem/chains';
import { http } from 'viem';

export const RegisterSection = () => {
  const { primaryWallet } = useDynamicContext();

  const handleRegister = async () => {
    try {
      if (!primaryWallet) return;

      if (!isEthereumWallet(primaryWallet)) {
        console.log("Not an Ethereum wallet");
        return;
      }

      const walletClient = await primaryWallet.getWalletClient();

      const orchestrator = await toMultichainNexusAccount({
        signer: walletClient,
        chainConfigurations: [

          { 
            chain: avalanche, 
            transport: http(), 
            version: getMEEVersion(MEEVersion.V2_2_1)
          },
        ]
      });

      const avalancheFujiAddress = await orchestrator.addressOn(avalanche.id, true);

      console.log('avalancheFuji address: ', avalancheFujiAddress, 'chainId: ', avalanche.id)

      const meeClient = await createMeeClient({
        account: orchestrator,
        apiKey: 'mee_V3uiyj16zK9q8z7p7SA85s',
      })

      console.log('meeClient: ', meeClient)
    } catch (error) {
      console.error("Error registering smart account:", error);
    }
  };

  return (
    <div>
      <h1>Register Section</h1>
      <Button onClick={handleRegister}>Register</Button>
    </div>
  );
};
