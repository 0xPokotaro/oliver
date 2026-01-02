"use client";

import { useEffect } from "react";
import { useAccount } from "@/hooks/use-account";

const HomePage = () => {
  const { data } = useAccount();

  useEffect(() => {
    console.log("data: ", data);
  }, [data]);

  return <div>HomePage</div>;
};

export default HomePage;
