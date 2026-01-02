"use client";

import { useEffect } from "react";
import { useAccount } from "@/hooks/use-account";

const HomePage = () => {
  const { user } = useAccount();

  useEffect(() => {
    console.log("user: ", user);
  }, [user]);

  return <div>HomePage</div>;
};

export default HomePage;
