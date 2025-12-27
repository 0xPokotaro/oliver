---
id: user-profile
title: ユーザープロフィール取得
sidebar_label: ユーザープロフィール取得
---

# ユーザープロフィール取得

ユーザーのプロフィール情報（ウォレットID、各種通貨の残高、商品購入履歴）を取得します。

## エンドポイント

**HTTP Method:** `GET`  
**Endpoint:** `/api/v1/user/profile`

## リクエスト

### ヘッダー

| ヘッダー名 | 必須 | 説明 |
|-----------|------|------|
| `Authorization` | 必須 | `Bearer <JWT_TOKEN>` 形式のJWTトークン |
| `Content-Type` | 推奨 | `application/json` |

### クエリパラメータ

| パラメータ名 | 必須 | 説明 |
|------------|------|------|
| `includeHistory` | 任意 | `true`の場合、購入履歴を含める（デフォルト: `true`） |
| `historyLimit` | 任意 | 購入履歴の取得件数（デフォルト: `10`、最大: `100`） |

### リクエストボディ

なし

## レスポンス

### 200 OK

成功時のレスポンスです。

```json
{
  "userId": "user_12345",
  "walletId": "0x1234567890abcdef1234567890abcdef12345678",
  "balances": [
    {
      "currency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "currencyName": "USDC",
      "balance": "1000000000",
      "decimals": 6
    },
    {
      "currency": "0x...",
      "currencyName": "JPYC",
      "balance": "500000000000000000000",
      "decimals": 18
    }
  ],
  "purchaseHistory": [
    {
      "orderId": "ord_20251222_abc123",
      "sku": "cat-food-rc-2kg",
      "productName": "Royal Canin Indoor 2kg",
      "quantity": 1,
      "amount": "3000500",
      "currency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "status": "delivered",
      "purchasedAt": "2025-12-22T10:00:00Z"
    },
    {
      "orderId": "ord_20251220_xyz789",
      "sku": "water-2l-box",
      "productName": "Mineral Water 2L x 6",
      "quantity": 2,
      "amount": "1600500",
      "currency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "status": "shipped",
      "purchasedAt": "2025-12-20T14:30:00Z"
    }
  ]
}
```

### 401 Unauthorized

JWTトークンが無効、または認証に失敗した場合。

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

### 404 Not Found

ユーザーが存在しない場合。

```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

## データモデル

### UserInformation

ユーザー情報

```typescript
interface UserInformation {
  userId: string;              // ユーザーID
  walletId: string;            // ウォレットアドレス（0x形式）
  balances: Balance[];         // 各種通貨の残高一覧
  purchaseHistory: Purchase[]; // 商品購入履歴
}
```

### Balance

通貨残高情報

```typescript
interface Balance {
  currency: string;      // トークンコントラクトアドレス（0x形式）
  currencyName: string;  // 通貨名（例: "USDC", "JPYC"）
  balance: string;       // 残高（wei単位の文字列）
  decimals: number;      // 小数点桁数（例: 6 for USDC, 18 for ETH）
}
```

### Purchase

購入履歴情報

```typescript
interface Purchase {
  orderId: string;       // 注文ID
  sku: string;           // 商品SKU
  productName: string;   // 商品名
  quantity: number;      // 購入数量
  amount: string;        // 決済金額（wei単位の文字列）
  currency: string;      // トークンコントラクトアドレス
  status: OrderStatus;   // 注文ステータス（"processing", "shipped", "delivered", "cancelled", "failed"）
  purchasedAt: string;   // 購入日時（ISO 8601形式）
}
```

注文ステータスの詳細については、[共通リファレンス](../00-common-reference.md#orderstatus)を参照してください。
