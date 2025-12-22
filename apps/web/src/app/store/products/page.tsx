import { Container } from "@/components/layout/container";
import { ProductsTable } from "./_components/products-table";

const Products = () => {
  return (
    <Container maxWidth="7xl" className="w-full">
      <ProductsTable />
    </Container>
  );
};

export default Products;
