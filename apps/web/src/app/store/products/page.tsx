import { Container } from "@/components/layout/container";
import { getProducts } from "@/lib/merchant/client";
import type { Product } from "@/lib/types/merchant-types";
import { ProductsTable } from "./_components/products-table";

const Products = async () => {
  let products: Product[] = [];
  let error: Error | null = null;

  try {
    products = await getProducts();
  } catch (err) {
    error = err instanceof Error ? err : new Error("Unknown error");
  }

  return (
    <Container maxWidth="7xl" className="w-full">
      <ProductsTable
        products={products}
        isLoading={false}
        error={error}
      />
    </Container>
  );
};

export default Products;
