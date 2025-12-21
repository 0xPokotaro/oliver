# Facilitator API

Rust/Axumベースの署名検証・実行ノードです。

## 概要

このAPIは、x402決済プロトコルのFacilitatorとして機能します。EIP-712/2612の署名検証とオンチェーン決済の実行を行います。

## セットアップ

### 環境変数の設定

`.env`ファイルを作成し、以下の環境変数を設定してください：

```env
# Server Configuration
PORT=8403
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

### GET /health

ヘルスチェックエンドポイント

### GET /config

設定取得エンドポイント

### POST /verify

決済検証エンドポイント

### POST /settle

決済実行エンドポイント

## アーキテクチャ

- **Axum**: Webフレームワーク
- **Tokio**: 非同期ランタイム
- **chain/**: Alloyを使ったオンチェーン実行
- **verifier/**: EIP-712/2612 検証ロジック

