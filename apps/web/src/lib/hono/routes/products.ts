import { Hono } from "hono";
import { getProducts, buyProduct } from "@/lib/merchant/client";
import type { BuyRequest } from "@/lib/types";

const products = new Hono()
  .get("/", async (c) => {
    const category = c.req.query("category");

    try {
      const products = await getProducts(category);
      return c.json(products);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 500);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post("/buy/:id", async (c) => {
    const productId = c.req.param("id");
    const request = await c.req.json<BuyRequest>();

    try {
      const response = await buyProduct(productId, request);

      // レスポンスのステータスコードとボディをそのまま転送
      const status = response.status;
      const contentType =
        response.headers.get("Content-Type") || "application/json";

      // レスポンスボディを取得してそのまま転送
      const body = await response.text();
      return c.body(body, status as any, {
        "Content-Type": contentType,
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 500);
      }
      return c.json({ error: "Internal server error" }, 500);
    }
  });

export default products;
