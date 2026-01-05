"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sendETH, sendUSDC } from "@/lib/faucet/send";

function FaucetPage() {
  const { user, authenticated } = usePrivy();
  const walletAddress = user?.wallet?.address as `0x${string}` | undefined;

  const sendETHMutation = useMutation({
    mutationFn: async () => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      return await sendETH(walletAddress);
    },
    onSuccess: (hash) => {
      toast.success("ETH sent successfully", {
        description: `Transaction hash: ${hash}`,
      });
    },
    onError: (error) => {
      toast.error("Failed to send ETH", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const sendUSDCMutation = useMutation({
    mutationFn: async () => {
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }
      return await sendUSDC(walletAddress);
    },
    onSuccess: (hash) => {
      toast.success("USDC sent successfully", {
        description: `Transaction hash: ${hash}`,
      });
    },
    onError: (error) => {
      toast.error("Failed to send USDC", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const isDisabled = !authenticated || !walletAddress;

  return (
    <div className="space-y-4">
      <h1 className="mb-4 text-2xl font-bold">Faucet</h1>

      {!authenticated && (
        <div className="text-sm text-muted-foreground">
          Please connect your wallet to request tokens.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ETH Section */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Request ETH</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Get test ETH on Base Sepolia
              </Label>
              <div className="text-sm font-medium">Amount: 0.05 ETH</div>
            </div>
            <Button
              disabled={isDisabled || sendETHMutation.isPending}
              onClick={() => sendETHMutation.mutate()}
            >
              {sendETHMutation.isPending ? "Sending..." : "Request ETH"}
            </Button>
          </CardContent>
        </Card>

        {/* USDC Section */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Request USDC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Get test USDC on Base Sepolia
              </Label>
              <div className="text-sm font-medium">Amount: 10 USDC</div>
            </div>
            <Button
              disabled={isDisabled || sendUSDCMutation.isPending}
              onClick={() => sendUSDCMutation.mutate()}
            >
              {sendUSDCMutation.isPending ? "Sending..." : "Request USDC"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FaucetPage;
