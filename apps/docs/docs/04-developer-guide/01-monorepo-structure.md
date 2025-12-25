# モノレポ構成

これまでの議論（Rustバックエンド、ラズパイのキオスクUI、Webダッシュボード）を統合した、**最終的なディレクトリ構成**を提案します。

**TypeScript (Next.js)** と **Rust (Axum)** が混在する「ハイブリッド・モノレポ」となります。

## 📂 Syntropy Monorepo Structure

```text
.
├── apps/                                   # アプリケーション層 (Deployable)
│   ├── device-ui/                          # [Next.js] ★ラズパイ用キオスクアプリ (The Node)
│   │   ├── src/app/page.tsx                # アンビエント待機画面 & 決済アニメーション
│   │   ├── src/lib/voice/                  # 音声認識/合成ロジック (Web Audio API)
│   │   └── package.json                    # @syntropy/device-ui
│   │
│   ├── dashboard/                          # [Next.js] ★設定用Webダッシュボード
│   │   ├── src/app/settings/               # ウォレット接続、ポリシー設定画面
│   │   ├── src/app/history/                # 決済履歴閲覧
│   │   └── package.json                    # @syntropy/dashboard
│   │
│   ├── api/                                 # [Rust/Axum] ★x402リソースサーバー
│   │   ├── src/main.rs                     # APIエントリーポイント
│   │   ├── src/handlers/                   # 402レスポンス、署名検証ロジック
│   │   └── Cargo.toml                      # (name: api)
│   │
│   └── docs/                               # [Docusaurus] ドキュメント
│
├── packages/                               # 共有ライブラリ層 (Shared Logic)
│   ├── x402-sdk/                           # [TS] Agent用SDK (fetch wrapper, EIP-712署名)
│   │   ├── src/client.ts
│   │   └── package.json                    # @syntropy/x402-sdk
│   │
│   ├── types/                              # [TS] ★重要: Rustと共有する型定義
│   │   ├── src/generated/                  # typeshare等でRustから自動生成された型
│   │   └── package.json                    # @syntropy/types
│   │
│   ├── ui/                                 # [TS] 共通UIコンポーネント
│   │   ├── src/components/Orb.tsx          # AIの「光る球体」ビジュアライザー
│   │   ├── src/styles/                     # Tailwind設定・共通カラー
│   │   └── package.json                    # @syntropy/ui
│   │
│   ├── contracts/                          # [Solidity] スマートコントラクト
│   │   ├── contracts/Escrow.sol
│   │   └── package.json                    # @syntropy/contracts
│   │
│   └── config/                             # [Config] TSConfig, ESLint
│
├── Cargo.toml                              # Rustワークスペース定義（apps/api を指定）
├── pnpm-workspace.yaml                     # pnpmワークスペース定義
├── package.json                            # ルートスクリプト定義
└── rust-toolchain.toml                     # Rustバージョン固定
```

---

## 🔑 この構成の重要ポイント

### 1. `apps/device-ui` (The Node)
ラズパイで動くアプリです。
*   **役割:** ユーザーとの対話（音声・画面）と、L1/L2エージェントとしての思考（APIコール）を担当します。
*   **特徴:**
    *   キオスクモードで全画面表示されます。
    *   `packages/x402-sdk` を使用して、`apps/api` と通信します。
    *   `packages/ui` の `Orb` コンポーネント（光る球体）を表示します。

### 2. `apps/dashboard` (Web Admin)
PCやスマホからアクセスする管理画面です。
*   **役割:** ラズパイではできない「複雑な設定」を行います。
*   **特徴:**
    *   `packages/contracts` の型定義を使って、オンチェーン（Smart Account）の設定を行います。
    *   Supabase等のDBを参照し、決済履歴を表示します。

### 3. `packages/types` (Rust ↔ TS の架け橋)
ここが開発効率の肝です。
*   **課題:** Rustのバックエンドと、TSのフロントエンドで型定義（`PaymentPayload`など）がズレるとバグになります。
*   **解決:** Rustコード（`apps/api/src/types.rs`）に `#[typeshare]` 属性を付け、自動生成ツール（typeshare）を使って、この `packages/types` ディレクトリにTypeScriptの型定義ファイルを書き出します。
*   **結果:** フロントエンドは常にバックエンドと同期した正しい型を使えます。

### 4. Rust ワークスペース
pnpmワークスペースの中に、Rustのワークスペースが同居する形です。
ルートの `Cargo.toml` でワークスペースを定義し、`apps/api` をメンバーとして指定しています。
Rustプロジェクトは `cargo` コマンドで直接管理し、TypeScriptプロジェクトは `pnpm` で管理します。

**注意:** `facilitator-api` は外部サービスとして扱われ、`FACILITATOR_URL` 環境変数で参照されます。

```json
// root package.json example
{
  "scripts": {
    "web:dev": "pnpm --filter web dev",
    "docs:start": "pnpm --filter docs start",
    "build:web": "pnpm --filter web build",
    "build:rust": "cargo build --workspace --release",
    "dev:rust": "cargo watch --workspace -x run",
    "types:sync": "typeshare . --lang=typescript --output-file=packages/types/src/generated/index.ts"
  }
}
```

**注意:** Rustプロジェクト（`api`）は `cargo` コマンドで直接実行するか、別ターミナルで起動します。`pnpm` スクリプトに統合する場合は、Rustプロジェクトに `package.json` を追加してラッパースクリプトを定義する方法もあります。`facilitator-api` は外部サービスとして扱われ、このモノレポには含まれません。

---

## 🛠 開発時のワークフロー

1.  **RustでAPI仕様を変更する**
    *   `apps/api/src/types.rs` を修正。
2.  **型を同期する（型生成パイプライン導入時）**
    *   `pnpm types:sync` を実行 → `packages/types` が更新される。
3.  **フロントエンドを修正する**
    *   `apps/web` や `apps/device-ui` で新しい型を使って実装。
4.  **動作確認**
    *   **TypeScriptアプリ:** `pnpm web:dev` や `pnpm docs:start` で起動
    *   **Rust API:** 別ターミナルで `cargo run --bin api` を実行
    *   **一括起動（オプション）:** 複数ターミナルを使用するか、プロセス管理ツール（`concurrently`など）を利用

この構成であれば、**「ラズパイのUI体験」と「Rustバックエンドの堅牢性」**を、一つのリポジトリで効率よく管理・開発できます。

