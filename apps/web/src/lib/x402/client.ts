/**
 * X402クライアント側SDK
 */

import { encodePacked, keccak256, parseUnits, toHex } from "viem";
import { signTypedData } from "viem/actions";
import type {
  CreateX402PaymentHeaderOptions,
  CreateX402PaymentHeaderResult,
} from "./client-types";
import type { PaymentPayload, Signature } from "../types/x402-types";

/**
 * ERC20Permitの標準ABI（EIP-2612）
 */
const ERC20_PERMIT_ABI = [
  {
    name: "DOMAIN_SEPARATOR",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    name: "nonces",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/**
 * EIP-2612 Permit署名を作成
 */
async function createEIP2612PermitSignature(
  tokenAddress: string,
  tokenName: string,
  chainId: number,
  owner: `0x${string}`,
  spender: `0x${string}`,
  value: bigint,
  deadline: bigint,
  publicClient: any,
  walletClient: any,
): Promise<Signature> {
  // DOMAIN_SEPARATORを取得
  const domainSeparator = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_PERMIT_ABI,
    functionName: "DOMAIN_SEPARATOR",
  });

  // nonceを取得
  const nonce = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_PERMIT_ABI,
    functionName: "nonces",
    args: [owner],
  });

  // EIP-2612のPermit型データ構造
  const domain = {
    name: tokenName,
    version: "1",
    chainId,
    verifyingContract: tokenAddress as `0x${string}`,
  };

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  // 署名を実行
  const account = walletClient.account;
  if (!account) {
    throw new Error("No account found in wallet client");
  }
  const signature = await signTypedData(walletClient, {
    account,
    domain,
    types,
    primaryType: "Permit",
    message,
  });

  // v, r, sに分割
  const r = `0x${signature.slice(2, 66)}`;
  const s = `0x${signature.slice(66, 130)}`;
  const v = parseInt(signature.slice(130, 132), 16);

  return { v, r, s };
}

/**
 * EIP-712 Payment Intent署名を作成
 * 注意: エスクローコントラクトの実際の型定義に合わせて調整が必要
 */
