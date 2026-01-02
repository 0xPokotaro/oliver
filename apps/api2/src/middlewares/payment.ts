import type { MiddlewareHandler } from "hono";
import type { PaymentRequired } from "@x402/core/types";
import { OrderConfirmRequest, type CartItem } from "@oliver/shared/schemas/api";
import { PaymentManager } from "@oliver/api/lib/PaymentManager";
import { createRepositories } from "../repositories";
import { getAppConfig } from "@oliver/api/config";

function createPaymentManager(): PaymentManager {
  const config = getAppConfig();
  const repositories = createRepositories();

  return new PaymentManager({
    baseURL: config.facilitatorBaseURL,
    merchantAddress: config.merchantAddress,
    productRepository: repositories.product,
    defaultCurrency: config.defaultCurrency,
  });
}

// 遅延初期化: 実際に使用される時まで初期化を遅延
let paymentManager: PaymentManager | null = null;

function getPaymentManager(): PaymentManager {
  if (!paymentManager) {
    paymentManager = createPaymentManager();
  }
  return paymentManager;
}

export const paymentMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const body = await c.req.json();
    const validatedBody = OrderConfirmRequest.safeParse(body);

    if (!validatedBody.success) {
      return c.json({ error: "Invalid request body" }, 400);
    }

    const { items } = validatedBody.data;
    const paymentSignature = c.req.header("PAYMENT-SIGNATURE");

    if (!items || items.length === 0) {
      return c.json({ error: "items are missing" }, 400);
    }

    if (!paymentSignature) {
      const manager = getPaymentManager();
      const result: PaymentRequired = await manager.buildPaymentRequired(items);

      return c.json(result, 402);
    }

    await next();
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

