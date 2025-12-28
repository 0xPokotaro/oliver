"use client";

import { DynamicProvider } from "./dynamic-provider";
import { QueryProvider } from "./query-provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <DynamicProvider>{children}</DynamicProvider>
    </QueryProvider>
  );
};

export default Providers;
