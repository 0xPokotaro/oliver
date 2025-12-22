import { describe, it, expect, beforeEach, vi } from "vitest";
import { x402Middleware, getX402Config } from "./middleware";
import * as facilitatorClient from "../facilitator/client";
import type { X402Config } from "@/lib/types";

vi.mock("../facilitator/client", () => ({
  verifyPayment: vi.fn(),
  settlePayment: vi.fn(),
}));

describe("x402Middleware", () => {
  const mockConfig: X402Config = {
    payTo: "0x1234567890123456789012345678901234567890",
    asset: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    maxAmountRequired: "100000000000000000000",
    network: "localhost",
    maxTimeoutSeconds: 3600,
    facilitatorUrl: "http://localhost:8403",
    description: "Test resource",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("決済ヘッダーがない場合、402レスポンスを返す", async () => {
    const headers = new Headers();
    const result = await x402Middleware(headers, "/test/resource", mockConfig);

    expect(result.success).toBe(false);
    expect(result.errorResponse).toBeDefined();
    expect(result.errorResponse?.error).toBe("Payment required");
    expect(result.errorResponse?.accepts[0].payTo).toBe(mockConfig.payTo);
  });

  it("決済ヘッダーがあり検証が成功した場合、決済情報を返す", async () => {
    const headers = new Headers();
    const mockPaymentPayload = {
      x402Version: 1,
      scheme: "evm-permit",
      network: "localhost",
      payload: {
        paymentId: "0xpayment123",
        payer: "0xpayer123",
        recipient: mockConfig.payTo,
        amount: "100000000000000000000",
        duration: 3600,
        deadline: String(Math.floor(Date.now() / 1000) + 3600),
        nonce: "0",
        permitSignature: { v: 27, r: "0x...", s: "0x..." },
        paymentSignature: { v: 27, r: "0x...", s: "0x..." },
      },
    };
    const base64Payload = Buffer.from(JSON.stringify(mockPaymentPayload)).toString("base64");
    headers.set("X-PAYMENT", base64Payload);

    vi.mocked(facilitatorClient.verifyPayment).mockResolvedValue({
      valid: true,
      paymentId: "0xpayment123",
      payer: "0xpayer123",
      amount: "100000000000000000000",
    });

    const result = await x402Middleware(headers, "/test/resource", mockConfig);

    expect(result.success).toBe(true);
    expect(result.paymentInfo).toBeDefined();
    expect(result.paymentInfo?.paymentId).toBe("0xpayment123");
    expect(result.paymentInfo?.payer).toBe("0xpayer123");
    expect(facilitatorClient.verifyPayment).toHaveBeenCalledWith(base64Payload);
    expect(facilitatorClient.settlePayment).toHaveBeenCalledWith(base64Payload);
  });

  it("金額不足の場合、402レスポンスを返す", async () => {
    const headers = new Headers();
    const mockPaymentPayload = {
      x402Version: 1,
      scheme: "evm-permit",
      network: "localhost",
      payload: {
        paymentId: "0xpayment123",
        payer: "0xpayer123",
        recipient: mockConfig.payTo,
        amount: "50000000000000000000", // 要求額より少ない
        duration: 3600,
        deadline: String(Math.floor(Date.now() / 1000) + 3600),
        nonce: "0",
        permitSignature: { v: 27, r: "0x...", s: "0x..." },
        paymentSignature: { v: 27, r: "0x...", s: "0x..." },
      },
    };
    const base64Payload = Buffer.from(JSON.stringify(mockPaymentPayload)).toString("base64");
    headers.set("X-PAYMENT", base64Payload);

    vi.mocked(facilitatorClient.verifyPayment).mockResolvedValue({
      valid: true,
      paymentId: "0xpayment123",
      payer: "0xpayer123",
      amount: "50000000000000000000", // 要求額より少ない
    });

    const result = await x402Middleware(headers, "/test/resource", mockConfig);

    expect(result.success).toBe(false);
    expect(result.errorResponse?.error).toBe("Insufficient payment amount");
  });

  it("Facilitator検証が失敗した場合、402レスポンスを返す", async () => {
    const headers = new Headers();
    const mockPaymentPayload = {
      x402Version: 1,
      scheme: "evm-permit",
      network: "localhost",
      payload: {
        paymentId: "0xpayment123",
        payer: "0xpayer123",
        recipient: mockConfig.payTo,
        amount: "100000000000000000000",
        duration: 3600,
        deadline: String(Math.floor(Date.now() / 1000) + 3600),
        nonce: "0",
        permitSignature: { v: 27, r: "0x...", s: "0x..." },
        paymentSignature: { v: 27, r: "0x...", s: "0x..." },
      },
    };
    const base64Payload = Buffer.from(JSON.stringify(mockPaymentPayload)).toString("base64");
    headers.set("X-PAYMENT", base64Payload);

    vi.mocked(facilitatorClient.verifyPayment).mockResolvedValue({
      valid: false,
      paymentId: "0xpayment123",
      payer: "0xpayer123",
      amount: "100000000000000000000",
    });

    const result = await x402Middleware(headers, "/test/resource", mockConfig);

    expect(result.success).toBe(false);
    expect(result.errorResponse?.error).toBe("Invalid payment intent signature");
  });

  it("無効なBase64ペイロードの場合、エラーを返す", async () => {
    const headers = new Headers();
    headers.set("X-PAYMENT", "invalid-base64!!!");

    const result = await x402Middleware(headers, "/test/resource", mockConfig);

    expect(result.success).toBe(false);
    expect(result.errorResponse).toBeDefined();
  });

  it("Facilitator接続エラーの場合、エラーメッセージを返す", async () => {
    const headers = new Headers();
    const mockPaymentPayload = {
      x402Version: 1,
      scheme: "evm-permit",
      network: "localhost",
      payload: {
        paymentId: "0xpayment123",
        payer: "0xpayer123",
        recipient: mockConfig.payTo,
        amount: "100000000000000000000",
        duration: 3600,
        deadline: String(Math.floor(Date.now() / 1000) + 3600),
        nonce: "0",
        permitSignature: { v: 27, r: "0x...", s: "0x..." },
        paymentSignature: { v: 27, r: "0x...", s: "0x..." },
      },
    };
    const base64Payload = Buffer.from(JSON.stringify(mockPaymentPayload)).toString("base64");
    headers.set("X-PAYMENT", base64Payload);

    vi.mocked(facilitatorClient.verifyPayment).mockRejectedValue(
      new Error("Network error"),
    );

    const result = await x402Middleware(headers, "/test/resource", mockConfig);

    expect(result.success).toBe(false);
    expect(result.errorResponse?.error).toContain("Network error");
  });
});

describe("getX402Config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("環境変数から設定を取得する", () => {
    process.env.X402_PAY_TO = "0xtest";
    process.env.X402_ASSET = "0xasset";
    process.env.X402_MAX_AMOUNT_REQUIRED = "1000";

    const config = getX402Config();

    expect(config.payTo).toBe("0xtest");
    expect(config.asset).toBe("0xasset");
    expect(config.maxAmountRequired).toBe("1000");
  });

  it("必須環境変数が設定されていない場合、エラーを投げる", () => {
    delete process.env.X402_PAY_TO;
    process.env.X402_ASSET = "0xasset";
    process.env.X402_MAX_AMOUNT_REQUIRED = "1000";

    expect(() => getX402Config()).toThrow("X402_PAY_TO environment variable is not set");
  });
});

