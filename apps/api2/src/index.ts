import "dotenv/config";
import { cors } from "hono/cors";
import { createFactory } from "hono/factory";
import { logger } from "hono/logger";
import auth from "./routes/auth";
import users from "./routes/users";
import payment from "./routes/payment";
import product from "./routes/product";
import order from "./routes/order";
import { paymentMiddleware } from "./middlewares/payment";
import { requireAuthMiddleware } from "./middlewares/auth";
import { generateSecretKey } from "./lib/encryption";
import type { Env } from "./types";

// 暗号化機能を初期化
generateSecretKey();

// Create factory
const f = createFactory<Env>();
const requireAuth = f.createMiddleware(requireAuthMiddleware);
const paymentMw = f.createMiddleware(paymentMiddleware);

// Create app
const app = f
  .createApp()
  .basePath("/api")
  .use(logger())
  .use("*", cors())
  .use("/order/confirm", paymentMw)
  .route("/products", product)
  .use("*", requireAuth)
  .route("/auth", auth)
  .route("/users", users)
  .route("/payments", payment)
  .route("/orders", order)

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
