"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallets, getAccessToken } from "@privy-io/react-auth";
import {
  toMultichainNexusAccount,
  createMeeClient,
  meeSessionActions,
} from "@biconomy/abstractjs";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { toast } from "sonner";
import { getSessionSignerPrivateKey } from "@/lib/config";
import { client } from "@/lib/api/client";
import { TransactionType } from "@oliver/shared/enums";
import {
  FEE_TOKEN,
  NEXUS_ACCOUNT_CONFIG,
} from "@oliver/shared/configs/smart-account";
import { serializeBigInt } from "@oliver/shared/utils";
import { ALLOWED_ACTION, getInstruction } from "@/lib/config/smart-account";

const grantPermissions = async (
  wallets: ReturnType<typeof useWallets>["wallets"],
) => {
  const wallet = wallets.find((wallet) => wallet.address);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());

  const orchestrator = await toMultichainNexusAccount({
    signer: await wallet.getEthereumProvider(),
    chainConfigurations: [NEXUS_ACCOUNT_CONFIG.BASE_SEPOLIA],
  });

  const meeClient = await createMeeClient({ account: orchestrator });
  const sessionsMeeClient = meeClient.extend(meeSessionActions);

  const sessionDetails = await sessionsMeeClient.grantPermissionTypedDataSign({
    redeemer: sessionSigner.address,
    feeToken: FEE_TOKEN,
    actions: [ALLOWED_ACTION],
  });

  const sessionOrchestrator = await toMultichainNexusAccount({
    chainConfigurations: [
      {
        ...NEXUS_ACCOUNT_CONFIG.BASE_SEPOLIA,
        accountAddress: orchestrator.addressOn(baseSepolia.id)!,
      },
    ],
    signer: sessionSigner,
  });

  const sessionMeeClient = await createMeeClient({
    account: sessionOrchestrator,
  });

  const sessionMeeSessionClient = sessionMeeClient.extend(meeSessionActions);

  const permissionOptions = {
    sessionDetails,
    mode: "ENABLE_AND_USE" as const,
    feeToken: FEE_TOKEN,
    simulation: {
      simulate: true,
    },
    instructions: [getInstruction(sessionSigner.address)],
  };

  const executionPayload =
    await sessionMeeSessionClient.usePermission(permissionOptions);

  const authToken = await getAccessToken();

  await client.api.transactions.$post({
    header: {
      Authorization: `Bearer ${authToken}`,
    },
    json: {
      hash: executionPayload.hash,
      type: TransactionType.SESSION_KEY_GRANT_PERMISSIONS,
      sessionDetails: serializeBigInt(sessionDetails),
    },
  });

  await meeClient.waitForSupertransactionReceipt({
    hash: executionPayload.hash,
  });

  return true;
};

export const useGrantPermissions = () => {
  const queryClient = useQueryClient();
  const { wallets } = useWallets();

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        return await grantPermissions(wallets);
      } catch (error) {
        console.error("Error granting permissions: ", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-list"] });
      toast.success("Permissions granted successfully");
    },
    onError: (error) => {
      toast.error("Failed to grant permissions", {
        description: error.message,
      });
    },
  });

  return {
    grantPermissions: mutation.mutate,
    grantPermissionsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};
