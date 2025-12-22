import { Container } from "@/components/layout/container";
import { getProducts } from "@/lib/merchant/client";
import { ProductsTable } from "./_components/products-table";

const Products = async () => {
  try {
    const products = await getProducts();
    return (
      <Container maxWidth="7xl" className="w-full">
        <ProductsTable
          products={products}
          isLoading={false}
          error={null}
        />
      </Container>
    );
  } catch (error) {
    return (
      <Container maxWidth="7xl" className="w-full">
        <ProductsTable
          products={[]}
          isLoading={false}
          error={error instanceof Error ? error : new Error("Unknown error")}
        />
      </Container>
    );
  }
};

export default Products;
