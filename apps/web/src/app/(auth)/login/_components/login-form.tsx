"use client";

import { Button } from "@/components/ui/button";
import {
  getAuthToken,
  useDynamicContext,
  useWalletOptions,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { login } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({ className }: React.ComponentProps<"div">) {
  const router = useRouter();
  const { user, handleLogOut } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const [error, setError] = useState<string | null>(null);

  const { selectWalletOption } = useWalletOptions();

  const handleLogin = async () => {
    try {
      setError(null);

      // Dynamicでログインしていない場合は、まずウォレットを接続
      if (!isLoggedIn) {
        await selectWalletOption("metamask");
        // ウォレット接続後、バックエンドAPIにログインを試行
        const authToken = getAuthToken();
        if (authToken) {
          await login(authToken);
          router.push("/");
        }
        return;
      }

      // Dynamicでログイン済みの場合、バックエンドAPIにログイン
      const authToken = getAuthToken();

      if (!authToken) {
        throw new Error("Failed to get authentication token from Dynamic");
      }

      // Call login API
      await login(authToken);

      // Redirect to home page after successful login
      router.push("/");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Login failed";

      // JWTトークンエラーの場合は強制ログアウト
      if (errorMessage.includes("Invalid or expired JWT token")) {
        await handleLogOut();
        return;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Connect your wallet to login to your account
          </p>
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        <div className="flex justify-center">
          <Button className="w-full" onClick={handleLogin}>
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
