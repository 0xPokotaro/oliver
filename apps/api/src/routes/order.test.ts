import { describe, it, expect, beforeAll } from "vitest";
import { testClient } from "hono/testing";
import app from "../index";
import { getPrismaClient } from "../lib/prisma";

describe("POST /confirm", () => {
  let productId: string;

  beforeAll(async () => {
    // データベースから最初のproductを取得
    const prisma = getPrismaClient();
    const product = await prisma.product.findFirst();
    if (!product) {
      throw new Error("Product not found in database. Please run seed script.");
    }
    productId = product.id;
  });

  it("should return 402 when payment signature is missing", async () => {
    const client = testClient(app);

    const res = await client.api.orders.confirm.$post({
      json: {
        items: [
          {
            productId,
            quantity: 1,
          },
        ],
      },
    });

    expect(res.status).toBe(402);
  });

  it("should return 200 when payment signature is present", async () => {
    const client = testClient(app);

    const res = await client.api.orders.confirm.$post({
      header: {
        "PAYMENT-SIGNATURE": "123",
      },
      json: {
        items: [
          {
            productId,
            quantity: 1,
          },
        ],
      },
    });

    expect(res.status).toBe(200);
  });
});
