"use client";

import { QueryProvider } from "./query-provider";
import { DynamicProvider } from "./dynamic-provider";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryProvider>
      <DynamicProvider>{children}</DynamicProvider>
    </QueryProvider>
  );
};
