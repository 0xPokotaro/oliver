"use client";

import { QueryProvider } from "./query-provider";
import { PrivyProvider } from "./privy-provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <PrivyProvider key="privy-provider">
      <QueryProvider key="query-provider">{children}</QueryProvider>
    </PrivyProvider>
  );
};

export default Providers;
