"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  useWalletOptions,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";

export function LoginForm({ className }: React.ComponentProps<"div">) {
  const router = useRouter();
  const { user } = useDynamicContext();

  const { selectWalletOption } = useWalletOptions();

  const connectWithWallet = async (walletKey: string) => {
    return await selectWalletOption(walletKey);
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="flex justify-center">
          <Button
            className="w-full"
            onClick={() => connectWithWallet("metamask")}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