async function createEIP712PaymentIntentSignature(
  escrowAddress: string,
  chainId: number,
  paymentId: `0x${string}`,
  payer: `0x${string}`,
  recipient: `0x${string}`,
  amount: bigint,
  duration: bigint,
  deadline: bigint,
  nonce: bigint,
  walletClient: any,
): Promise<Signature> {
  // エスクローコントラクトのEIP-712型定義
  // 注意: 実際のコントラクトの型定義に合わせて調整が必要
  const domain = {
    name: "Escrow",
    version: "1",
    chainId,
    verifyingContract: escrowAddress as `0x${string}`,
  };

  const types = {
    PaymentIntent: [
      { name: "paymentId", type: "bytes32" },
      { name: "payer", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "duration", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
  };

  const message = {
    paymentId,
    payer,
    recipient,
    amount,
    duration,
    deadline,
    nonce,
  };

  // 署名を実行
  const account = walletClient.account;
  if (!account) {
    throw new Error("No account found in wallet client");
  }
  const signature = await signTypedData(walletClient, {
    account,
    domain,
    types,
    primaryType: "PaymentIntent",
    message,
  });

  // v, r, sに分割
  const r = `0x${signature.slice(2, 66)}`;
  const s = `0x${signature.slice(66, 130)}`;
  const v = parseInt(signature.slice(130, 132), 16);

  return { v, r, s };
}

/**
 * paymentIdを生成（keccak256ハッシュ）
 */
function generatePaymentId(
  payer: `0x${string}`,
  recipient: `0x${string}`,
  amount: bigint,
  deadline: bigint,
  nonce: bigint,
): `0x${string}` {
  const encoded = encodePacked(
    ["address", "address", "uint256", "uint256", "uint256"],
    [payer, recipient, amount, deadline, nonce],
  );
  return keccak256(encoded);
}

/**
 * X402決済ヘッダーを作成
 */
export async function createX402PaymentHeader(
  options: CreateX402PaymentHeaderOptions,
): Promise<CreateX402PaymentHeaderResult> {
  const {
    tokenAddress,
    tokenName,
    escrowAddress,
    chainId,
    recipient,
    amountUSD,
    durationSeconds,
    walletClient,
    publicClient,
  } = options;

  // ウォレットアドレスを取得
  const [account] = await walletClient.getAddresses();
  if (!account) {
    throw new Error("No account found in wallet");
  }

  // 金額をweiに変換（18桁の小数点を想定）
  const amount = parseUnits(amountUSD.toString(), 18);

  // 期限を計算
  const now = BigInt(Math.floor(Date.now() / 1000));
  const deadline = now + BigInt(durationSeconds);

  // nonceを取得（簡易実装: タイムスタンプベース）
  // 実際の実装では、エスクローコントラクトから取得する必要がある場合がある
  const nonce = BigInt(0);

  // paymentIdを生成
  const paymentId = generatePaymentId(
    account,
    recipient as `0x${string}`,
    amount,
    deadline,
    nonce,
  );

  // EIP-2612 Permit署名を作成
  const permitSignature = await createEIP2612PermitSignature(
    tokenAddress,
    tokenName,
    chainId,
    account,
    escrowAddress as `0x${string}`,
    amount,
    deadline,
    publicClient,
    walletClient,
  );

  // EIP-712 Payment Intent署名を作成
  const paymentSignature = await createEIP712PaymentIntentSignature(
    escrowAddress,
    chainId,
    paymentId,
    account,
    recipient as `0x${string}`,
    amount,
    BigInt(durationSeconds),
    deadline,
    nonce,
    walletClient,
  );

  // PaymentPayloadを作成
  const payload: PaymentPayload = {
    x402Version: 1,
    scheme: "evm-permit",
    network: chainId.toString(),
    payload: {
      paymentId,
      payer: account,
      recipient,
      amount: amount.toString(),
      duration: durationSeconds,
      deadline: deadline.toString(),
      nonce: nonce.toString(),
      permitSignature,
      paymentSignature,
    },
  };

  // Base64エンコード
  const jsonString = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonString, "utf-8").toString("base64");

  return {
    paymentHeader: base64Payload,
    paymentId,
  };
}

/**
 * 自動決済付きフェッチ関数
 * 402レスポンスを検出し、自動的に決済ヘッダーを生成して再リクエスト
 */
export async function fetchWithX402(
  url: string,
  init: RequestInit = {},
  options: {
    tokenAddress: string;
    tokenName: string;
    escrowAddress: string;
    chainId: number;
    walletClient: any;
    publicClient: any;
  },
): Promise<Response> {
  // 最初のリクエストを送信
  let response = await fetch(url, init);

  // 402レスポンスの場合、決済を処理
  if (response.status === 402) {
    const paymentRequired = (await response.json()) as {
      x402Version: number;
      accepts: Array<{
        scheme: string;
        network: string;
        maxAmountRequired: string;
        resource: string;
        description: string;
        payTo: string;
        asset: string;
        maxTimeoutSeconds: number;
      }>;
      error: string;
    };

    // 最初のacceptsエントリを使用（通常は1つ）
    const accept = paymentRequired.accepts[0];
    if (!accept) {
      throw new Error("No payment method accepted");
    }

    // 決済金額をweiに変換
    const amountWei = BigInt(accept.maxAmountRequired);
    const amountUSD = Number(amountWei) / 1e18; // 18桁の小数点を想定

    // 決済ヘッダーを作成
    const { paymentHeader } = await createX402PaymentHeader({
      tokenAddress: accept.asset,
      tokenName: options.tokenName,
      escrowAddress: options.escrowAddress,
      chainId: options.chainId,
      recipient: accept.payTo,
      amountUSD,
      durationSeconds: accept.maxTimeoutSeconds,
      walletClient: options.walletClient,
      publicClient: options.publicClient,
    });

    // 決済ヘッダーを付けて再リクエスト
    const headers = new Headers(init.headers);
    headers.set("X-PAYMENT", paymentHeader);

    response = await fetch(url, {
      ...init,
      headers,
    });
  }

  return response;
}

