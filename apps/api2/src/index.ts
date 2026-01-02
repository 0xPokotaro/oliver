import { cors } from "hono/cors";
import { createFactory } from "hono/factory";
import { logger } from "hono/logger";
import users from "./routes/users";
import payment from "./routes/payment";
import product from "./routes/product";
import order from "./routes/order";
import { paymentMiddlewareHandler } from "./middlewares/paymentMiddleware";

type Env = {
  Variables: {
    myVar: string;
  };
};

// Create factory
const f = createFactory<Env>();
const paymentMiddleware = f.createMiddleware(paymentMiddlewareHandler);

// Create app
const app = f
  .createApp()
  .basePath("/api")
  .get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  })
  .use(logger())
  .use("*", cors())
  .use("/order/confirm", paymentMiddleware)
  .route("/users", users)
  .route("/payments", payment)
  .route("/orders", order)
  .route("/products", product);

// サーバー起動コード（Cloud Runと開発環境の両方で動作）
import { serve } from "@hono/node-server";

const port = Number(process.env.PORT) || 3001;

console.log(`Starting server on port ${port}...`);
console.log(`DATABASE_URL is ${process.env.DATABASE_URL ? 'set' : 'not set'}`);

try {
  serve({
    fetch: app.fetch,
    port,
    hostname: "0.0.0.0",
  }, (info) => {
    console.log(`Server is running on http://${info.address}:${info.port}`);
    console.log(`Server started successfully`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// 未処理エラーのハンドリング
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
export type AppType = typeof app;
