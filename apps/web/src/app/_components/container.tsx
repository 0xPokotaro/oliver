'use client';

import { useUserProfile } from "@/hooks/use-user-profile";
import { useCreateSmartAccount } from "@/hooks/use-create-smart-account";
import { Button } from "@/components/ui/button";

const Container = () => {
  const { data, isLoading, error } = useUserProfile()
  const { createSmartAccount, isLoading: isCreating } = useCreateSmartAccount()

  const handleCreateSmartAccount = () => {
    createSmartAccount()
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
            <dt className="text-sm font-medium text-muted-foreground mb-1">Dynamic User ID</dt>
            <dd className="text-base font-mono break-all">{data.dynamicUserId}</dd>
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
