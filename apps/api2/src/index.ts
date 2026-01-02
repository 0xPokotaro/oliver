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

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
}, (info) => {
  console.log(`Server is running on http://${info.address}:${info.port}`);
});

export default app;
export type AppType = typeof app;
