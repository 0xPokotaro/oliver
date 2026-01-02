import { hc } from "hono/client";
import type { AppType } from "@oliver/api2";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const client = hc<AppType>(BASE_URL || "/");
