"use client";

import { useEffect, useState } from "react";
import { useWalletOptions, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "@/components/ui/button";

const walletKey = "metamask";

const Container = () => {
  const [mounted, setMounted] = useState(false);

  const isLoggedIn = useIsLoggedIn();

  const { selectWalletOption } = useWalletOptions();
  const { handleLogOut } = useDynamicContext();

  const connectWithWallet = async (walletKey: string) => {
    return await selectWalletOption(walletKey);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      {mounted && isLoggedIn ? (
        <Button onClick={() => handleLogOut()}>Logout</Button>
      ) : (
        <Button onClick={() => connectWithWallet(walletKey)}>Login</Button>
      )}
    </div>
  );
};

export default Container;
