"use client";

import { QueryProvider } from "./query-provider";
import { PrivyProvider } from "./privy-provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <PrivyProvider>{children}</PrivyProvider>
    </QueryProvider>
  );
};

export default Providers;
