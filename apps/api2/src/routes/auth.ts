import { Hono } from "hono";

const app = new Hono().post("/login", async (c) => {
  return c.json({ message: "Hello, world!" });
});

export default app;
