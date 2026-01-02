"use client";

import { useEffect } from "react";
// import UserProfileContainer from "@/app/_components/user-profile";
import { ProductList } from "@/components/features/product/product-list";
import { useAccount } from "@/hooks/use-account";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

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
            <p>Authenticated</p>
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
