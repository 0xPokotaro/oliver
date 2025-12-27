"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLogin } from "@/hooks/use-login";

export function LoginForm({ className }: React.ComponentProps<"div">) {
  const { handleLogin, isLoading, error } = useLogin();

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
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </div>
    </div>
  );
}
