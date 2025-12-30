"use client";

import { Button } from "@/components/ui/button";
import { useWallets } from '@privy-io/react-auth';
import { useWalletClient } from 'wagmi';
import {
  toMultichainNexusAccount,
  getMEEVersion,
  MEEVersion,
  createNexusClient,
} from "@biconomy/abstractjs";
import { avalanche } from 'viem/chains';
import { http } from 'viem';

export const RegisterSection = () => {
  const { wallets } = useWallets();
  const { data: walletClient } = useWalletClient();
  const wallet = wallets[0]; // プライマリウォレット

  const handleRegister = async () => {
    try {
      if (!wallet || !walletClient) {
        console.log("Wallet or wallet client is not available");
        return;
      }

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
