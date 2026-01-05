"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallets, getAccessToken } from "@privy-io/react-auth";
import {
  toMultichainNexusAccount,
  toSmartSessionsModule,
  createMeeClient,
  meeSessionActions,
} from "@biconomy/abstractjs";
import { parseUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { toast } from "sonner";
import { getSessionSignerPrivateKey } from "@/lib/config";
import { client } from "@/lib/api/client";
import { TransactionType } from "@oliver/shared/enums";
import { NEXUS_ACCOUNT_CONFIG } from "@oliver/shared/configs/smart-account";
import { CONTRACT_ADDRESSES } from "@oliver/shared/configs/blockchain";

const TRIGGER_AMOUNT = "5";
const TOKEN_DECIMALS = 6;
const CHAIN_ID = baseSepolia.id;
const TOKEN_ADDRESS = CONTRACT_ADDRESSES.BASE_SEPOLIA.USDC;

const registerSessionKey = async (
  wallets: ReturnType<typeof useWallets>["wallets"],
) => {
  const wallet = wallets.find((wallet) => wallet.address);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());
  const ssValidator = toSmartSessionsModule({ signer: sessionSigner });

  const orchestrator = await toMultichainNexusAccount({
    signer: await wallet.getEthereumProvider(),
    chainConfigurations: [NEXUS_ACCOUNT_CONFIG.BASE_SEPOLIA],
  });

  const meeClient = await createMeeClient({ account: orchestrator });
  const sessionsMeeClient = meeClient.extend(meeSessionActions);

  const payload = await sessionsMeeClient.prepareForPermissions({
    smartSessionsValidator: ssValidator,
    feeToken: {
      address: TOKEN_ADDRESS,
      chainId: CHAIN_ID,
    },
    trigger: {
      tokenAddress: TOKEN_ADDRESS,
      chainId: CHAIN_ID,
      amount: parseUnits(TRIGGER_AMOUNT, TOKEN_DECIMALS),
    },
  });

  if (payload) {
    const authToken = await getAccessToken();

    await client.api.transactions.$post({
      header: {
        Authorization: `Bearer ${authToken}`,
      },
      json: {
        hash: payload.hash,
        type: TransactionType.SESSION_KEY_ACTIVATE,
        walletAddress: wallet.address,
        aiWalletAddress: orchestrator.addressOn(baseSepolia.id)!,
      },
    });

    const receipt = await meeClient.waitForSupertransactionReceipt({
      hash: payload.hash,
    });
    console.log("response: ", receipt);
  }

  return true;
};

export const useRegisterSessionKey = () => {
  const queryClient = useQueryClient();
  const { wallets } = useWallets();

  const mutation = useMutation<boolean, Error, void>({
    mutationFn: async () => {
      try {
        return await registerSessionKey(wallets);
      } catch (error) {
        console.error("Error registering session key: ", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-list"] });
      toast.success("AI Account has been activated");
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
