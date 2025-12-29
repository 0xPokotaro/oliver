"use client";

import { Button } from "@/components/ui/button";
import { isEthereumWallet } from '@dynamic-labs/ethereum'; 
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import {
  toMultichainNexusAccount,
  getMEEVersion,
  MEEVersion,
  createNexusClient,
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

      const smartAccountAddress = await orchestrator.addressOn(avalanche.id, true);

      console.log('smartAccountAddress: ', smartAccountAddress, 'chainId: ', avalanche.id)
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
