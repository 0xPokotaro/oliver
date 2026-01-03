"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallets } from "@privy-io/react-auth";
import {
  toMultichainNexusAccount,
  getMEEVersion,
  toSmartSessionsModule,
  MEEVersion,
  createMeeClient,
  meeSessionActions,
  isModuleInstalled,
} from "@biconomy/abstractjs";
import { http, parseUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { toast } from "sonner";
import { BASE_SEPOLIA_TOKEN_ADDRESSES, getSessionSignerPrivateKey } from "@/lib/config";

const TRIGGER_AMOUNT = "50";
const TOKEN_DECIMALS = 6;
const CHAIN_ID = baseSepolia.id;
const TOKEN_ADDRESS = BASE_SEPOLIA_TOKEN_ADDRESSES.USDC;

const checkSessionKeyStatus = async (wallets: ReturnType<typeof useWallets>["wallets"]) => {
  const wallet = wallets.find((wallet) => wallet.address);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());
  const smartSessionsValidator = toSmartSessionsModule({ signer: sessionSigner });

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

  for (const deployment of orchestrator.deployments) {
    const isDeployed = await deployment.isDeployed()
    console.log("deployment: ", deployment);
    console.log("isDeployed: ", isDeployed);

    if (!deployment) {
      return false;
    }

    // @ts-ignore
    const isSsInstalled = await isModuleInstalled(deployment.client, {
      account: deployment,
      module: {
        address: smartSessionsValidator.address,
        initData: "0x",
        type: smartSessionsValidator.type
      }
    })

    console.log("isSsInstalled: ", isSsInstalled);
  }

  return true;
};

export const useSessionKeyStatus = () => {
  const { wallets } = useWallets();

  return useQuery({
    queryKey: ["session-key-status"],
    queryFn: async () => {
      return await checkSessionKeyStatus(wallets);
    },
  });
};

