"use client";

import { useEffect } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/use-login";
import { toast } from "sonner";
import { formatWalletAddress } from "@/lib/format";

const walletKey = "metamask";

const AuthSection = () => {
  const { user, handleLogOut } = useDynamicContext();
  const { login, isLoading, error, data } = useLogin();

  useEffect(() => {
    console.log("user: ", user);
  }, [user]);

  useEffect(() => {
    if (data) {
      console.log("Login response:", data);
      toast.success("Login successful", {
        description: `Wallet address: ${formatWalletAddress(data.walletAddress)}`,
      });
    }
  }, [data]);

  return (
    <div>
      <h1>Auth Section</h1>
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
      <div className="flex gap-2">
        <Button onClick={() => login({ walletKey })} disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
        <Button onClick={() => handleLogOut()}>Logout</Button>
      </div>
    </div>
  );
};

export default AuthSection;
