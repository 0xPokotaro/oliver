"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatWalletAddress } from "@/lib/format";

export const AuthSection = () => {
  const { user, logout, authenticated, ready } = usePrivy();

  useEffect(() => {
    console.log("user: ", user);
  }, [user]);

  useEffect(() => {
    if (authenticated && user) {
      console.log("User authenticated:", user);
      const walletAddress =
        user.wallet?.address ||
        user.linkedAccounts?.find((acc) => acc.type === "wallet")?.address;
      if (walletAddress) {
        toast.success("Login successful", {
          description: `Wallet address: ${formatWalletAddress(walletAddress)}`,
        });
      }
    }
  }, [authenticated, user]);

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Auth Section</h1>
      {authenticated && user ? (
        <div className="space-y-4">
          <p>Authenticated as: {user.id}</p>
          {user.wallet?.address && (
            <p>Wallet: {formatWalletAddress(user.wallet.address)}</p>
          )}
          <Button onClick={logout}>Logout</Button>
        </div>
      ) : (
        <p>Please sign in to continue</p>
      )}
    </div>
  );
};
