import { useQuery } from '@tanstack/react-query'
import { getAuthToken } from "@dynamic-labs/sdk-react-core";
import { client } from "@/lib/hono";

export const useUserProfile = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error("No authentication token available");
      }

      const response = await client.api.users.profile.$get({
        header: {
          Authorization: `Bearer ${authToken}`
        }
      })
      return response.json()
    }
  })
  return { data, isLoading, error }
}
