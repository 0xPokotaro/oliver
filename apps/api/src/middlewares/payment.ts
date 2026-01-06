import type { MiddlewareHandler } from "hono";
import { PaymentRequestSchema, type PaymentRequest, type PaymentResponse } from "@oliver/shared/schemas/api";
import { getAppConfig } from "../config";
import { CONTRACT_ADDRESSES } from "@oliver/shared/configs";
import { privateKeyToAccount } from "viem/accounts";
import { getSessionSignerPrivateKey } from "../utils/config";
import { toMultichainNexusAccount, createMeeClient, meeSessionActions } from "@biconomy/abstractjs";
import { NEXUS_ACCOUNT_CONFIG } from "@oliver/shared/configs/smart-account";

export const requirePaymentMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const payment = c.req.header("X-PAYMENT")
    const appConfig = getAppConfig();

    const paymentResponse: PaymentResponse = {
      error: "X-PAYMENT header is required",
      accepts: [
        {
          scheme: "exact",
          network: "base-sepolia",
          maxAmountRequired: "5",
          resource: "http://localhost:3001/api/payments",
          description: "Access to paid content",
          mimeType: "application/json",
          payTo: appConfig.paymentServerWalletAddress,
          maxTimeoutSeconds: 86400,
          asset: CONTRACT_ADDRESSES.BASE_SEPOLIA.JPYC,
          outputSchema: {
            input: {
              type: "http",
              method: "POST",
              discoverable: true
            }
          },
          extra: {
            name: "JPY Coin",
            version: "1"
          }
        }
      ],
      x402Version: 1
    };

    if (!payment) {
      return c.json(paymentResponse, 402);
    }

    // Base64 decode
    const decoded = atob(payment);
    const json = JSON.parse(decoded);
    const paymentRequest: PaymentRequest = PaymentRequestSchema.parse(json);
    console.log("json: ", paymentRequest);

    const sessionSigner = privateKeyToAccount(getSessionSignerPrivateKey());
    console.log("sessionSigner: ", sessionSigner);

    const sessionOrchestrator = await toMultichainNexusAccount({
      chainConfigurations: [
        {
          ...NEXUS_ACCOUNT_CONFIG.BASE_SEPOLIA,
          // TODO: ここにスマートアカウントをセット
          accountAddress:
            "0x9088453ab0a94Ba35306bB9Fb7e4Cff0E738EA34" as `0x${string}`,
        },
      ],
      signer: sessionSigner,
    });

    const sessionMeeClient = await createMeeClient({
      account: sessionOrchestrator,
    });
  
    const sessionMeeSessionClient = sessionMeeClient.extend(meeSessionActions);

    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log("user: ", user);

    await next();
  } catch (error) {
    console.error("error: ", error);
    return c.json({ error: "Unauthorized" }, 401);
  }
}
