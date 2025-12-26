---
id: common-reference
title: 共通リファレンス
sidebar_label: 共通リファレンス
---

# 共通リファレンス

このドキュメントは、Oliverプロジェクトの全APIで共通して使用される仕様を定義します。

---

## ベースURL

**PoC環境:**
```
http://localhost:8080/api/v1
```

**本番環境:**
```
https://api.merchant.oliver.dev/v1
```

---

## 共通レスポンスパラメータ

APIレスポンスはエンドポイントによって異なりますが、以下のパラメータが共通して使用されます：

| パラメータ | 型 | 説明 | 使用場面 |
|----------|-----|------|---------|
| `error` | string | エラーメッセージ（エラー時） | 全エンドポイント（エラー時） |
| `code` | string | エラーコード（エラー時） | 全エンドポイント（エラー時） |

---

## エラーハンドリング

### 共通エラーレスポンス形式

エラーが発生した場合、以下の形式でエラーレスポンスが返されます。

```json
{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE"
}
```

一部のエラーでは、追加情報が含まれる場合があります：

```json
{
  "error": "Shipping address not found",
  "code": "ADDRESS_MISSING",
  "action": "Please register your address on the Oliver Dashboard."
}
```

### ステータスコード一覧

| ステータスコード | 説明 | 使用例 |
|----------------|------|--------|
| 200 | 成功 | リクエストが正常に処理された |
| 400 | バリデーションエラー | リクエストパラメータが不正 |
| 402 | 決済が必要 | 保護リソースにアクセスする際、決済ヘッダーがない、または検証に失敗した（x402決済プロトコル） |
| 403 | 認証・認可エラー | 署名検証失敗、または残高不足 |
| 404 | リソースが見つからない | 商品、注文、ユーザーなどが存在しない |
| 409 | 競合エラー | すでに処理済みのNonce（リプレイ攻撃） |
| 500 | サーバーエラー | データベースエラーなど、サーバー側のエラーが発生した |

### 共通エラーコード

クライアントが適切にハンドリングすべき独自エラーコードです。

| HTTP Status | Code | Description | Action |
|------------|------|-------------|--------|
| 400 | `INVALID_PARAMETER` | リクエストパラメータが不正 | パラメータを確認して再送 |
| 404 | `USER_NOT_FOUND` | ユーザーIDが存在しない | ユーザーIDを確認 |
| 404 | `PRODUCT_NOT_FOUND` | SKU間違い | 商品カタログを再確認 |
| 404 | `ORDER_NOT_FOUND` | 注文IDが存在しない | 注文IDを確認 |
| 500 | `INTERNAL_ERROR` | サーバー内部エラー | リトライまたは管理者へ連絡 |

### エラーメッセージ詳細

#### 400 Bad Request

**INVALID_PARAMETER**

リクエストパラメータが不正な場合に返されます。

**レスポンス例:**
```json
{
  "error": "Invalid parameter: historyLimit must be between 1 and 100",
  "code": "INVALID_PARAMETER"
}
```

#### 404 Not Found

**USER_NOT_FOUND**

ユーザーが存在しない場合に返されます。

**レスポンス例:**
```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

**PRODUCT_NOT_FOUND**

商品が存在しない場合に返されます。

**レスポンス例:**
```json
{
  "error": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}
```

**ORDER_NOT_FOUND**

注文が存在しない場合に返されます。

**レスポンス例:**
```json
{
  "error": "Order not found",
  "code": "ORDER_NOT_FOUND"
}
```

#### 500 Internal Server Error

サーバー側のエラーが発生した場合に返されます。

**レスポンス例:**
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

---

## 共通データモデル

### OrderStatus

注文ステータスの列挙型

```typescript
enum OrderStatus {
  Processing = "processing",    // 決済OK、発送準備中
  Shipped = "shipped",          // 発送済み
  Delivered = "delivered",      // 到着済み
  Cancelled = "cancelled",      // 在庫切れ等で返金
  Failed = "failed"             // 決済失敗
}
```

**status の値:**
- `processing`: 決済OK、発送準備中
- `shipped`: 発送済み
- `delivered`: 到着済み
- `cancelled`: 在庫切れ等で返金
- `failed`: 決済失敗
