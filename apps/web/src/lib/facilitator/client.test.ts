import { describe, it, expect, beforeEach, vi } from "vitest";
import { verifyPayment, settlePayment } from "./client";

// fetchをモック
global.fetch = vi.fn();

describe("facilitator-client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FACILITATOR_URL = "http://localhost:8403";
  });

  describe("verifyPayment", () => {
    it("正常に検証が成功した場合、検証結果を返す", async () => {
      const mockResponse = {
        valid: true,
        paymentId: "0xpayment123",
        payer: "0xpayer123",
        amount: "100000000000000000000",
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await verifyPayment("dummy-payload");

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8403/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment: "dummy-payload",
          }),
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it("検証が失敗した場合、エラーを投げる", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Invalid signature",
      } as Response);

      await expect(verifyPayment("invalid-payload")).rejects.toThrow(
        "Facilitator verify failed",
      );
    });

    it("ネットワークエラーの場合、エラーを投げる", async () => {
      vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

      await expect(verifyPayment("dummy-payload")).rejects.toThrow(
        "Failed to verify payment",
      );
    });

    it("FACILITATOR_URLが設定されていない場合、エラーを投げる", async () => {
      delete process.env.FACILITATOR_URL;

      await expect(verifyPayment("dummy-payload")).rejects.toThrow(
        "FACILITATOR_URL environment variable is not set",
      );
    });
  });

  describe("settlePayment", () => {
    it("非同期で決済を実行する", async () => {
      const mockResponse = {
        txHash: "0xtx123",
        paymentId: "0xpayment123",
        settled: true,
        blockNumber: "12345",
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await settlePayment("dummy-payload");

      // settlePaymentは非同期で実行されるため、少し待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8403/settle",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment: "dummy-payload",
          }),
        },
      );
    });

    it("決済が失敗した場合、エラーをログに記録する", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal server error",
      } as Response);

      await settlePayment("dummy-payload");

      // 非同期処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Facilitator settle failed"),
      );

      consoleErrorSpy.mockRestore();
    });

    it("ネットワークエラーの場合、エラーをログに記録する", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

      await settlePayment("dummy-payload");

      // 非同期処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to settle payment:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

