import { hc } from "hono/client";
import type { AppType } from "@oliver/api2";

export const client = hc<AppType>("/");
