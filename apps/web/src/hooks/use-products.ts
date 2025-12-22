"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/merchant/client";
import type { Product } from "@/lib/types/merchant-types";

/**
 * 商品一覧を取得するhooks
 * @param category カテゴリでフィルタリング（オプション）
 * @returns 商品一覧のクエリ結果
 */
export function useProducts(category?: string) {
  return useQuery<Product[]>({
    queryKey: ["products", category],
    queryFn: () => getProducts(category),
  });
}

