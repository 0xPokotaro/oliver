import {
  useLogin as usePrivyLogin,
  useLogout,
  getAccessToken,
} from "@privy-io/react-auth";
import { client } from "@/lib/api/client";

export const useLogin = () => {
  const { logout } = useLogout();
  const { login } = usePrivyLogin({
    onComplete: async () => {
      try {
        const authToken = await getAccessToken();
        console.log("authToken: ", authToken);

        const response = await client.api.auth.login.$post({
          header: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to login");
        }

        const json = await response.json();
        console.log("json: ", json);
      } catch (error) {
        console.error("error: ", error);
        await logout();
      }
    },
  });

  return {
    login,
  };
};
