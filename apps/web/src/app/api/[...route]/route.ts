import { handle } from "hono/vercel";
import { app } from "@/lib/hono/app";

const handler = handle(app);

export { handler as GET, handler as POST };
