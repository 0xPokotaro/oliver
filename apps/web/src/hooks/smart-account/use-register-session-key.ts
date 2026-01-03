"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallets } from "@privy-io/react-auth";
// Biconomy
import {
  toMultichainNexusAccount,
  getMEEVersion,
  toSmartSessionsModule,
  MEEVersion,
  createMeeClient,
  meeSessionActions,
} from "@biconomy/abstractjs";
import { http, parseUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { toast } from "sonner";
import { BASE_SEPOLIA_TOKEN_ADDRESSES } from "@/lib/config";
import { getSessionSignerPrivateKey } from "@/lib/config";

interface RegisterBiconomySessionKeyResponse {
  success: boolean;
  sessionKeyAddress: string;
  message?: string;
}

export const useRegisterSessionKey = () => {
  const queryClient = useQueryClient();
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

        const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());

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
            address: BASE_SEPOLIA_TOKEN_ADDRESSES.USDC,
            chainId: baseSepolia.id
          },
          trigger: {
            tokenAddress: BASE_SEPOLIA_TOKEN_ADDRESSES.USDC,
            chainId: baseSepolia.id,
            amount: parseUnits('50', 6)
          }
        })

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
