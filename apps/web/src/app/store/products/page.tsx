import { Container } from "@/components/layout/container";
import type { Product } from "@/lib/types/merchant-types";
import { client } from "@/lib/hono/client";
import { ProductsTable } from "./_components/products-table";

const Products = async () => {
  let products: Product[] = [];
  let error: Error | null = null;

  try {
    const response = await client.api.products.$get({
      query: {
        category: "cat_food",
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }
    
    products = await response.json();
  } catch (err) {
    error = err instanceof Error ? err : new Error('Unknown error');
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
