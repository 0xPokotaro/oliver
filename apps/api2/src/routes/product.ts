import { Hono } from "hono";
import { createRepositories } from "@oliver/api/repositories";

const repositories = createRepositories();

const app = new Hono();

app.get("/", async (c) => {
  const products = await repositories.product.findAll();
  return c.json(products);
});

export default app;
