import { describe, it, expect, beforeEach, vi } from "vitest";
import { createX402PaymentHeader, fetchWithX402 } from "./client";
import type { WalletClient, PublicClient } from "viem";

// viemのモック
const mockWalletClient = {
  getAddresses: vi.fn(),
} as unknown as WalletClient;

const mockPublicClient = {
  readContract: vi.fn(),
} as unknown as PublicClient;

// signTypedDataをモック
vi.mock("viem/actions", () => ({
  signTypedData: vi.fn(),
}));

describe("x402-client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createX402PaymentHeader", () => {
    it("決済ヘッダーを生成する", async () => {
      const mockAddress = "0x1234567890123456789012345678901234567890" as `0x${string}`;
      vi.mocked(mockWalletClient.getAddresses).mockResolvedValue([mockAddress]);

      vi.mocked(mockPublicClient.readContract).mockImplementation((args: any) => {
        if (args.functionName === "DOMAIN_SEPARATOR") {
          return Promise.resolve("0xdomainseparator");
        }
        if (args.functionName === "nonces") {
          return Promise.resolve(BigInt(0));
        }
        return Promise.resolve(null);
      });

      const { signTypedData } = await import("viem/actions");
      vi.mocked(signTypedData).mockResolvedValue(
        "0x" +
          "r".repeat(64) +
          "s".repeat(64) +
          "1b",
      );

      const result = await createX402PaymentHeader({
        tokenAddress: "0xtoken",
        tokenName: "Test Token",
        escrowAddress: "0xescrow",
        chainId: 31337,
        recipient: "0xrecipient",
        amountUSD: 100,
        durationSeconds: 3600,
        walletClient: mockWalletClient,
        publicClient: mockPublicClient,
      });

      expect(result.paymentHeader).toBeTruthy();
      expect(result.paymentId).toBeTruthy();
      expect(result.paymentId).toMatch(/^0x/);
    });

    it("ウォレットアドレスが取得できない場合、エラーを投げる", async () => {
      vi.mocked(mockWalletClient.getAddresses).mockResolvedValue([]);

      await expect(
        createX402PaymentHeader({
          tokenAddress: "0xtoken",
          tokenName: "Test Token",
          escrowAddress: "0xescrow",
          chainId: 31337,
          recipient: "0xrecipient",
          amountUSD: 100,
          durationSeconds: 3600,
          walletClient: mockWalletClient,
          publicClient: mockPublicClient,
        }),
      ).rejects.toThrow("No account found in wallet");
    });
  });

  describe("fetchWithX402", () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it("通常のレスポンス（200）の場合はそのまま返す", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }), {
        status: 200,
      });

      vi.mocked(fetch).mockResolvedValue(mockResponse);

      const response = await fetchWithX402("/api/test", {}, {
        tokenAddress: "0xtoken",
        tokenName: "Test Token",
        escrowAddress: "0xescrow",
        chainId: 31337,
        walletClient: mockWalletClient,
        publicClient: mockPublicClient,
      });

      expect(response.status).toBe(200);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("402レスポンスの場合、決済ヘッダーを生成して再リクエスト", async () => {
      const mockAddress = "0x1234567890123456789012345678901234567890" as `0x${string}`;
      vi.mocked(mockWalletClient.getAddresses).mockResolvedValue([mockAddress]);

      vi.mocked(mockPublicClient.readContract).mockImplementation((args: any) => {
        if (args.functionName === "DOMAIN_SEPARATOR") {
          return Promise.resolve("0xdomainseparator");
        }
        if (args.functionName === "nonces") {
          return Promise.resolve(BigInt(0));
        }
        return Promise.resolve(null);
      });

      const { signTypedData } = await import("viem/actions");
      vi.mocked(signTypedData).mockResolvedValue(
        "0x" +
          "r".repeat(64) +
          "s".repeat(64) +
          "1b",
      );

      // 最初の402レスポンス
      const paymentRequiredResponse = new Response(
        JSON.stringify({
          x402Version: 1,
          accepts: [
            {
              scheme: "evm-permit",
              network: "localhost",
              maxAmountRequired: "100000000000000000000",
              resource: "/api/test",
              description: "Test resource",
              payTo: "0xrecipient",
              asset: "0xtoken",
              maxTimeoutSeconds: 3600,
            },
          ],
          error: "Payment required",
        }),
        { status: 402 },
      );

      // 2回目の200レスポンス
      const successResponse = new Response(
        JSON.stringify({ data: "Protected content" }),
        { status: 200 },
      );

      vi.mocked(fetch)
        .mockResolvedValueOnce(paymentRequiredResponse)
        .mockResolvedValueOnce(successResponse);

      const response = await fetchWithX402("/api/test", {}, {
        tokenAddress: "0xtoken",
        tokenName: "Test Token",
        escrowAddress: "0xescrow",
        chainId: 31337,
        walletClient: mockWalletClient,
        publicClient: mockPublicClient,
      });

      expect(response.status).toBe(200);
      expect(fetch).toHaveBeenCalledTimes(2);

      // 2回目のリクエストにX-PAYMENTヘッダーが含まれていることを確認
      const secondCall = vi.mocked(fetch).mock.calls[1];
      expect(secondCall).toBeDefined();
      if (secondCall && secondCall[1]) {
        const headers = secondCall[1].headers as Headers;
        expect(headers.get("X-PAYMENT")).toBeTruthy();
      }
    });

    it("acceptsが空の場合、エラーを投げる", async () => {
      const paymentRequiredResponse = new Response(
        JSON.stringify({
          x402Version: 1,
          accepts: [],
          error: "Payment required",
        }),
        { status: 402 },
      );

      vi.mocked(fetch).mockResolvedValue(paymentRequiredResponse);

      await expect(
        fetchWithX402("/api/test", {}, {
          tokenAddress: "0xtoken",
          tokenName: "Test Token",
          escrowAddress: "0xescrow",
          chainId: 31337,
          walletClient: mockWalletClient,
          publicClient: mockPublicClient,
        }),
      ).rejects.toThrow("No payment method accepted");
    });
  });
});

