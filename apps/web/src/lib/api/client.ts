import { hc } from "hono/client";
import type { AppType } from "../../../../api2/src";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const client = hc<AppType>(BASE_URL || "/");
