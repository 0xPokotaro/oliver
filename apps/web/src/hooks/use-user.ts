"use client";

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono/client";
import type { UserInformation } from "@/lib/types";

interface UseUserOptions {
  userId: string;
  includeHistory?: boolean;
  historyLimit?: number;
}

export function useUser(options: UseUserOptions): {
  user: UserInformation | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { userId, includeHistory = true, historyLimit = 10 } = options;

  const { data, isLoading, error } = useQuery<UserInformation>({
    queryKey: ["user", userId, includeHistory, historyLimit],
    queryFn: async (): Promise<UserInformation> => {
      // クエリパラメータを手動で構築
      const queryParams = new URLSearchParams({
        includeHistory: includeHistory.toString(),
        historyLimit: historyLimit.toString(),
      });
      
      const url = `/api/users/${userId}?${queryParams.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const data = await response.json();
      return data as UserInformation;
    },
    enabled: !!userId,
  });

  return {
    user: data,
    isLoading,
    error: error instanceof Error ? error : error ? new Error("Unknown error") : null,
  };
}

