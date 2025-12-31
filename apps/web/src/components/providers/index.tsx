"use client";

import { QueryProvider } from "./query-provider";
import { PrivyProvider } from "./privy-provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <PrivyProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </PrivyProvider>
  );
};

export default Providers;
