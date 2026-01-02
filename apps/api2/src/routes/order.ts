import { Hono } from "hono";

const app = new Hono();

app.post("/confirm", async (c) => {
  const paymentSignature = c.req.header("PAYMENT-SIGNATURE");

  if (!paymentSignature) {
    return c.json({ message: "Hello, world!" });
  } else {
    return c.json({ message: "Hello, world!" });
  }
});

export default app;
