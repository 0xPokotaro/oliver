---
id: user-creation
title: ユーザー新規作成
sidebar_label: ユーザー新規作成
---

# ユーザー新規作成

ユーザーを新規作成します。

## エンドポイント

**HTTP Method:** `POST`  
**Endpoint:** `/api/v1/user`

## リクエスト

### ヘッダー

| ヘッダー名 | 必須 | 説明 |
|-----------|------|------|
| `Content-Type` | 必須 | `application/json` |

### リクエストボディ

| パラメータ | 型 | 必須 | 説明 |
|-----------|----|------|------|
| `walletAddress` | string | 必須 | ウォレットアドレス（`0x`形式） |

**リクエスト例:**

```json
{
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

## レスポンス

### 200 OK

作成成功時のレスポンスです。

```json
{
  "userId": "user_12345",
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

### 400 Bad Request

リクエストパラメータが不正な場合（例: `walletAddress` が不正な形式、未指定）。

```json
{
  "error": "Invalid parameter: walletAddress is required",
  "code": "INVALID_PARAMETER"
}
```

### 409 Conflict

同じ `walletAddress` が既に存在する場合。

```json
{
  "error": "Wallet address already exists",
  "code": "WALLET_ALREADY_EXISTS"
}
```

## データモデル

### CreateUserRequest

ユーザー作成リクエスト

```typescript
interface CreateUserRequest {
  walletAddress: string; // ウォレットアドレス（0x形式）
}
```

### CreateUserResponse

ユーザー作成レスポンス

```typescript
interface CreateUserResponse {
  userId: string;        // ユーザーID
  walletAddress: string; // ウォレットアドレス（0x形式）
}
```

エラーレスポンスの共通形式については、[共通リファレンス](../00-common-reference.md#エラーハンドリング)を参照してください。
