import { hc } from "hono/client";
import type { AppType } from "@oliver/api";
import { getBackendApiUrl } from "@/lib/config";

const BACKEND_API_URL = getBackendApiUrl();

export const client = hc<AppType>(BACKEND_API_URL);
