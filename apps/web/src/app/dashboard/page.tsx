"use client";

import { ProductList } from "@/components/features/product/product-list";
import { UserProfile } from "@/components/features/user/user-profile";

const DashboardPage = () => {
  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold">User Profile</h1>
        <UserProfile />
      </div>

      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold">Products</h1>
        <ProductList />
      </div>
    </div>
  );
};

export default DashboardPage;
