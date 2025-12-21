/**
 * X402クライアントSDKの使用例
 * 
 * このファイルは使用例を示すためのものです。
 * 実際のプロジェクトでは、このファイルを削除または適切な場所に移動してください。
 */

import { createX402PaymentHeader, fetchWithX402 } from "./client";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { localhost } from "viem/chains";

// ============================================
// 例1: 決済ヘッダーを手動で作成する
// ============================================

async function example1_ManualPaymentHeader() {
  // ウォレットクライアントの作成
  const account = privateKeyToAccount("0x..."); // 実際の秘密鍵に置き換える
  const walletClient = createWalletClient({
    account,
    chain: localhost,
    transport: http(),
  });

  // パブリッククライアントの作成
  const publicClient = createPublicClient({
    chain: localhost,
    transport: http(),
  });

  // 決済ヘッダーを作成
  const { paymentHeader, paymentId } = await createX402PaymentHeader({
    tokenAddress: "0x...", // トークンコントラクトアドレス
    tokenName: "Qualia USD",
    escrowAddress: "0x...", // エスクローコントラクトアドレス
    chainId: 31337,
    recipient: "0x...", // 受取人アドレス
    amountUSD: 100, // 100 QUSD
    durationSeconds: 3600, // 1時間
    walletClient,
    publicClient,
  });

  // 決済ヘッダーを使用してリクエストを送信
  const response = await fetch("/api/x402/resource", {
    headers: {
      "X-PAYMENT": paymentHeader,
    },
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Protected resource:", data);
  }
}

// ============================================
// 例2: 自動決済付きフェッチを使用する
// ============================================

async function example2_AutomaticPayment() {
  // ウォレットクライアントの作成
  const account = privateKeyToAccount("0x..."); // 実際の秘密鍵に置き換える
  const walletClient = createWalletClient({
    account,
    chain: localhost,
    transport: http(),
  });

  // パブリッククライアントの作成
  const publicClient = createPublicClient({
    chain: localhost,
    transport: http(),
  });

  // 自動決済付きフェッチ
  // 402レスポンスが返ってきた場合、自動的に決済ヘッダーを生成して再リクエスト
  const response = await fetchWithX402(
    "/api/x402/resource",
    { method: "GET" },
    {
      tokenAddress: "0x...", // トークンコントラクトアドレス
      tokenName: "Qualia USD",
      escrowAddress: "0x...", // エスクローコントラクトアドレス
      chainId: 31337,
      walletClient,
      publicClient,
    },
  );

  if (response.ok) {
    const data = await response.json();
    console.log("Protected resource:", data);
  } else {
    console.error("Failed to access resource:", response.status);
  }
}

// ============================================
// 例3: Reactコンポーネントでの使用
// ============================================

/*
import { useState } from "react";
import { useWalletClient, usePublicClient } from "wagmi";
import { fetchWithX402 } from "@/lib/x402/client";

function ProtectedResourceComponent() {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProtectedResource = async () => {
    if (!walletClient || !publicClient) {
      console.error("Wallet not connected");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithX402(
        "/api/x402/resource",
        { method: "GET" },
        {
          tokenAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS!,
          tokenName: "Qualia USD",
          escrowAddress: process.env.NEXT_PUBLIC_ESCROW_ADDRESS!,
          chainId: 31337,
          walletClient,
          publicClient,
        },
      );

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error("Failed to fetch resource:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={fetchProtectedResource} disabled={loading}>
        {loading ? "Loading..." : "Fetch Protected Resource"}
      </button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
*/

// ============================================
// 例4: エラーハンドリング
// ============================================

async function example4_ErrorHandling() {
  try {
    const response = await fetchWithX402(
      "/api/x402/resource",
      { method: "GET" },
      {
        tokenAddress: "0x...",
        tokenName: "Qualia USD",
        escrowAddress: "0x...",
        chainId: 31337,
        walletClient: {} as any, // 実際のウォレットクライアントに置き換える
        publicClient: {} as any, // 実際のパブリッククライアントに置き換える
      },
    );

    if (!response.ok) {
      if (response.status === 402) {
        const errorData = await response.json();
        console.error("Payment required:", errorData);
        // ユーザーに決済が必要であることを通知
      } else {
        console.error("Request failed:", response.status);
      }
      return;
    }

    const data = await response.json();
    console.log("Success:", data);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("No account found")) {
        console.error("Please connect your wallet");
      } else if (error.message.includes("No payment method accepted")) {
        console.error("Payment method not supported");
      } else {
        console.error("Unexpected error:", error.message);
      }
    }
  }
}

