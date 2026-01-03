"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { client } from "@/lib/api/client";
import { createMultichainOrchestrator } from "@/lib/smart-account/orchestrator";
// Biconomy
import {
  toMultichainNexusAccount,
  getMEEVersion,
  toSmartSessionsModule,
  MEEVersion,
  createMeeClient,
  meeSessionActions,
} from "@biconomy/abstractjs";
import { http, parseUnits, zeroAddress } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { toast } from "sonner";

const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVY_PRIVATE_KEY as `0x${string}`;
const BASE_SEPOLIA_USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
const BASE_SEPOLIA_JPYC_ADDRESS = '0x47f47FfabA94759Ef08824B74beeE4dF34DF2415';

interface RegisterBiconomySessionKeyResponse {
  success: boolean;
  sessionKeyAddress: string;
  message?: string;
}

export const useRegisterSessionKey = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();
  const { wallets } = useWallets();

  const mutation = useMutation<any, Error, void>({
    mutationFn: async () => {
      try {
        console.log("[START] registerSessionKey");

        const wallet = wallets.find((wallet) => wallet.address);
        console.log("desiredWallet: ", wallet);

        if (!wallet) {
          throw new Error("Wallet not found");
        }

        const sessionSigner = privateKeyToAccount(PRIVATE_KEY);

        const ssValidator = toSmartSessionsModule({ signer: sessionSigner });

        const orchestrator = await toMultichainNexusAccount({
          signer: await wallet.getEthereumProvider(),
          chainConfigurations: [
            {
              chain: baseSepolia,
              transport: http(),
              version: getMEEVersion(MEEVersion.V2_2_1),
            },
          ],
        });

        const meeClient = await createMeeClient({ account: orchestrator });
        const sessionsMeeClient = meeClient.extend(meeSessionActions);

        const payload = await sessionsMeeClient.prepareForPermissions({
          smartSessionsValidator: ssValidator,
          feeToken: {
            address: BASE_SEPOLIA_USDC_ADDRESS,
            chainId: baseSepolia.id
          },
          trigger: {
            tokenAddress: BASE_SEPOLIA_USDC_ADDRESS,
            chainId: baseSepolia.id,
            amount: parseUnits('50', 6)
          }
        })
        console.log("payload: ", payload);

        if (payload) {
          console.log("payload.hash: ", payload);
          const receipt = await meeClient.waitForSupertransactionReceipt({ hash: payload.hash })
          console.log("receipt: ", receipt);
        }

        return true;
      } catch (error) {
        console.error("Error registering session key: ", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Session Key registration completed");
    },
    onError: (error) => {
      toast.error("Session Key registration failed", {
        description: error.message,
      });
    },
  });

  return {
    registerSessionKey: mutation.mutate,
    registerSessionKeyAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};
