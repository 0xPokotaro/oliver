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

### コードカバレッジの確認

コードカバレッジを確認するには、`cargo-tarpaulin`を使用します。

**インストール:**

```bash
cargo install cargo-tarpaulin
```

**カバレッジの実行:**

```bash
# カバレッジを測定（HTMLレポート付き）
cargo tarpaulin --out Html --output-dir ./coverage

# カバレッジを測定（ターミナルに出力）
cargo tarpaulin

# カバレッジを測定（XMLレポート出力、CI/CD用）
cargo tarpaulin --out Xml

# 特定のパッケージのみ測定
cargo tarpaulin --package merchant-api

# テストをスキップしてカバレッジのみ確認
cargo tarpaulin --skip-clean

# 閾値を設定（80%未満で失敗）
cargo tarpaulin --fail-under 80
```

**HTMLレポートの確認:**

```bash
# カバレッジレポートを開く（macOS）
open coverage/tarpaulin-report.html

# カバレッジレポートを開く（Linux）
xdg-open coverage/tarpaulin-report.html
```

**注意事項:**

- `cargo-tarpaulin`はLinux/macOS/WSLで動作します
- WindowsではWSLまたはDockerコンテナ内での実行を推奨
- カバレッジ測定には追加のビルド時間がかかります

### 型定義の自動生成

Rustの型定義からTypeScript型定義を自動生成するには、`typeshare`を使用します。

**インストール:**

```bash
cargo install typeshare-cli
```

**型生成の実行:**

ルートディレクトリから実行：

```bash
pnpm types:sync
```

または、`apps/api`ディレクトリから直接実行：

```bash
cd apps/api
typeshare . --lang=typescript --output-file=../../packages/types/src/generated/api.ts
```

**生成されるファイル:**
- `packages/types/src/generated/api.ts`

**注意事項:**
- `#[typeshare]`属性が付与された型のみが生成されます
- `src/models/mod.rs`の`Product`と`StockStatus`が生成対象です

