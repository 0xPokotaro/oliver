import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";

export const useAccount = () => {
  const { user, authenticated } = usePrivy();

  return useQuery({
    queryKey: ["account"],
    enabled: authenticated,
    queryFn: () => {
      console.log("user: ", user);
      return {
        user,
        authenticated,
      };
    },
  });
};
