import { Hono } from "hono";

const app = new Hono()
  .post("/", async (c) => {
    return c.json({ message: "Hello, world!" });
  })

export default app;
