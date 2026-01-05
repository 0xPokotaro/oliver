import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

export const useProductList = () => {
  return useQuery({
    queryKey: ["product-list"],
    queryFn: async () => {
      const response = await client.api.products.$get();
      if (!response.ok) {
        throw new Error("Failed to fetch product list");
      }
      return await response.json();
    },
  });
};
