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
    // データベース接続をテストしない（起動プローブ用）
    return c.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: Number(process.env.PORT) || 3001,
    });
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

// 詳細な起動ログ
console.log('='.repeat(50));
console.log('Application Startup Log');
console.log('='.repeat(50));
console.log(`Starting server on port ${port}...`);
console.log(`Environment variables:`, {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL_SET: !!process.env.DATABASE_URL,
  DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
});
console.log(`DATABASE_URL is ${process.env.DATABASE_URL ? 'set' : 'not set'}`);
console.log('Initializing application...');

try {
  serve({
    fetch: app.fetch,
    port,
    hostname: "0.0.0.0",
  }, (info) => {
    console.log('='.repeat(50));
    console.log('Server Started Successfully');
    console.log('='.repeat(50));
    console.log(`Server is running on http://${info.address}:${info.port}`);
    console.log(`Health check endpoint: http://${info.address}:${info.port}/api/health`);
    console.log(`Uptime: ${process.uptime()} seconds`);
    console.log('='.repeat(50));
  });
} catch (error) {
  console.error('='.repeat(50));
  console.error('Failed to start server');
  console.error('='.repeat(50));
  console.error('Error details:', error);
  if (error instanceof Error) {
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
  process.exit(1);
}

// 未処理エラーのハンドリング
process.on('uncaughtException', (error) => {
  console.error('='.repeat(50));
  console.error('Uncaught Exception');
  console.error('='.repeat(50));
  console.error('Error:', error);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('='.repeat(50));
  console.error('Unhandled Rejection');
  console.error('='.repeat(50));
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  if (reason instanceof Error) {
    console.error('Error message:', reason.message);
    console.error('Error stack:', reason.stack);
  }
  process.exit(1);
});

export default app;
export type AppType = typeof app;
