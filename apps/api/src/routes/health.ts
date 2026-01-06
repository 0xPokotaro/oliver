import { Hono } from "hono";

const app = new Hono().get("/", async (c) => {
  return c.json({ status: "ok" }, 200);
});

export default app;

