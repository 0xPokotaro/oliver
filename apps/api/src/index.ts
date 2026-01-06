import "dotenv/config";
import { cors } from "hono/cors";
import { createFactory } from "hono/factory";
import { logger } from "hono/logger";
import auth from "./routes/auth";
import users from "./routes/users";
import product from "./routes/product";
import transaction from "./routes/transaction";
import payment from "./routes/payment";
import health from "./routes/health";
import { requireAuthMiddleware } from "./middlewares/auth";
import { requirePaymentMiddleware } from "./middlewares/payment";
import { createErrorHandler } from "./lib/error/handler";
import type { Env } from "./types";

// Create factory
const f = createFactory<Env>();
const requireAuth = f.createMiddleware(requireAuthMiddleware);
const requirePayment = f.createMiddleware(requirePaymentMiddleware);

// Create app
const app = f
  .createApp()
  .basePath("/api")
  .onError(createErrorHandler())
  .use(logger())
  .use("*", cors())
  .route("/health", health)
  .route("/products", product)
  .use("*", requireAuth)
  .use("/payments", requirePayment)
  .route("/auth", auth)
  .route("/users", users)
  .route("/transactions", transaction)
  .route("/payments", payment)

// サーバー起動コード（Cloud Runと開発環境の両方で動作）
import { serve } from "@hono/node-server";

const port = Number(process.env.PORT) || 3001;

try {
  serve(
    {
      fetch: app.fetch,
      port,
      hostname: "0.0.0.0",
    },
    (info) => {
      console.log(`Server is running on http://${info.address}:${info.port}`);
    },
  );
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

export default app;
export type AppType = typeof app;
