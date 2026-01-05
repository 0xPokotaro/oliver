import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { client } from "@/lib/api/client";

export interface TransactionListItem {
  id: string;
  type: string;
  hash: string;
  createdAt: string;
}

export const useTransactionList = () => {
  const { getAccessToken } = usePrivy();

  return useQuery({
    queryKey: ["transaction-list"],
    queryFn: async () => {
      const authToken = await getAccessToken();
      if (!authToken) {
        throw new Error("No authentication token available");
      }

      const response = await client.api.transactions.$get({
        header: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transaction list");
      }

      return (await response.json()) as TransactionListItem[];
    },
  });
};
