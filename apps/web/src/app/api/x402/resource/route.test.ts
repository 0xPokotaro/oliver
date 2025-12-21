import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET } from "./route";
import * as middleware from "@/lib/x402/middleware";

// ミドルウェアのモック
vi.mock("@/lib/x402/middleware", () => ({
  x402Middleware: vi.fn(),
}));

describe("GET /api/x402/resource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 環境変数を設定
    process.env.X402_PAY_TO = "0x1234567890123456789012345678901234567890";
    process.env.X402_ASSET = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
    process.env.X402_MAX_AMOUNT_REQUIRED = "100000000000000000000";
    process.env.FACILITATOR_URL = "http://localhost:8403";
  });

  it("決済ヘッダーがない場合、402 Payment Requiredを返す", async () => {
    const mockHeaders = new Headers();
    const mockRequest = new Request("http://localhost:3000/api/x402/resource", {
      headers: mockHeaders,
    });

    vi.mocked(middleware.x402Middleware).mockResolvedValue({
      success: false,
      errorResponse: {
        x402Version: 1,
        accepts: [
          {
            scheme: "evm-permit",
            network: "localhost",
            maxAmountRequired: "100000000000000000000",
            resource: "/api/x402/resource",
            description: "Access to protected resource",
            payTo: "0x1234567890123456789012345678901234567890",
            asset: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            maxTimeoutSeconds: 3600,
          },
        ],
        error: "Payment required",
      },
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(402);
    expect(data.x402Version).toBe(1);
    expect(data.accepts).toHaveLength(1);
    expect(data.accepts[0].scheme).toBe("evm-permit");
    expect(data.error).toBe("Payment required");
  });

  it("決済ヘッダーがあり検証が成功した場合、200 OKを返す", async () => {
    const mockHeaders = new Headers();
    mockHeaders.set("X-PAYMENT", "dummy-base64-payload");

    const mockRequest = new Request("http://localhost:3000/api/x402/resource", {
      headers: mockHeaders,
    });

    const mockPaymentInfo = {
      paymentId: "0xpayment123",
      payer: "0xpayer123",
      amount: "100000000000000000000",
    };

    vi.mocked(middleware.x402Middleware).mockResolvedValue({
      success: true,
      paymentInfo: mockPaymentInfo,
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBe("Protected content");
    expect(data.payment).toEqual(mockPaymentInfo);

    // X-PAYMENT-RESPONSEヘッダーの確認
    const paymentResponseHeader = response.headers.get("X-PAYMENT-RESPONSE");
    expect(paymentResponseHeader).toBeTruthy();
    if (paymentResponseHeader) {
      const paymentResponse = JSON.parse(paymentResponseHeader);
      expect(paymentResponse.paymentId).toBe(mockPaymentInfo.paymentId);
      expect(paymentResponse.payer).toBe(mockPaymentInfo.payer);
      expect(paymentResponse.amount).toBe(mockPaymentInfo.amount);
    }
  });

  it("決済検証が失敗した場合、402 Payment Requiredを返す", async () => {
    const mockHeaders = new Headers();
    mockHeaders.set("X-PAYMENT", "invalid-payload");

    const mockRequest = new Request("http://localhost:3000/api/x402/resource", {
      headers: mockHeaders,
    });

    vi.mocked(middleware.x402Middleware).mockResolvedValue({
      success: false,
      errorResponse: {
        x402Version: 1,
        accepts: [
          {
            scheme: "evm-permit",
            network: "localhost",
            maxAmountRequired: "100000000000000000000",
            resource: "/api/x402/resource",
            description: "Access to protected resource",
            payTo: "0x1234567890123456789012345678901234567890",
            asset: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            maxTimeoutSeconds: 3600,
          },
        ],
        error: "Invalid payment intent signature",
      },
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(402);
    expect(data.error).toBe("Invalid payment intent signature");
  });

  it("金額不足の場合、402 Payment Requiredを返す", async () => {
    const mockHeaders = new Headers();
    mockHeaders.set("X-PAYMENT", "insufficient-amount-payload");

    const mockRequest = new Request("http://localhost:3000/api/x402/resource", {
      headers: mockHeaders,
    });

    vi.mocked(middleware.x402Middleware).mockResolvedValue({
      success: false,
      errorResponse: {
        x402Version: 1,
        accepts: [
          {
            scheme: "evm-permit",
            network: "localhost",
            maxAmountRequired: "100000000000000000000",
            resource: "/api/x402/resource",
            description: "Access to protected resource",
            payTo: "0x1234567890123456789012345678901234567890",
            asset: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            maxTimeoutSeconds: 3600,
          },
        ],
        error: "Insufficient payment amount",
      },
    });

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(402);
    expect(data.error).toBe("Insufficient payment amount");
  });
});

