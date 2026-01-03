"use client";

import { ProductList } from "@/components/features/product/product-list";
import { UserProfile } from "@/components/features/user/user-profile";
import { TransactionHistory } from "@/components/features/transaction/transaction-history";

const DashboardPage = () => {
  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold">User Profile</h1>
        <UserProfile />
      </div>

      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold">Transaction History</h1>
        <TransactionHistory />
      </div>

      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold">Products</h1>
        <ProductList />
      </div>
    </div>
  );
};

export default DashboardPage;
