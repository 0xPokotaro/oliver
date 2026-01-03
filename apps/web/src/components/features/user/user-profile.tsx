"use client";

import { useAccount } from "@/hooks/use-account";
import { useCreateSmartAccount } from "@/hooks/smart-account/use-create-smart-account";
import { useRegisterSessionKey } from "@/hooks/smart-account/use-register-session-key";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function UserProfile() {
  const { data } = useAccount();
  const { createSmartAccount, isLoading } = useCreateSmartAccount();
  const { registerSessionKey, isLoading: isRegisteringSessionKey } =
    useRegisterSessionKey();

  const handleCreateSmartAccount = () => {
    createSmartAccount();
  };

  const handleRegisterSessionKey = () => {
    registerSessionKey();
  };

  return (
    <div>
      {data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Privy User ID</CardTitle>
                <CardDescription className="text-sm font-medium break-all">
                  {data.privyUserId}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Wallet Address</CardTitle>
                <CardDescription className="text-sm font-mono break-all">
                  {data.address}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Smart Account Address</CardTitle>
                <CardDescription className="text-sm font-mono break-all">
                  {data.smartAccountAddress ? (
                    data.smartAccountAddress
                  ) : (
                    <Button
                      onClick={handleCreateSmartAccount}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                    >
                      {isLoading ? "作成中..." : "作成"}
                    </Button>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          {data.smartAccountAddress && (
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Biconomy Session Key</CardTitle>
                <CardDescription>
                  <Button
                    onClick={handleRegisterSessionKey}
                    disabled={isRegisteringSessionKey}
                    size="sm"
                    variant="outline"
                  >
                    {isRegisteringSessionKey && <Spinner />}
                    {isRegisteringSessionKey
                      ? "登録中..."
                      : "Session Keyを登録"}
                  </Button>
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      ) : (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Please sign in to continue.</AlertTitle>
        </Alert>
      )}
    </div>
  );
}
