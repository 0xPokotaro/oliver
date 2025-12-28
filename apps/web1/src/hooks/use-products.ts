"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono/client";
import type { Product } from "@/lib/types";
import { DEFAULT_PRODUCT_CATEGORY } from "@/lib/constants";

interface UseProductsOptions {
  category?: string;
}

export function useProducts(options?: UseProductsOptions) {
  const { category = DEFAULT_PRODUCT_CATEGORY } = options ?? {};

  const { data, isLoading, error } = useQuery<Product[]>({
    queryKey: ["products", category],
    queryFn: async () => {
      // TODO: @oliver/apiにproductsエンドポイントを追加する必要があります
      const response = await (client as any).api.products.$get({
        query: {
          category,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      return await response.json();
    },
  });

  return {
    products: data ?? [],
    isLoading,
    error:
      error instanceof Error
        ? error
        : error
          ? new Error("Unknown error")
          : null,
  };
}
