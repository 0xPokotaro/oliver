"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@privy-io/react-auth";
import {
  toMultichainNexusAccount,
  createMeeClient,
  meeSessionActions,
} from "@biconomy/abstractjs";
import { privateKeyToAccount } from "viem/accounts";
import { toast } from "sonner";
import { getSessionSignerPrivateKey } from "@/lib/config";
import { client } from "@/lib/api/client";
import { TransactionType } from "@oliver/shared/enums";
import { restoreBigInt } from "@oliver/shared/utils";
import {
  FEE_TOKEN,
  NEXUS_ACCOUNT_CONFIG,
} from "@oliver/shared/configs/smart-account";
import { getInstruction } from "@/lib/config/smart-account";

const executeSessionKeyTest = async (smartAccountAddress: `0x${string}`) => {
  const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());

  console.log("smartAccountAddress: ", smartAccountAddress);
  console.log("sessionSigner.address: ", sessionSigner.address);

  const sessionOrchestrator = await toMultichainNexusAccount({
    chainConfigurations: [
      {
        ...NEXUS_ACCOUNT_CONFIG.BASE_SEPOLIA,
        // TODO: ここにスマートアカウントをセット
        accountAddress:
          "0x9088453ab0a94Ba35306bB9Fb7e4Cff0E738EA34" as `0x${string}`,
      },
    ],
    signer: sessionSigner,
  });

  const sessionMeeClient = await createMeeClient({
    account: sessionOrchestrator,
  });

  const sessionMeeSessionClient = sessionMeeClient.extend(meeSessionActions);

  // sessionDetailsをDBから取得
  const authToken = await getAccessToken();
  if (!authToken) {
    throw new Error("No authentication token available");
  }

  const sessionDetailsResponse = await client.api.transactions[
    "session-details"
  ].$get({
    header: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!sessionDetailsResponse.ok) {
    throw new Error("Failed to fetch session details");
  }

  const sessionDetailsData = await sessionDetailsResponse.json();
  if (!sessionDetailsData || !sessionDetailsData.sessionDetails) {
    throw new Error("Session details not found");
  }

  // sessionDetailsを復元（BigIntフィールドを復元）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionDetails = restoreBigInt(
    sessionDetailsData.sessionDetails,
  ) as any;

  const permissionOptions = {
    sessionDetails,
    mode: "USE" as const,
    feeToken: FEE_TOKEN,
    simulation: {
      simulate: true,
    },
    instructions: [getInstruction(sessionSigner.address)],
  };

  const executionPayload =
    await sessionMeeSessionClient.usePermission(permissionOptions);

  await client.api.transactions.$post({
    header: {
      Authorization: `Bearer ${authToken}`,
    },
    json: {
      hash: executionPayload.hash,
      type: TransactionType.SESSION_KEY_GRANT_PERMISSIONS,
    },
  });

  await sessionMeeClient.waitForSupertransactionReceipt({
    hash: executionPayload.hash,
  });

  return true;
};

export const useExecuteSessionKeyTest = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        // smartAccountAddressを取得（sessionSignerのアドレス）
        const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());
        const smartAccountAddress = sessionSigner.address as `0x${string}`;

        return await executeSessionKeyTest(smartAccountAddress);
      } catch (error) {
        console.error("Error executing session key test: ", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-list"] });
      toast.success("Session key test executed successfully");
    },
    onError: (error) => {
      toast.error("Failed to execute session key test", {
        description: error.message,
      });
    },
  });

  return {
    executeSessionKeyTest: mutation.mutate,
    executeSessionKeyTestAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};
