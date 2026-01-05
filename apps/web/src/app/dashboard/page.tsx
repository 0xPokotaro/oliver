"use client";

import { ProductList } from "@/components/features/product/product-list";

const DashboardPage = () => {
  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-4 text-2xl font-bold">Products</h1>
        <ProductList />
      </div>
    </div>
  );
};

export default DashboardPage;
