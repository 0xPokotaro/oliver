import { hc } from "hono/client";
import type { AppType } from "@/lib/api";

export const client = hc<AppType>(
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
);
