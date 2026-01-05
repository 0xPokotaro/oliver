"use client";

import { useMemo, useEffect, useState, useCallback } from "react";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount } from "@/hooks/use-account-fetch";
import { getSessionSignerPrivateKey } from "@/lib/config";
import {
  toMultichainNexusAccount,
  getMEEVersion,
  MEEVersion,
} from "@biconomy/abstractjs";
import { useWallets } from "@privy-io/react-auth";
import { http } from "viem";
import { baseSepolia } from "viem/chains";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/animate-ui/components/animate/tooltip";
import { InfoIcon } from "lucide-react";

const AccountGeneralPage = () => {
  const { data } = useAccount();
  const { wallets } = useWallets();

  const [scAddress, setScAddress] = useState<string | null>(null);

  const initWalletAccount = useCallback(async () => {
    if (!wallets || wallets.length === 0) {
      return;
    }

    const wallet = wallets.find((wallet) => wallet.address);

    if (!wallet) {
      return null;
    }

    const orchestrator = await toMultichainNexusAccount({
      signer: await wallet.getEthereumProvider(),
      chainConfigurations: [
        {
          chain: baseSepolia,
          transport: http(),
          version: getMEEVersion(MEEVersion.V2_1_0),
        },
      ],
    });

    setScAddress(orchestrator.addressOn(baseSepolia.id)!);
  }, [wallets]);

  // アプリケーション全体で共有されるAI Accountアドレスを計算
  const smartAccountAddress = useMemo(() => {
    try {
      const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());
      return sessionSigner.address;
    } catch (error) {
      console.error("Failed to get smart account address:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    initWalletAccount();
  }, [data, initWalletAccount]);

  return (
    <div className="space-y-4">
      <h1 className="mb-4 text-2xl font-bold">Account General</h1>

      {!data ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Please sign in to continue.</AlertTitle>
        </Alert>
      ) : (
        <>
          {/* Basic Information Section */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User ID */}
              <div className="space-y-2">
                <Label>User ID</Label>
                <div className="text-sm font-mono break-all">
                  {data.privyUserId}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Information Section */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Wallet Information</CardTitle>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>EOA</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Externally Owned Account - Your wallet address
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {data.address || "-"}
                      </TableCell>
                      <TableCell>0.5 ETH</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>Session Signer</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              A signer account for Biconomy Smart Sessions with
                              delegated permissions
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {smartAccountAddress || "-"}
                      </TableCell>
                      <TableCell>0.0 ETH</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span>AI Account</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Programmable wallet account powered by Biconomy
                              MEE
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {scAddress || "-"}
                      </TableCell>
                      <TableCell>0.1 ETH</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TooltipProvider>
            </CardContent>
          </Card>

          {/* Shipping Information Section */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
                  {/* Postal Code */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Postal Code
                    </Label>
                    <div className="text-sm">150-0001</div>
                  </div>
                  {/* Prefecture */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Prefecture
                    </Label>
                    <div className="text-sm">Tokyo</div>
                  </div>
                  {/* City/Ward */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      City/Ward
                    </Label>
                    <div className="text-sm">Shibuya-ku, Jingumae</div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  {/* Street Address */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Street Address
                    </Label>
                    <div className="text-sm">1-1-1</div>
                  </div>
                  {/* Building Name / Room Number */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Building Name / Room Number
                    </Label>
                    <div className="text-sm">Sample Mansion 101</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AccountGeneralPage;
