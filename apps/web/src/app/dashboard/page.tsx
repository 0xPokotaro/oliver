"use client";

import { useEffect } from "react";
// import UserProfileContainer from "@/app/_components/user-profile";
import { ProductList } from "@/components/features/product/product-list";
import { useAccount } from "@/hooks/use-account";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const DashboardPage = () => {
  const { data } = useAccount();

  useEffect(() => {
    console.log("data: ", data);
  }, [data]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold">User Profile</h1>
        <div>
          {data ? (
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
                    {data.smartAccountAddress || (
                      <span className="text-muted-foreground italic">N/A</span>
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
      </div>

      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold">Products</h1>
        <ProductList />
      </div>
    </div>
  );
};

export default DashboardPage;
