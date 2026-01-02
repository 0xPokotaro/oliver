import { useProductList } from "@/hooks/use-product-list";
import { Spinner } from "@/components/ui/spinner";
import { ProductCard } from "./product-card";

export function ProductList() {
  const { data, isLoading } = useProductList();

  return (
    <div className="grid grid-cols-3 gap-4">
      {isLoading ? (
        <div className="col-span-3 flex justify-center items-center py-8">
          <Spinner className="size-8" />
        </div>
      ) : (
        data?.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  );
}
