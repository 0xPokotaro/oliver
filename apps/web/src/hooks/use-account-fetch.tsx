import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import { getAccessToken } from "@privy-io/react-auth";

export const useAccount = () => {
  const { user, authenticated } = usePrivy();

  return useQuery({
    queryKey: ["account"],
    enabled: authenticated,
    queryFn: async () => {
      const authToken = await getAccessToken();
      if (!authToken) {
        throw new Error("No authentication token available");
      }

      const response = await client.api.users.profile.$get({
        header: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch account");
      }

      const data = await response.json();

      return {
        ...data,
        address: user?.wallet?.address,
      };
    },
  });
};
