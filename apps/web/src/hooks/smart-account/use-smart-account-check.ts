import { useQuery } from "@tanstack/react-query";
import { useWallets } from "@privy-io/react-auth";
import {
  toMultichainNexusAccount,
  isModuleInstalled,
  toSmartSessionsModule,
} from "@biconomy/abstractjs";
import { NEXUS_ACCOUNT_CONFIG } from "@oliver/shared/configs/smart-account";
import { getSessionSignerPrivateKey } from "@/lib/config";
import { privateKeyToAccount } from "viem/accounts";

export const checkSmartAccount = async (
  wallets: ReturnType<typeof useWallets>["wallets"],
) => {
  try {
    const wallet = wallets.find((wallet) => wallet.address);

    if (!wallet) {
      return false;
    }

    const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());
    const ssValidator = toSmartSessionsModule({ signer: sessionSigner });

    const orchestrator = await toMultichainNexusAccount({
      signer: await wallet.getEthereumProvider(),
      chainConfigurations: [
        {
          ...NEXUS_ACCOUNT_CONFIG.BASE_SEPOLIA,
        },
      ],
    });

    for (const deployment of orchestrator.deployments) {
      const isDeployed = await deployment.isDeployed();

      // @ts-ignore
      const isSsInstalled = await isModuleInstalled(deployment.client, {
        account: deployment,
        module: {
          address: ssValidator.address,
          initData: "0x",
          type: ssValidator.type,
        },
      });

      if (!isDeployed || !isSsInstalled) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error checking smart account:", error);
    return false;
  }
};

export const useSmartAccountCheck = () => {
  const { wallets } = useWallets();

  return useQuery({
    queryKey: ["smart-account-check"],
    queryFn: async () => {
      return await checkSmartAccount(wallets);
    },
    enabled: false,
  });
};
