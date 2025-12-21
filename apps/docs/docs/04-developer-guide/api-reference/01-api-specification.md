# x402 API仕様書

## 概要

このドキュメントは、Oliverプロジェクトで実装されている **「x402決済プロトコル」** のAPI仕様を定義します。

x402は、HTTP 402ステータスコードを拡張した決済プロトコルで、保護されたリソースにアクセスする際に決済が必要であることを示し、クライアントが自動的に決済を実行できるようにします。

### ベースURL

```
http://localhost:3000/api
```

開発環境では上記のURLが使用されます。本番環境では適切なドメインに置き換えてください。

---

## Integration Guidance

### API Resources and Support Channels

* 📌 [プロジェクトドキュメント](../../../)
* 💡 [x402ミドルウェア実装](../../../../apps/web/src/lib/x402/middleware.ts)
* 💡 [x402クライアントSDK](../../../../apps/web/src/lib/x402/client.ts)
* 💡 [x402型定義](../../../../apps/web/src/lib/types/x402-types.ts)

### Authentication

x402決済プロトコルでは、HTTPヘッダーに決済情報を含めることで認証を行います。決済ヘッダーが含まれていない場合、または決済検証に失敗した場合は402ステータスコードが返されます。

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
GET /api/x402/resource HTTP/1.1
Host: localhost:3000
Content-Type: application/json

# 402 Payment Required が返される
```

```bash
# 決済ヘッダー付きの再リクエスト
GET /api/x402/resource HTTP/1.1
Host: localhost:3000
Content-Type: application/json
X-PAYMENT: <base64-encoded-payment-payload>
```

**JavaScript SDK使用例:**

```javascript
import { fetchWithX402 } from '@/lib/x402/client';

const response = await fetchWithX402(
  '/api/x402/resource',
  { method: 'GET' },
  {
    tokenAddress: '0x...',
    tokenName: 'Qualia USD',
    escrowAddress: '0x...',
    chainId: 31337,
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
      "network": "localhost",
      "maxAmountRequired": "100000000000000000000",
      "resource": "/api/x402/resource",
      "description": "Access to protected resource",
      "payTo": "0x1234567890123456789012345678901234567890",
      "asset": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "maxTimeoutSeconds": 3600
    }
  ],
  "error": "Payment required"
}
```

**X-PAYMENT-RESPONSEヘッダー**

決済が成功した場合、サーバーは`X-PAYMENT-RESPONSE`ヘッダーに決済情報を含めます。

```json
{
  "paymentId": "0x...",
  "payer": "0x...",
  "amount": "100000000000000000000"
}
```

### Common response parameters

すべてのAPIレスポンスは以下の共通パラメータを含みます：

| パラメータ | 型 | 説明 |
|----------|-----|------|
| `data` | Object | ビジネスデータの結果（成功時） |
| `payment` | Object | 決済情報（x402決済プロトコル使用時） |
| `x402Version` | number | x402プロトコルバージョン（402エラー時） |
| `accepts` | Array | 受け入れ可能な決済方法（402エラー時） |
| `error` | string | エラーメッセージ（エラー時） |

**成功レスポンス例:**

```json
{
  "data": "Protected content",
  "payment": {
    "paymentId": "0x...",
    "payer": "0x...",
    "amount": "100000000000000000000"
  }
}
```

**エラーレスポンス例:**

```json
{
  "x402Version": 1,
  "accepts": [...],
  "error": "Payment required"
}
```

---

## API一覧

| API名 | メソッド | エンドポイント | 説明 | 認証 |
|-------|---------|---------------|------|------|
| x402 Payment Gateway API | GET | `/api/x402/resource` | x402決済プロトコルで保護されたリソースを取得 | x402決済必須 |

---

## エンドポイント詳細

### x402 Payment Gateway API

x402決済プロトコルを使用して保護されたリソースを取得します。<br />
決済ヘッダーが含まれていない場合、または決済検証に失敗した場合は402ステータスコードが返されます。

#### リクエスト

**パス:** `GET` `/api/x402/resource`

**リクエストヘッダー:**

| ヘッダー名 | 必須 | 説明 |
|-----------|------|------|
| `Content-Type` | 必須 | `application/json` |
| `X-PAYMENT` | 必須 | Base64エンコードされた決済ペイロード（x402決済プロトコル） |

**リクエストボディ:** なし

**クエリパラメータ:** なし

#### レスポンス

**成功時 (200 OK)**

**レスポンスボディ:**
```json
{
  "data": "Protected content",
  "payment": {
    "paymentId": "0x...",
    "payer": "0x...",
    "amount": "100000000000000000000"
  }
}
```

**レスポンスヘッダー:**
```
X-PAYMENT-RESPONSE: {"paymentId":"0x...","payer":"0x...","amount":"100000000000000000000"}
```

**決済が必要な場合 (402 Payment Required)**

```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "evm-permit",
      "network": "localhost",
      "maxAmountRequired": "100000000000000000000",
      "resource": "/api/x402/resource",
      "description": "Access to protected resource",
      "payTo": "0x...",
      "asset": "0x...",
      "maxTimeoutSeconds": 3600
    }
  ],
  "error": "Payment required"
}
```

#### 使用例

**決済ヘッダーなしの場合:**
```bash
curl -X GET http://localhost:3000/api/x402/resource
# 402 Payment Required が返される
```

**決済ヘッダー付きの場合:**
```bash
curl -X GET http://localhost:3000/api/x402/resource \
  -H "X-PAYMENT: <base64-encoded-payment-payload>"
```

```javascript
import { fetchWithX402 } from '@/lib/x402/client';

const response = await fetchWithX402(
  '/api/x402/resource',
  { method: 'GET' },
  {
    tokenAddress: '0x...',
    tokenName: 'Qualia USD',
    escrowAddress: '0x...',
    chainId: 31337,
    walletClient,
    publicClient,
  }
);
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

---

## エラーハンドリング

### 共通エラーレスポンス形式

エラーが発生した場合、以下の形式でエラーレスポンスが返されます。

```json
{
  "error": "エラーメッセージ"
}
```

### ステータスコード一覧

| ステータスコード | 説明 | 使用例 |
|----------------|------|--------|
| 200 | 成功 | リクエストが正常に処理された |
| 402 | 決済が必要 | 保護リソースにアクセスする際、決済ヘッダーがない、または検証に失敗した |
| 500 | サーバーエラー | データベースエラーなど、サーバー側のエラーが発生した |

### エラーメッセージ

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
  "accepts": [...],
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

#### 500 Internal Server Error

サーバー側のエラーが発生した場合に返されます。Facilitatorへの接続エラーなど、x402ミドルウェアの内部エラーが発生した場合に使用されます。

**レスポンス例:**
```json
{
  "error": "Internal server error"
}
```

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

- [x402ミドルウェア実装](../../../../apps/web/src/lib/x402/middleware.ts)
- [x402クライアントSDK](../../../../apps/web/src/lib/x402/client.ts)
- [x402型定義](../../../../apps/web/src/lib/types/x402-types.ts)
