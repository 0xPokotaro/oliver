import { Hono } from "hono";
import products from "./routes/products";
import users from "./routes/users";
import auth from "./routes/auth";

export const app = new Hono()
  .basePath("/api")
  .route("/products", products)
  .route("/users", users)
  .route("/auth", auth);

export type AppType = typeof app;
