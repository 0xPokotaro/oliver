---
id: api-specification
title: API仕様書
sidebar_label: API仕様書
---

# API仕様書

## 概要

このドキュメントは、Oliverプロジェクトの **Oliver API** の完全なインターフェース仕様を定義します。

APIカテゴリについては、[共通リファレンス](./00-common-reference.md#apiカテゴリ)を参照してください。

x402は、HTTP 402ステータスコードを拡張した決済プロトコルで、保護されたリソースにアクセスする際に決済が必要であることを示し、クライアント（Agent）が自動的に決済を実行できるようにします。

この仕様は、Rust (Axum) での実装、およびクライアントサイド（Agent）の実装基準となります。

### ベースURL

ベースURLについては、[共通リファレンス](./00-common-reference.md#ベースurl)を参照してください。

---

## Integration Guidance

### API Resources and Support Channels

* 📌 [プロジェクトドキュメント](/)
* 💡 [x402ミドルウェア実装](https://github.com/0xPokotaro/oliver/blob/main/apps/web/src/lib/x402/middleware.ts)
* 💡 [x402クライアントSDK](https://github.com/0xPokotaro/oliver/blob/main/apps/web/src/lib/x402/client.ts)
* 💡 [x402型定義](https://github.com/0xPokotaro/oliver/blob/main/apps/web/src/lib/types/x402-types.ts)

### Authentication

**通常のエンドポイント:**
- `/health`, `/v1/commerce/products`, `/v1/commerce/products/:sku`, `/v1/commerce/orders/:orderId` は認証不要（Public）

**認証が必要なエンドポイント:**
- `/v1/user/profile` は `Authorization: Bearer <JWT_TOKEN>` ヘッダーによるJWT認証が必要
- `/v1/user/:userId/voice` は認証不要（本番環境では認証機構の追加を推奨）

**決済エンドポイント:**
- `/v1/commerce/products/:sku/buy` は `X-PAYMENT` ヘッダーによる署名認証が必要
- x402決済プロトコルでは、HTTPヘッダーに決済情報を含めることで認証を行います。決済ヘッダーが含まれていない場合、または決済検証に失敗した場合は402ステータスコードが返されます。

#### HTTP Headers for x402 Endpoints

x402決済プロトコルを使用するエンドポイントでは、以下のHTTPヘッダーを使用します：

| ヘッダー名 | 必須 | 説明 |
|-----------|------|------|
| `Content-Type` | 必須 | `application/json` |
| `X-PAYMENT` | 必須 | Base64エンコードされた決済ペイロード（x402決済プロトコル） |

**X-PAYMENTヘッダー**

決済情報を含むBase64エンコードされたJSONペイロードです。

**構造:**
```json
{
  "x402Version": 1,
  "scheme": "evm-permit",
  "network": "31337",
  "payload": {
    "paymentId": "0x...",
    "payer": "0x...",
    "recipient": "0x...",
    "amount": "100000000000000000000",
    "duration": 3600,
    "deadline": "1704067200",
    "nonce": "0",
    "permitSignature": {
      "v": 27,
      "r": "0x...",
      "s": "0x..."
    },
    "paymentSignature": {
      "v": 27,
      "r": "0x...",
      "s": "0x..."
    }
  }
}
```

#### Create A Request

x402決済プロトコルを使用したリクエストの作成手順：

**基本ステップ:**

1. 保護リソースにリクエストを送信（`X-PAYMENT`ヘッダーなし）
2. サーバーが402レスポンスを返す（決済要件を含む）
3. `createX402PaymentHeader()`を使用して決済ヘッダーを生成
   - EIP-2612 Permit署名を作成
   - EIP-712 Payment Intent署名を作成
   - Base64エンコードして`X-PAYMENT`ヘッダーを生成
4. `X-PAYMENT`ヘッダーを付けて再リクエスト
5. サーバーが`x402Middleware()`で検証
   - Facilitatorの`/verify`エンドポイントで署名検証
   - 金額の整合性チェック
6. 検証成功後、非同期で`/settle`を実行（Optimistic Response）
7. リソースを返す

**リクエスト例:**

* 決済ヘッダーなし（初回リクエスト）
* 決済ヘッダー付き（再リクエスト）

```bash
# 初回リクエスト（決済ヘッダーなし）
POST /api/v1/commerce/products/cat-food-rc-2kg/buy HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "agentAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "quantity": 1
}

# 402 Payment Required が返される
```

```bash
# 決済ヘッダー付きの再リクエスト
POST /api/v1/commerce/products/cat-food-rc-2kg/buy HTTP/1.1
Host: localhost:8080
Content-Type: application/json
X-PAYMENT: <base64-encoded-payment-payload>

{
  "agentAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "quantity": 1
}
```

**JavaScript SDK使用例:**

```javascript
import { fetchWithX402 } from '@/lib/x402/client';

const response = await fetchWithX402(
  '/api/v1/commerce/products/cat-food-rc-2kg/buy',
  {
    method: 'POST',
    body: JSON.stringify({
      agentAddress: '0x1234567890abcdef1234567890abcdef12345678',
      quantity: 1
    })
  },
  {
    tokenAddress: '0x...',
    tokenName: 'Qualia USD',
    escrowAddress: '0x...',
    chainId: 8453,
    walletClient,
    publicClient,
  }
);
```

**402レスポンスの構造**

決済が必要な場合、サーバーは以下の構造で402レスポンスを返します。

```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "evm-permit",
      "network": "base",
      "maxAmountRequired": "3000500",
      "resource": "/api/v1/commerce/products/cat-food-rc-2kg/buy",
      "description": "Purchase cat food",
      "payTo": "0x1234567890123456789012345678901234567890",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "maxTimeoutSeconds": 3600,
      "chainId": 8453,
      "currency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "nonce": "550e8400-e29b-41d4-a716-446655440000",
      "deadline": 1715000000,
      "metadata": {
        "subtotal": "3000000",
        "shippingFee": "500",
        "shippingAddressMasked": "Tokyo, JP (***-0001)"
      }
    }
  ],
  "error": "Payment required"
}
```

**レスポンスヘッダー:**
```
WWW-Authenticate: X402 token="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", price="3000500"
```

**X-PAYMENT-RESPONSEヘッダー**

決済が成功した場合、サーバーは`X-PAYMENT-RESPONSE`ヘッダーに決済情報を含めます。

```json
{
  "paymentId": "0x...",
  "payer": "0x...",
  "amount": "3000500"
}
```

**WWW-Authenticateヘッダー**

402レスポンスでは、`WWW-Authenticate`ヘッダーも含まれます。

```
WWW-Authenticate: X402 token="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", price="3000500"
```

### Common response parameters

共通レスポンスパラメータ（`error`, `code`）については、[共通リファレンス](./00-common-reference.md#共通レスポンスパラメータ)を参照してください。

以下は、Oliver API固有のレスポンスパラメータです：

| パラメータ | 型 | 説明 | 使用エンドポイント |
|----------|-----|------|------------------|
| `status` | string | ステータス（成功時: `"success"`, `"ok"`） | `/health`, `/v1/commerce/products/:sku/buy` |
| `payment` | Object | 決済情報（x402決済プロトコル使用時） | `/v1/commerce/products/:sku/buy` |
| `x402Version` | number | x402プロトコルバージョン（402エラー時） | `/v1/commerce/products/:sku/buy` (402時) |
| `accepts` | Array | 受け入れ可能な決済方法（402エラー時） | `/v1/commerce/products/:sku/buy` (402時) |

**成功レスポンス例（決済エンドポイント）:**

```json
{
  "status": "success",
  "orderId": "ord_20251222_abc123",
  "message": "Payment accepted. Processing shipment.",
  "estimatedArrival": "2025-12-23",
  "payment": {
    "paymentId": "0x...",
    "payer": "0x...",
    "amount": "3000500"
  }
}
```

**成功レスポンス例（商品一覧）:**

```json
[
  {
    "sku": "cat-food-rc-2kg",
    "name": "Royal Canin Indoor 2kg",
    "price": "3000000",
    "currency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "stockStatus": "in_stock",
    "imageUrl": "https://assets.oliver.dev/products/rc-2kg.png"
  }
]
```

**エラーレスポンス例:**

```json
{
  "x402Version": 1,
  "accepts": [...],
  "error": "Payment required"
}
```

または

```json
{
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

---

## API一覧

### システム

| API名 | メソッド | エンドポイント | 説明 | 認証 |
|-------|---------|---------------|------|------|
| ヘルスチェック | GET | `/api/v1/health` | サーバーの稼働状況を確認 | なし |

### ユーザーカテゴリ (`/v1/user`)

| API名 | メソッド | エンドポイント | 説明 | 認証 |
|-------|---------|---------------|------|------|
| ユーザープロフィール取得 | GET | `/api/v1/user/profile` | ユーザーのプロフィール情報を取得 | JWT必須 |
| 音声コマンド実行 | POST | `/api/v1/user/:userId/voice` | 音声（WAV）を受け取り、コマンドを実行 | なし |

### 決済カテゴリ (`/v1/commerce`)

| API名 | メソッド | エンドポイント | 説明 | 認証 |
|-------|---------|---------------|------|------|
| 商品一覧取得 | GET | `/api/v1/commerce/products` | 販売中の商品リストを取得 | なし |
| 商品詳細取得 | GET | `/api/v1/commerce/products/:sku` | SKUに基づく商品詳細情報を取得 | なし |
| 購入リクエスト | POST | `/api/v1/commerce/products/:sku/buy` | 商品を購入（x402決済プロトコル） | x402決済必須 |
| 注文ステータス確認 | GET | `/api/v1/commerce/orders/:orderId` | 注文のステータスを確認 | なし |

### AIカテゴリ (`/v1/agent`)

現在、AIカテゴリのエンドポイントは実装されていません。将来の拡張予定です。

---

## エンドポイント詳細

### 1. ヘルスチェック

サーバーの稼働状況を確認します。

**パス:** `GET` `/api/v1/health`

**リクエストヘッダー:** なし

**リクエストボディ:** なし

**クエリパラメータ:** なし

**レスポンス (200 OK):**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "chainConnection": true,
  "timestamp": 1700000000
}
```

---

### 2. 商品一覧取得

販売中の商品リストを取得します。

**パス:** `GET` `/api/v1/commerce/products`

**リクエストヘッダー:** なし

**リクエストボディ:** なし

**クエリパラメータ:**

| パラメータ名 | 必須 | 説明 |
|------------|------|------|
| `category` | 任意 | 商品カテゴリ（例: `pet_food`, `daily`） |

**レスポンス (200 OK):**
```json
[
  {
    "sku": "cat-food-rc-2kg",
    "name": "Royal Canin Indoor 2kg",
    "price": "3000000",
    "currency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "stockStatus": "in_stock",
    "imageUrl": "https://assets.oliver.dev/products/rc-2kg.png"
  },
  {
    "sku": "water-2l-box",
    "name": "Mineral Water 2L x 6",
    "price": "800000",
    "currency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "stockStatus": "in_stock",
    "imageUrl": "https://assets.oliver.dev/products/water-2l-box.png"
  }
]
```

**stockStatus の値:**
- `in_stock`: 在庫あり
- `low_stock`: 在庫少
- `out_of_stock`: 在庫切れ

---

### 3. 商品詳細取得

SKUに基づく詳細情報を取得します。

**パス:** `GET` `/api/v1/commerce/products/:sku`

**リクエストヘッダー:** なし

**リクエストボディ:** なし

**クエリパラメータ:** なし

**パスパラメータ:**

| パラメータ名 | 必須 | 説明 |
|------------|------|------|
| `sku` | 必須 | 商品SKU（例: `cat-food-rc-2kg`） |

**レスポンス (200 OK):**
```json
{
  "sku": "cat-food-rc-2kg",
  "name": "Royal Canin Indoor 2kg",
  "description": "室内飼いの猫用フード。消化率が高く糞便の臭いを軽減します。",
  "price": "3000000",
  "currency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "attributes": {
    "weight": "2kg",
    "brand": "Royal Canin",
    "expiry": "2025-12-31"
  },
  "allowedTokens": [
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "0x..."
  ]
}
```

**レスポンス (404 Not Found):**
商品が存在しない場合。

```json
{
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

---

### 4. 購入リクエスト (x402決済エンドポイント)

最も重要なエンドポイントです。見積もり（402）と決済実行（200）を同一URLで処理します。

**パス:** `POST` `/api/v1/commerce/products/:sku/buy`

**パスパラメータ:**

| パラメータ名 | 必須 | 説明 |
|------------|------|------|
| `sku` | 必須 | 商品SKU |

#### シナリオA: 見積もり要求 (Challenge)

エージェントは署名を持たず、自身のID（アドレス）のみを送信します。

**リクエストヘッダー:**

| ヘッダー名 | 必須 | 説明 |
|-----------|------|------|
| `Content-Type` | 必須 | `application/json` |

**リクエストボディ:**
```json
{
  "agentAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "quantity": 1
}
```

**レスポンス (402 Payment Required):**

```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "evm-permit",
      "network": "base",
      "maxAmountRequired": "3000500",
      "resource": "/api/v1/commerce/products/cat-food-rc-2kg/buy",
      "description": "Purchase cat food",
      "payTo": "0x1234567890123456789012345678901234567890",
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "maxTimeoutSeconds": 3600,
      "chainId": 8453,
      "currency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "nonce": "550e8400-e29b-41d4-a716-446655440000",
      "deadline": 1715000000,
      "metadata": {
        "subtotal": "3000000",
        "shippingFee": "500",
        "shippingAddressMasked": "Tokyo, JP (***-0001)"
      }
    }
  ],
  "error": "Payment required"
}
```

**レスポンスヘッダー:**
```
WWW-Authenticate: X402 token="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", price="3000500"
```

#### シナリオB: 決済実行 (Settlement)

エージェントは402レスポンスの内容に署名し、ヘッダーに付与して再送します。

**リクエストヘッダー:**

| ヘッダー名 | 必須 | 説明 |
|-----------|------|------|
| `Content-Type` | 必須 | `application/json` |
| `X-PAYMENT` | 必須 | Base64エンコードされた決済ペイロード（x402決済プロトコル） |

**リクエストボディ:**
```json
{
  "agentAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "quantity": 1
}
```

**レスポンス (200 OK):**
```json
{
  "status": "success",
  "orderId": "ord_20251222_abc123",
  "message": "Payment accepted. Processing shipment.",
  "estimatedArrival": "2025-12-23",
  "payment": {
    "paymentId": "0x...",
    "payer": "0x...",
    "amount": "3000500"
  }
}
```

**レスポンスヘッダー:**
```
X-PAYMENT-RESPONSE: {"paymentId":"0x...","payer":"0x...","amount":"3000500"}
```

**レスポンス (403 Forbidden):**
署名が無効、または残高不足。

```json
{
  "error": "Invalid payment intent signature",
  "code": "SIGNATURE_INVALID"
}
```

または

```json
{
  "error": "Insufficient funds",
  "code": "INSUFFICIENT_FUNDS"
}
```

**レスポンス (409 Conflict):**
すでに処理済みのNonce（リプレイ攻撃）。

```json
{
  "error": "Nonce already used",
  "code": "NONCE_USED"
}
```

#### シナリオC: 住所未登録エラー

**レスポンス (400 Bad Request):**
```json
{
  "error": "Shipping address not found",
  "code": "ADDRESS_MISSING",
  "action": "Please register your address on the Oliver Dashboard."
}
```

#### 使用例

**見積もり要求:**
```bash
curl -X POST http://localhost:8080/api/v1/commerce/products/cat-food-rc-2kg/buy \
  -H "Content-Type: application/json" \
  -d '{
    "agentAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "quantity": 1
  }'
# 402 Payment Required が返される
```

**決済実行:**
```bash
curl -X POST http://localhost:8080/api/v1/commerce/products/cat-food-rc-2kg/buy \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <base64-encoded-payment-payload>" \
  -d '{
    "agentAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "quantity": 1
  }'
```

```javascript
import { fetchWithX402 } from '@/lib/x402/client';

const response = await fetchWithX402(
  '/api/v1/commerce/products/cat-food-rc-2kg/buy',
  {
    method: 'POST',
    body: JSON.stringify({
      agentAddress: '0x1234567890abcdef1234567890abcdef12345678',
      quantity: 1
    })
  },
  {
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    tokenName: 'USDC',
    escrowAddress: '0x...',
    chainId: 8453,
    walletClient,
    publicClient,
  }
);
```

---

### 5. 注文ステータス確認

注文のステータスを確認します。

**パス:** `GET` `/api/v1/commerce/orders/:orderId`

**リクエストヘッダー:** なし

**リクエストボディ:** なし

**クエリパラメータ:** なし

**パスパラメータ:**

| パラメータ名 | 必須 | 説明 |
|------------|------|------|
| `orderId` | 必須 | 注文ID（例: `ord_20251222_abc123`） |

**レスポンス (200 OK):**
```json
{
  "orderId": "ord_20251222_abc123",
  "sku": "cat-food-rc-2kg",
  "quantity": 1,
  "amount": "3000500",
  "currency": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "status": "processing",
  "trackingNumber": null,
  "createdAt": "2025-12-22T10:00:00Z"
}
```

**status の値については、[共通リファレンス - OrderStatus](./00-common-reference.md#orderstatus)を参照してください。**

**レスポンス (404 Not Found):**
注文が存在しない場合。

```json
{
  "error": "Order not found",
  "code": "ORDER_NOT_FOUND"
}
```

---

### 6. ユーザープロフィール取得

ユーザーのプロフィール情報（ウォレットID、各種通貨の残高、商品購入履歴）を取得します。

---

### 7. 音声コマンド実行

ユーザーIDに紐づく音声コマンド（WAV）を受け取り、サーバー側でコマンドを実行します。

**パス:** `POST` `/api/v1/user/:userId/voice`

**リクエストヘッダー:**

| ヘッダー名 | 必須 | 説明 |
|-----------|------|------|
| `Content-Type` | 必須 | `multipart/form-data` |

**リクエストボディ:** あり（`multipart/form-data`）

**multipart form fields:**

| フィールド名 | 必須 | 型 | 説明 |
|------------|------|----|------|
| `audio` | 必須 | file | WAV音声ファイル（推奨: `audio/wav`） |

**パスパラメータ:**

| パラメータ名 | 必須 | 説明 |
|------------|------|------|
| `userId` | 必須 | ユーザーID（例: `user_12345`） |

**レスポンス (200 OK):**

```json
{
  "success": true
}
```

**レスポンス (400 Bad Request):**
音声ファイルが不正、またはWAV形式ではない場合。

```json
{
  "success": false,
  "error": "Invalid audio format: only WAV is supported",
  "code": "INVALID_AUDIO_FORMAT"
}
```

**レスポンス (500 Internal Server Error):**
音声処理・コマンド実行に失敗した場合。

```json
{
  "success": false,
  "error": "Audio processing failed",
  "code": "AUDIO_PROCESSING_ERROR"
}
```

#### 使用例

**curl（multipart/form-data）:**

```bash
curl -X POST http://localhost:8080/api/v1/user/user_12345/voice \
  -F "audio=@./command.wav;type=audio/wav"
```

**JavaScript（FormData）:**

```javascript
const formData = new FormData();
formData.append('audio', file); // file: WAV File object

const response = await fetch('/api/v1/user/user_12345/voice', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
```

---

## データモデル

### PaymentRequiredResponse

402レスポンスの構造

```typescript
interface PaymentRequiredResponse {
  x402Version: number;
  accepts: PaymentAccept[];
  error: string;
}

interface PaymentAccept {
  scheme: string;              // 決済スキーム（例: "evm-permit"）
  network: string;             // ネットワーク名
  maxAmountRequired: string;    // 最大必要額（wei単位の文字列）
  resource: string;             // リソースパス
  description: string;          // リソースの説明
  payTo: string;                // 受取人アドレス
  asset: string;                // トークンコントラクトアドレス
  maxTimeoutSeconds: number;     // タイムアウト（秒）
  // 拡張フィールド（新仕様から統合）
  chainId?: number;             // チェーンID（例: 8453 for Base）
  currency?: string;             // 通貨トークンアドレス
  nonce?: string;                // リクエスト固有のNonce（UUID形式もサポート）
  deadline?: number;             // 決済期限（Unix timestamp）
  metadata?: PaymentMetadata;   // 決済メタデータ
}

interface PaymentMetadata {
  subtotal?: string;            // 小計（wei単位の文字列）
  shippingFee?: string;         // 送料（wei単位の文字列）
  shippingAddressMasked?: string; // マスクされた配送先住所（確認用）
}
```

### PaymentInfo

決済情報

```typescript
interface PaymentInfo {
  paymentId: string;      // 決済ID
  payer: string;          // 支払人アドレス
  amount: string;         // 決済金額（wei単位の文字列）
  txHash?: string;        // トランザクションハッシュ（settle完了時のみ）
}
```

### PaymentPayload

決済ペイロード（X-PAYMENTヘッダーの内容）

```typescript
interface PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: PaymentPayloadData;
}

interface PaymentPayloadData {
  paymentId: string;
  payer: string;
  recipient: string;
  amount: string;              // wei単位の文字列
  duration: number;            // 秒
  deadline: string;             // Unix timestamp（文字列）
  nonce: string;
  permitSignature: Signature;  // EIP-2612 Permit署名
  paymentSignature: Signature; // EIP-712 Payment Intent署名
}

interface Signature {
  v: number;
  r: string;
  s: string;
}
```

### Product

商品一覧の商品情報

```typescript
interface Product {
  sku: string;                  // 商品SKU
  name: string;                 // 商品名
  price: string;                // 価格（wei単位の文字列、6桁小数点想定）
  currency: string;             // トークンコントラクトアドレス
  stockStatus: StockStatus;     // 在庫ステータス
  imageUrl: string;             // 商品画像URL
}
```

### ProductDetail

商品詳細情報

```typescript
interface ProductDetail {
  sku: string;                  // 商品SKU
  name: string;                 // 商品名
  description: string;          // 商品説明
  price: string;                // 価格（wei単位の文字列）
  currency: string;              // トークンコントラクトアドレス
  attributes: Record<string, string>; // 商品属性（重量、ブランドなど）
  allowedTokens: string[];       // 支払い可能なトークン一覧
}
```

### BuyRequest

購入リクエストボディ

```typescript
interface BuyRequest {
  agentAddress: string;          // Agentのアドレス（必須）
  quantity: number;             // 購入数量
}
```

### Order

注文情報

```typescript
interface Order {
  orderId: string;              // 注文ID
  sku: string;                  // 商品SKU
  quantity: number;             // 数量
  amount: string;               // 決済金額（wei単位の文字列）
  currency: string;             // トークンコントラクトアドレス
  status: OrderStatus;           // 注文ステータス
  trackingNumber: string | null; // 追跡番号（発送後に値が入る）
  createdAt: string;            // 作成日時（ISO 8601形式）
}
```

### OrderStatus

注文ステータスの列挙型については、[共通リファレンス](./00-common-reference.md#orderstatus)を参照してください。

### StockStatus

在庫ステータスの列挙型

```typescript
enum StockStatus {
  InStock = "in_stock",         // 在庫あり
  LowStock = "low_stock",       // 在庫少
  OutOfStock = "out_of_stock"   // 在庫切れ
}
```

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

---

## エラーハンドリング

共通エラーレスポンス形式、ステータスコード一覧、基本的なエラーコードについては、[共通リファレンス](./00-common-reference.md#エラーハンドリング)を参照してください。

### Oliver API固有のエラーコード

x402決済プロトコルおよびOliver APIに固有のエラーコードです。

| HTTP Status | Code | Description | Action |
|------------|------|-------------|--------|
| 400 | `ADDRESS_MISSING` | 配送先住所が未登録 | ダッシュボードで登録を促す |
| 400 | `INVALID_AUDIO_FORMAT` | 音声ファイル形式が不正 | WAV形式のファイルを送信する |
| 402 | `PAYMENT_REQUIRED` | 正常な決済フロー | 署名して再送する |
| 403 | `SIGNATURE_INVALID` | 署名検証失敗 | 秘密鍵や署名ロジックを確認 |
| 403 | `INSUFFICIENT_FUNDS` | Agentの残高不足 | ウォレットへチャージを促す |
| 404 | `OUT_OF_STOCK` | 在庫切れ | 別のショップを探す |
| 409 | `NONCE_USED` | 処理済みのリクエスト | 新しいNonceでやり直す |
| 500 | `AUDIO_PROCESSING_ERROR` | 音声処理失敗 | 音声ファイルを確認して再送する |

### エラーメッセージ詳細

基本的なエラーメッセージ（`INVALID_PARAMETER`, `USER_NOT_FOUND`, `PRODUCT_NOT_FOUND`, `ORDER_NOT_FOUND`, `INTERNAL_ERROR`）については、[共通リファレンス](./00-common-reference.md#エラーメッセージ詳細)を参照してください。

以下は、Oliver API固有のエラーメッセージです。

#### 400 Bad Request

**ADDRESS_MISSING**

配送先住所が未登録の場合に返されます。

**レスポンス例:**
```json
{
  "error": "Shipping address not found",
  "code": "ADDRESS_MISSING",
  "action": "Please register your address on the Oliver Dashboard."
}
```

#### 402 Payment Required

以下の場合に402エラーが返されます：

- `X-PAYMENT`ヘッダーが含まれていない
- 決済ヘッダーの署名検証に失敗した
- 決済金額が不足している
- Facilitatorへの接続エラー

**レスポンス例:**
```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "evm-permit",
      "network": "base",
      "maxAmountRequired": "3000500",
      "resource": "/api/v1/commerce/products/cat-food-rc-2kg/buy",
      "description": "Purchase cat food",
      "payTo": "0x...",
      "asset": "0x...",
      "maxTimeoutSeconds": 3600,
      "chainId": 8453,
      "currency": "0x...",
      "nonce": "550e8400-e29b-41d4-a716-446655440000",
      "deadline": 1715000000,
      "metadata": {
        "subtotal": "3000000",
        "shippingFee": "500",
        "shippingAddressMasked": "Tokyo, JP (***-0001)"
      }
    }
  ],
  "error": "Payment required"
}
```

または

```json
{
  "x402Version": 1,
  "accepts": [...],
  "error": "Invalid payment intent signature"
}
```

#### 403 Forbidden

**SIGNATURE_INVALID**

署名検証に失敗した場合に返されます。

**レスポンス例:**
```json
{
  "error": "Invalid payment intent signature",
  "code": "SIGNATURE_INVALID"
}
```

**INSUFFICIENT_FUNDS**

Agentの残高が不足している場合に返されます。

**レスポンス例:**
```json
{
  "error": "Insufficient funds",
  "code": "INSUFFICIENT_FUNDS"
}
```

#### 404 Not Found

**OUT_OF_STOCK**

在庫切れの場合に返されます。

**レスポンス例:**
```json
{
  "error": "Product out of stock",
  "code": "OUT_OF_STOCK"
}
```

#### 409 Conflict

**NONCE_USED**

すでに処理済みのNonceが使用された場合（リプレイ攻撃）に返されます。

**レスポンス例:**
```json
{
  "error": "Nonce already used",
  "code": "NONCE_USED"
}
```

#### 500 Internal Server Error

**AUDIO_PROCESSING_ERROR**

音声処理またはコマンド実行に失敗した場合に返されます。

**レスポンス例:**
```json
{
  "success": false,
  "error": "Audio processing failed",
  "code": "AUDIO_PROCESSING_ERROR"
}
```

---

## セキュリティ考慮事項

### 推奨事項

1. **認証の実装**: 本番環境では、特にユーザーカテゴリのエンドポイント（`/v1/user/:userId`, `/v1/user/:userId/voice`）に適切な認証機構（JWT、OAuth2など）の追加を強く推奨します。
2. **レート制限**: API呼び出しのレート制限を実装し、過度なリクエストを防止してください。特に音声処理エンドポイントは処理コストが高いため、厳格な制限を設けることを推奨します。
3. **データマスキング**: ウォレットアドレスや残高などの機密情報は、必要に応じてマスキングすることを検討してください。
4. **HTTPS使用**: 本番環境では必ずHTTPSを使用してください。

### プライバシー保護

- ユーザーの購入履歴は個人情報として扱い、適切なアクセス制御を実装してください。
- GDPRやその他のプライバシー規制に準拠するため、ユーザーデータの削除や取得制限の機能を検討してください。
- 音声データは機密性が高いため、処理後は速やかに削除し、長期保存を避けてください。

---

## 環境変数

x402ミドルウェアは以下の環境変数を使用します：

| 変数名 | 説明 | 必須 | デフォルト値 |
|--------|------|------|------------|
| `X402_PAY_TO` | 受取人アドレス | 必須 | - |
| `X402_ASSET` | トークンコントラクトアドレス | 必須 | - |
| `X402_MAX_AMOUNT_REQUIRED` | 最大必要額（wei） | 必須 | - |
| `X402_NETWORK` | ネットワーク名 | 任意 | `localhost` |
| `X402_MAX_TIMEOUT_SECONDS` | タイムアウト（秒） | 任意 | `3600` |
| `FACILITATOR_URL` | Facilitator URL | 任意 | `http://localhost:8403` |
| `X402_DESCRIPTION` | リソースの説明 | 任意 | `Access to protected resource` |

---

## 参考資料

- [x402ミドルウェア実装](https://github.com/0xPokotaro/oliver/blob/main/apps/web/src/lib/x402/middleware.ts)
- [x402クライアントSDK](https://github.com/0xPokotaro/oliver/blob/main/apps/web/src/lib/x402/client.ts)
- [x402型定義](https://github.com/0xPokotaro/oliver/blob/main/apps/web/src/lib/types/x402-types.ts)

