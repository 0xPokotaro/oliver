'use client';

import { useState } from 'react';
import { useUserProfile } from "@/hooks/use-user-profile";
import { Button } from "@/components/ui/button";
import { useSign7702Authorization, useWallets } from '@privy-io/react-auth'
import { avalanche } from 'viem/chains'

const NEXUS_IMPLEMENTATION_V1_3_1 = '0x0000000020fe2F30453074aD916eDeB653eC7E9D' as `0x${string}`

const Container = () => {
  const { wallets } = useWallets()
  const { data, isLoading, error } = useUserProfile()

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

      console.log("authorization: ", authorization)
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
    <div className="p-8">
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
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
            <dt className="text-sm font-medium text-muted-foreground mb-1">Smart Account Address</dt>
            <dd className="text-base font-mono break-all">
              {data.smartAccountAddress || (
                <Button onClick={handleCreateSmartAccount} disabled={isCreating}>
                  {isCreating ? "作成中..." : "設定"}
                </Button>
              )}
            </dd>
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
      </div>
    </div>
  );
};

export default Container;
