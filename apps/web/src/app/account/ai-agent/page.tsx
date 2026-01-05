"use client";

import { useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useRegisterSessionKey } from "@/hooks/smart-account/use-session-key-register";
import { useGrantPermissions } from "@/hooks/smart-account/use-permission-grant";
import { useExecuteSessionKeyTest } from "@/hooks/smart-account/use-session-key-test-execute";
import { useSmartAccountCheck } from "@/hooks/smart-account/use-smart-account-check";

const AccountAIAgentPage = () => {
  const { wallets } = useWallets();
  const { data: isSmartAccountChecked, refetch } = useSmartAccountCheck();

  useEffect(() => {
    const wallet = wallets.find((wallet) => wallet.address);
    if (wallet) {
      refetch();
    }
  }, [wallets, refetch]);

  const {
    registerSessionKey,
    isLoading: isRegistering,
    data: isRegistered,
  } = useRegisterSessionKey();

  const {
    grantPermissions,
    isLoading: isGrantingPermissions,
  } = useGrantPermissions();

  const { executeSessionKeyTest, isLoading: isExecutingTest } =
    useExecuteSessionKeyTest();

  const handleActivate = () => {
    registerSessionKey();
  };

  const handleGrantPermissions = () => {
    grantPermissions();
  };

  const handleExecuteTest = () => {
    executeSessionKeyTest();
  };
  return (
    <div className="space-y-4">
      <h1 className="mb-4 text-2xl font-bold">Account AI Agent</h1>

      {/* Step 1: AI Account Activation */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="default">Step 1</Badge>
            <CardTitle>Activate AI Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li className="list-disc">
                Activate an account for the AI agent to automatically process
                payments and transactions
              </li>
              <li className="list-disc">
                The account will be deployed on Base Sepolia
              </li>
              <li className="list-disc">
                A fee of 5 USDC is required (unused amount will be refunded)
              </li>
            </ul>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleActivate}
            disabled={isRegistering}
          >
            {isRegistering && <Spinner />}
            {isRegistering ? "Activating..." : "Activate"}
          </Button>
        </CardContent>
      </Card>

      {/* Step 2: Grant Permissions */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="default">Step 2</Badge>
            <CardTitle>権限の付与</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <ul className="space-y-2 text-sm text-muted-foreground ml-4">
              <li className="list-disc">
                AIエージェントがあなたに代わって決済を行う権限を付与します
              </li>
              <li className="list-disc">
                事前に設定された範囲内でのみ操作が可能です
              </li>
              <li className="list-disc">
                必要に応じて権限を取り消すことができます
              </li>
            </ul>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGrantPermissions}
            disabled={
              isGrantingPermissions ||
              isRegistering ||
              (isSmartAccountChecked ? false : !isRegistered)
            }
          >
            {isGrantingPermissions && <Spinner />}
            {isGrantingPermissions ? "Granting..." : "Grant Permissions"}
          </Button>
        </CardContent>
        <CardContent className="border-t pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Test Execution</h3>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li className="list-disc">
                  Execute a test transaction using the session key to verify
                  it's working correctly
                </li>
              </ul>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExecuteTest}
              disabled={
                isExecutingTest ||
                isGrantingPermissions ||
                isRegistering ||
                (isSmartAccountChecked ? false : !isRegistered)
              }
            >
              {isExecutingTest && <Spinner />}
              {isExecutingTest ? "Executing Test..." : "Execute Test"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountAIAgentPage;
