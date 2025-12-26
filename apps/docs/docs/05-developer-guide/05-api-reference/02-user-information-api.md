---
id: user-information-api
title: ユーザー情報API
sidebar_label: ユーザー情報API
---

# User Information API仕様書

## 概要

このドキュメントは、Oliverプロジェクトの **User Information API** の完全なインターフェース仕様を定義します。

User Information APIは、ユーザーのウォレット情報、各種通貨の残高、および商品購入履歴を取得するためのAPIです。ユーザーIDをパラメータとして渡すことで、そのユーザーの詳細情報を取得できます。

この仕様は、Rust (Axum) での実装、およびクライアントサイドの実装基準となります。

### ベースURL

ベースURLについては、[共通リファレンス](./00-common-reference.md#ベースurl)を参照してください。

---

## Integration Guidance

### API Resources and Support Channels

* 📌 [プロジェクトドキュメント](../../../)
* 💡 [Merchant API仕様](./01-api-specification.md)

### Authentication

**通常のエンドポイント:**
- `/users/:userId` は認証不要（Public）
- 本番環境では、適切な認証機構の追加を推奨

### Common response parameters

共通レスポンスパラメータについては、[共通リファレンス](./00-common-reference.md#共通レスポンスパラメータ)を参照してください。

---

## API一覧

| API名 | メソッド | エンドポイント | 説明 | 認証 |
|-------|---------|---------------|------|------|
| ユーザー情報取得 | GET | `/api/v1/users/:userId` | ユーザーIDに基づく詳細情報を取得 | なし |
| 音声コマンド実行 | POST | `/api/v1/users/:userId/voice` | 音声（WAV）を受け取り、コマンドを実行 | なし |

---

## エンドポイント詳細

### 1. ユーザー情報取得

ユーザーIDに基づいて、ウォレットID、各種通貨の残高、商品購入履歴を取得します。

**パス:** `GET` `/api/v1/users/:userId`

**リクエストヘッダー:** なし

**リクエストボディ:** なし

**クエリパラメータ:**

| パラメータ名 | 必須 | 説明 |
|------------|------|------|
| `includeHistory` | 任意 | `true`の場合、購入履歴を含める（デフォルト: `true`） |
| `historyLimit` | 任意 | 購入履歴の取得件数（デフォルト: `10`、最大: `100`） |

**パスパラメータ:**

| パラメータ名 | 必須 | 説明 |
|------------|------|------|
| `userId` | 必須 | ユーザーID（例: `user_12345`） |

**レスポンス (200 OK):**
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

**レスポンス (404 Not Found):**
ユーザーが存在しない場合。

```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

#### 使用例

**基本的なリクエスト:**
```bash
curl -X GET http://localhost:8080/api/v1/users/user_12345 \
  -H "Content-Type: application/json"
```

**購入履歴を除外したリクエスト:**
```bash
curl -X GET "http://localhost:8080/api/v1/users/user_12345?includeHistory=false" \
  -H "Content-Type: application/json"
```

**購入履歴の件数を指定したリクエスト:**
```bash
curl -X GET "http://localhost:8080/api/v1/users/user_12345?historyLimit=5" \
  -H "Content-Type: application/json"
```

**JavaScript使用例:**

```javascript
// 基本的な使用例
const response = await fetch('/api/v1/users/user_12345', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const userInfo = await response.json();
console.log(userInfo);
```

```javascript
// 購入履歴を除外する例
const response = await fetch('/api/v1/users/user_12345?includeHistory=false', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const userInfo = await response.json();
console.log(userInfo);
```

```javascript
// 購入履歴の件数を指定する例
const response = await fetch('/api/v1/users/user_12345?historyLimit=5', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

const userInfo = await response.json();
console.log(userInfo);
```

---

### 2. 音声コマンド実行

ユーザーIDに紐づく音声コマンド（WAV）を受け取り、サーバー側でコマンドを実行します。

**パス:** `POST` `/api/v1/users/:userId/voice`

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
curl -X POST http://localhost:8080/api/v1/users/user_12345/voice \
  -F "audio=@./command.wav;type=audio/wav"
```

**JavaScript（FormData）:**

```javascript
const formData = new FormData();
formData.append('audio', file); // file: WAV File object

const response = await fetch('/api/v1/users/user_12345/voice', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
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

### OrderStatus

注文ステータスの列挙型については、[共通リファレンス](./00-common-reference.md#orderstatus)を参照してください。

---

## エラーハンドリング

エラーハンドリングの詳細については、[共通リファレンス](./00-common-reference.md#エラーハンドリング)を参照してください。

このAPIで使用される主なエラーコード：
- `INVALID_PARAMETER`: リクエストパラメータが不正
- `USER_NOT_FOUND`: ユーザーIDが存在しない
- `INTERNAL_ERROR`: サーバー内部エラー

---

## セキュリティ考慮事項

### 推奨事項

1. **認証の実装**: 本番環境では、適切な認証機構（JWT、OAuth2など）の追加を強く推奨します。
2. **レート制限**: API呼び出しのレート制限を実装し、過度なリクエストを防止してください。
3. **データマスキング**: ウォレットアドレスや残高などの機密情報は、必要に応じてマスキングすることを検討してください。
4. **HTTPS使用**: 本番環境では必ずHTTPSを使用してください。

### プライバシー保護

- ユーザーの購入履歴は個人情報として扱い、適切なアクセス制御を実装してください。
- GDPRやその他のプライバシー規制に準拠するため、ユーザーデータの削除や取得制限の機能を検討してください。

---

## 参考資料

- [Merchant API仕様](./01-api-specification.md)
- [プロジェクトドキュメント](../../../)
