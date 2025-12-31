'use client';

import { useState } from 'react';
import { useUserProfile } from "@/hooks/use-user-profile";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSign7702Authorization, useWallets, usePrivy } from '@privy-io/react-auth'
import { avalanche } from 'viem/chains'
import { http, parseUnits } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { client } from '@/lib/hono'
import { toSmartSessionsModule, toMultichainNexusAccount, getMEEVersion, MEEVersion, createMeeClient, meeSessionActions } from '@biconomy/abstractjs'
import { TOKEN_ADDRESSES } from '@/lib/config/constants'

const NEXUS_IMPLEMENTATION_V1_3_1 = '0x0000000020fe2F30453074aD916eDeB653eC7E9D' as `0x${string}`
const SESSION_SIGNER_PRIVATE_KEY = '0xa7766be26f1e65b4f2988ae51d96f4164b1661b063ff7b7550532edc10b023d7' as `0x${string}`

const Container = () => {
  const { wallets } = useWallets()
  const { data, isLoading, error } = useUserProfile()

  const { getAccessToken } = usePrivy();

  const { signAuthorization } = useSign7702Authorization();
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateSmartAccount = async () => {
    setIsCreating(true)
 
    try {
      console.log("createSmartAccount")
      
      const authorization = await signAuthorization({
        contractAddress: NEXUS_IMPLEMENTATION_V1_3_1,
        chainId: avalanche.id,
      }, {
          address: wallets[0].address // Optional: Specify the wallet to use for signing. If not provided, the first wallet will be used.
      });

      console.log("authorization: ", authorization);

      const wallet = wallets.find(wallet => wallet.walletClientType === 'privy');
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const sessionSigner = privateKeyToAccount(SESSION_SIGNER_PRIVATE_KEY)

      const ssValidator = toSmartSessionsModule({
        signer: sessionSigner
      })

      const orchestrator = await toMultichainNexusAccount({
        chainConfigurations: [
          {
            chain: avalanche,
            transport: http(),
            version: getMEEVersion(MEEVersion.V2_2_1),
          },
        ],
        signer: await wallet.getEthereumProvider()
      })

      const meeClient = await createMeeClient({ account: orchestrator })
      const sessionsMeeClient = meeClient.extend(meeSessionActions)

      const payload = await sessionsMeeClient.prepareForPermissions({
        smartSessionsValidator: ssValidator,
        feeToken: {
          address: TOKEN_ADDRESSES.USDC,
          chainId: avalanche.id
        },
        trigger: {
          tokenAddress: TOKEN_ADDRESSES.MOCK_ERC20,
          chainId: avalanche.id,
          amount: parseUnits('500', 18)
        }
      })

      console.log("payload: ", payload)

      if (payload) {
        // const receipt = await meeClient.waitForSupertransactionReceipt({ hash: payload.hash })
        // console.log("receipt: ", receipt)
      }
    } catch (error) {
      console.error("Error creating smart account:", error)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-destructive">Error: {error.message}</div>
  if (!data) return null

  return (
    <div className="p-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
            <div className="border-b border-border pb-4">
              <dt className="text-sm font-medium text-muted-foreground mb-1">ID</dt>
              <dd className="text-base font-mono break-all">{data.id}</dd>
            </div>
            <div className="border-b border-border pb-4">
              <dt className="text-sm font-medium text-muted-foreground mb-1">Privy User ID</dt>
              <dd className="text-base font-mono break-all">{data.privyUserId}</dd>
            </div>
            <div className="border-b border-border pb-4">
              <dt className="text-sm font-medium text-muted-foreground mb-1">Wallet Address</dt>
              <dd className="text-base font-mono break-all">{data.walletAddress}</dd>
            </div>
            <div className="border-b border-border pb-4">
              <dt className="text-sm font-medium text-muted-foreground mb-1">Created At</dt>
              <dd className="text-base">{new Date(data.createdAt).toLocaleString()}</dd>
            </div>
            <div className="pb-2">
              <dt className="text-sm font-medium text-muted-foreground mb-1">Updated At</dt>
              <dd className="text-base">{new Date(data.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Agent Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-4">
          <div className="border-b border-border pb-4">
              <dt className="text-sm font-medium text-muted-foreground mb-1">Smart Account Address</dt>
              <dd className="text-base font-mono break-all">
                {data.smartAccountAddress || (
                  <Button onClick={handleCreateSmartAccount} disabled={isCreating}>
                    {isCreating ? "作成中..." : "設定"}
                  </Button>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

export default Container;
