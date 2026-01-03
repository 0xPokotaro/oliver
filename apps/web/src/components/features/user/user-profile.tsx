"use client";

import { useEffect } from "react";
import { useAccount } from "@/hooks/use-account";
import { useCreateSmartAccount } from "@/hooks/smart-account/use-create-smart-account";
import { useRegisterSessionKey } from "@/hooks/smart-account/use-session-key-register";
import { useSmartAccountStatus } from "@/hooks/smart-account";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, CheckCircle2, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useSessionKeyStatus } from "@/hooks/smart-account/use-session-key-status";

export function UserProfile() {
  const { data } = useAccount();
  const { createSmartAccount, isLoading } = useCreateSmartAccount();
  const { registerSessionKey, isLoading: isRegisteringSessionKey } =
    useRegisterSessionKey();
  const { isConfigured: isSessionKeyConfigured, isChecking: isCheckingSessionKey } =
    useSmartAccountStatus();

  const { data: sessionKeyStatus } = useSessionKeyStatus();

  const handleCreateSmartAccount = () => {
    createSmartAccount();
  };

  const handleRegisterSessionKey = () => {
    registerSessionKey();
  };

  useEffect(() => {
    console.log("sessionKeyStatus: ", sessionKeyStatus);
  }, [sessionKeyStatus]);

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
                <CardTitle className="flex items-center justify-between">
                  <span>Smart Account Address</span>
                  {data.smartAccountAddress ? (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="size-3 text-green-600" />
                      <span>設定済み</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <AlertCircleIcon className="size-3 text-muted-foreground" />
                      <span>未設定</span>
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-sm font-mono break-all mt-2">
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
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Biconomy Session Key</span>
                  {isCheckingSessionKey ? (
                    <Badge variant="outline" className="gap-1">
                      <Loader2 className="size-3 animate-spin text-muted-foreground" />
                      <span>確認中</span>
                    </Badge>
                  ) : isSessionKeyConfigured ? (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="size-3 text-green-600" />
                      <span>設定済み</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">
                      <AlertCircleIcon className="size-3 text-muted-foreground" />
                      <span>未設定</span>
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-2">
                  {!isSessionKeyConfigured && !isCheckingSessionKey && (
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
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
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
