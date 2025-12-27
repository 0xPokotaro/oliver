"use client";

import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono/client";
import type { BuyRequest } from "@/lib/types";
import type { PaymentRequiredResponse } from "@/lib/types/merchant-types";

interface BuyProductResponse {
  status: number;
  paymentRequiredResponse: PaymentRequiredResponse | null;
  error: string | null;
}

interface BuyProductVariables {
  productId: string;
  request: BuyRequest;
}

export function useBuyProduct() {
  const { mutate, mutateAsync, data, error, isPending, isSuccess, isError } =
    useMutation<BuyProductResponse, Error, BuyProductVariables>({
      mutationFn: async ({ productId, request }) => {
        const response = await client.api.products.buy[":id"].$post({
          param: { id: productId },
          // @ts-expect-error - Hono client type inference issue with json property
          json: request,
        });

        const status = response.status;
        let paymentRequiredResponse: PaymentRequiredResponse | null = null;
        let error: string | null = null;

        if (status === 402) {
          // 402 Payment Required は正常なレスポンス
          paymentRequiredResponse =
            (await response.json()) as PaymentRequiredResponse;
        } else if (!response.ok) {
          // エラーレスポンス
          const errorText = await response.text();
          error = `Error ${status}: ${errorText}`;
        } else {
          // 200 OK など（今回は想定外）
          const responseData = await response.json();
          error = `Unexpected status ${status}: ${JSON.stringify(responseData)}`;
        }

        return {
          status,
          paymentRequiredResponse,
          error,
        };
      },
    });

  return {
    mutate,
    mutateAsync,
    data,
    error:
      error instanceof Error
        ? error
        : error
          ? new Error("Unknown error")
          : null,
    isLoading: isPending,
    isSuccess,
    isError,
  };
}
