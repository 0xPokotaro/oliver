import { usePrivy } from "@privy-io/react-auth";

export const useAccount = () => {
  const { user, ready } = usePrivy();

  return {
    user,
    ready,
  }
}
