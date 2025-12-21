# Merchant API

Rust/Axumベースのx402リソースサーバーです。

## 概要

このAPIは、x402決済プロトコルを使用して保護されたリソースを提供します。既存のTypeScript実装と互換性のあるAPI仕様に従っています。

## セットアップ

### 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/oliver

# X402 Configuration
X402_PAY_TO=0x1234567890123456789012345678901234567890
X402_ASSET=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
X402_MAX_AMOUNT_REQUIRED=100000000000000000000
X402_NETWORK=localhost
X402_MAX_TIMEOUT_SECONDS=3600
X402_DESCRIPTION=Access to protected resource

# Facilitator API
FACILITATOR_URL=http://localhost:8403

# Server Configuration
PORT=3001
```

### ビルドと実行

```bash
# ビルド
cargo build --release

# 実行
cargo run

# 開発モード（ホットリロード）
cargo watch -x run
```

## API エンドポイント

### GET /api/x402/resource

x402決済プロトコルで保護されたリソースを取得します。

**リクエストヘッダー:**
- `X-PAYMENT`: Base64エンコードされた決済ペイロード（必須）

**レスポンス:**
- `200 OK`: 決済成功時、リソースデータと`X-PAYMENT-RESPONSE`ヘッダーを返す
- `402 Payment Required`: 決済が必要または検証失敗時

## アーキテクチャ

- **Axum**: Webフレームワーク
- **Tokio**: 非同期ランタイム
- **sqlx**: PostgreSQLデータベース接続（非同期）
- **Reqwest**: Facilitator APIとの通信
- **Serde**: JSONシリアライゼーション

## 開発

### テストの実行

```bash
# すべてのテストを実行
cargo test

# 特定のテストを実行
cargo test test_health_check

# テストを実行（出力を表示）
cargo test -- --nocapture
```

### 型定義の自動生成

TypeScript型定義を自動生成する場合：

```bash
cargo install typeshare-cli
typeshare . --lang=typescript --output-file=../../packages/types/src/generated/merchant-api.ts
```

