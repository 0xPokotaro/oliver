import type {
  PaymentRequired,
  PaymentRequirements,
  PaymentPayload,
} from "@x402/core/types";
import { MineType } from "@oliver/shared/enums";
import { avalanche } from "viem/chains";
import { CartItem } from "@oliver/shared/schemas/api";
import type { ProductRepository } from "../repositories";

const X402_VERSION_2 = 2;

interface PaymentOptions {
  baseURL: string;
  merchantAddress: string;
  productRepository: ProductRepository;
  defaultCurrency: string;
}

export interface VerifyResult {
  isValid: boolean;
  payer?: string;
  invalidReason?: string;
}

export interface IPaymentManager {
  initialize(): Promise<void>;
  // 支払い要件を取得。
  getPaymentRequirements(): void;
  // 402 Payment Required エラー時に返すレスポンスを作成。
  buildPaymentRequired(items: CartItem[]): Promise<PaymentRequired>;
  // ユーザーから送られてきた署名が正しいか、金額や期限が一致するかを検証。
  verifyPayment(payload: PaymentPayload): Promise<VerifyResult>;
  // 実際にブロックチェーンへトランザクションを送り、決済を確定させる。
  settlePayment(): void;
}

export class PaymentManager implements IPaymentManager {
  private readonly baseURL: string;
  private readonly merchantAddress: string;
  private readonly maxTimeoutSeconds: number;
  private readonly productRepository: ProductRepository;
  private readonly defaultCurrency: string;

  constructor({
    baseURL,
    merchantAddress,
    productRepository,
    defaultCurrency,
  }: PaymentOptions) {
    this.baseURL = baseURL;
    this.merchantAddress = merchantAddress;
    this.maxTimeoutSeconds = 3600;
    this.productRepository = productRepository;
    this.defaultCurrency = defaultCurrency;
  }

  async initialize() {
    //
  }

  getPaymentRequirements() {
    //
  }

  async buildPaymentRequired(items: CartItem[]): Promise<PaymentRequired> {
    // 商品情報を取得
    const products = await Promise.all(
      items.map(async (item) => {
        const product = await this.productRepository.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        return { product, quantity: item.quantity };
      }),
    );

    // 合計金額を計算（priceは文字列型、wei単位）
    let totalAmount = 0n;

    for (const { product, quantity } of products) {
      // 価格 × 数量で合計を計算（priceは文字列なのでBigIntに変換）
      const itemTotal = BigInt(product.price) * BigInt(quantity);
      totalAmount += itemTotal;
    }

    // PaymentRequirementsを構築
    const accept: PaymentRequirements = {
      scheme: "exact",
      network: `eip155:${avalanche.id}`,
      amount: totalAmount.toString(),
      asset: this.defaultCurrency,
      payTo: this.merchantAddress,
      maxTimeoutSeconds: this.maxTimeoutSeconds,
      extra: {
        name: this.getCurrencyName(this.defaultCurrency),
        version: X402_VERSION_2.toString(),
      },
    };

    return {
      x402Version: X402_VERSION_2,
      error: "Payment required",
      accepts: [accept],
      resource: {
        url: `${this.baseURL}/api/payment`,
        description: "Confirm order - Payment required before shipping",
        mimeType: MineType.APPLICATION_JSON,
      },
    };
  }

  async verifyPayment(payload: PaymentPayload) {
    try {
      const result = await this.callFacilitator<VerifyResult>(
        "verify",
        payload,
      );

      return result;
    } catch (error) {
      return {
        isValid: false,
        invalidReason: "",
      };
    }
  }

  settlePayment() {}

  // ================================
  // Private methods
  // ================================

  /**
   * 通貨アドレスから通貨名を取得
   * @param currency トークンコントラクトアドレス
   * @returns 通貨名（デフォルト: "USD Coin"）
   */
  private getCurrencyName(currency: string): string {
    // 主要なUSDCアドレスのマッピング
    const currencyNameMap: Record<string, string> = {
      // Avalanche C-Chain USDC
      "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E": "USD Coin",
    };

    // 大文字小文字を区別せずに比較
    const normalizedCurrency = currency.toLowerCase();
    return (
      currencyNameMap[normalizedCurrency] ||
      currencyNameMap[currency] ||
      "USD Coin"
    );
  }

  private async callFacilitator<T>(
    endpoint: "verify" | "settle",
    payload: PaymentPayload,
  ): Promise<T> {
    return {} as T;
  }
}
