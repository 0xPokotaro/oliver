import { Hono } from "hono";
import { createRepositories } from "@oliver/api/repositories";

const app = new Hono().get("/", async (c) => {
  const repositories = createRepositories();
  const products = await repositories.product.findAll();
  return c.json(products);
});

export default app;
