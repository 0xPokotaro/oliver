# @oliver/database

Oliverプロジェクトで使用されるデータベースパッケージです。PostgreSQLとPrismaを使用してデータモデルを管理します。

## 📋 目次

- [セットアップ](#セットアップ)
- [開発環境](#開発環境)
- [本番環境へのデプロイ](#本番環境へのデプロイ)
- [使用方法](#使用方法)
- [トラブルシューティング](#トラブルシューティング)
- [参考資料](#参考資料)

## セットアップ

### 1. Supabase CLIのインストール

```bash
# macOS
brew install supabase/tap/supabase

# または npm経由
npm install -g supabase
```

### 2. Supabaseプロジェクトへのリンク

```bash
# プロジェクトディレクトリに移動
cd packages/database

# Supabaseにログイン（ブラウザが開きます）
supabase login

# 既存のSupabaseプロジェクトにリンク
supabase link --project-ref your-project-ref-id
```

> **プロジェクト参照IDの確認方法**: Supabase Dashboard > Settings > General > Reference ID

### 3. 環境変数の設定

`.env`ファイルを作成し、データベース接続文字列を設定してください。

```bash
# 開発環境（ローカルSupabase）
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# 本番環境（Supabase Cloud）
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require"
```

### 4. Prisma Clientの生成

```bash
pnpm prisma:gen
```

## 開発環境

### ローカルデータベースの起動

```bash
# Supabaseローカル環境を起動
pnpm db:start

# 停止
pnpm db:stop
```

### マイグレーション

#### 新しいマイグレーションを作成

```bash
pnpm prisma:migrate --name migration_name
```

#### スキーマを直接プッシュ（開発用）

マイグレーションファイルを生成せずにDBを更新：

```bash
pnpm prisma:push
```

### データベースのリセット

**⚠️ 警告：このコマンドはすべてのデータを削除します。開発環境でのみ使用してください。**

```bash
pnpm prisma:reset
```

このコマンドは以下を実行します：
1. すべてのマイグレーションをロールバック
2. データベースを再作成
3. すべてのマイグレーションを適用
4. シードデータを投入（`prisma/seed.ts`）

### シードデータの投入

```bash
pnpm prisma:seed
```

## 本番環境へのデプロイ

### 接続方法の違い

Supabaseには2種類の接続方法があります：

| 接続方法 | ポート | 用途 | 説明 |
|:---------|:------|:-----|:-----|
| **直接接続** | `5432` | マイグレーション、長時間トランザクション | セッションを維持する必要がある操作に使用 |
| **接続プーラー** | `6543` | 通常のクエリ、アプリケーション | 接続を効率的に再利用。サーバーレス環境に適している |

### デプロイ手順

#### 1. 環境変数の設定

```bash
# 本番環境のDATABASE_URLを設定（直接接続を使用）
export DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?sslmode=require"
```

> **重要**: マイグレーション実行時は**直接接続（ポート5432）**を使用してください。接続プーラー（ポート6543）では固まる可能性があります。

> **注意**: Supabase Dashboardから接続文字列を取得する際、`unrestricted`パラメータが含まれることがあります（例: `?sslmode=require&unrestricted=true`）。これは通常問題ありませんが、不要な場合は削除しても構いません。

#### 2. マイグレーション状態の確認

```bash
cd packages/database
pnpm prisma migrate status
```

#### 3. マイグレーションの適用

```bash
pnpm prisma migrate deploy
```

#### 4. デプロイの確認

```bash
# マイグレーション状態を再確認
pnpm prisma migrate status

# データベース接続をテスト
pnpm prisma db execute --stdin <<< "SELECT 1;"
```

### アプリケーション実行時の接続

アプリケーション実行時は**接続プーラー（ポート6543）**を使用することを推奨します：

```bash
# 接続プーラー経由の接続文字列
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
```

### Supabase CLIを使ったデプロイ

```bash
# 1. プロジェクトにリンク（初回のみ）
cd packages/database
supabase link --project-ref your-project-ref-id

# 2. マイグレーション状態の確認
supabase migration list

# 3. リモートとローカルの差分確認
supabase db diff

# 4. バックアップの取得（推奨）
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
```

## 使用方法

### Prisma Clientのインポート

このパッケージからPrismaClientをインポートして、各アプリケーションで初期化します。

```typescript
// apps/api2/src/lib/prisma.ts など
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@oliver/database";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || "";
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();
export { prisma };
```

### 型定義のインポート

Prisma Clientの型定義は`@oliver/database`から直接インポートできます。

```typescript
import { User, Product, PaymentHistory } from '@oliver/database';
```

### データベース操作の例

```typescript
import { prisma } from '@/lib/prisma';

// ユーザーの取得
const user = await prisma.user.findUnique({
  where: { walletAddress: '0x...' },
});

// 商品の一覧取得
const products = await prisma.product.findMany({
  where: { stockStatus: 'in_stock' },
  include: { merchant: true },
});
```

## トラブルシューティング

### マイグレーションが固まる

**原因**: 接続プーラー（ポート6543）を使用している可能性があります。

**解決方法**: 直接接続（ポート5432）を使用してください。

```bash
# ❌ 接続プーラー（固まる可能性あり）
DATABASE_URL="...pooler.supabase.com:6543/..."

# ✅ 直接接続（推奨）
DATABASE_URL="...pooler.supabase.com:5432/..."
```

### マイグレーションエラー

```bash
# マイグレーション状態を確認
pnpm prisma migrate status

# 問題のあるマイグレーションを特定
# 必要に応じて手動でSQLを実行
```

### 接続エラー

1. **接続文字列を確認**
   - Supabase Dashboard > Settings > Database > Connection string から確認

2. **SSL設定を確認**
   - 本番環境では `?sslmode=require` が必要

3. **ファイアウォール設定を確認**
   - Supabase Dashboard > Settings > Database > Network restrictions

### Prisma Clientが見つからない

```bash
# Prisma Clientを再生成
pnpm prisma:gen
```

### 接続文字列に`unrestricted`パラメータが含まれる

**原因**: Supabase Dashboardから接続文字列を取得する際、`unrestricted`パラメータが自動的に追加されることがあります。

**説明**: `unrestricted`パラメータは、Supabaseの接続制限を緩和するためのパラメータです。通常は問題ありませんが、不要な場合は削除しても構いません。

```bash
# 例: unrestrictedが含まれる接続文字列
DATABASE_URL="postgresql://...?sslmode=require&unrestricted=true"

# 削除しても問題ありません
DATABASE_URL="postgresql://...?sslmode=require"
```

> **注意**: `unrestricted`パラメータは、Supabaseの接続プーラーやネットワーク制限の設定によって自動的に追加される場合があります。マイグレーションや通常のクエリには影響しません。

## 参考資料

- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [Supabase CLIドキュメント](https://supabase.com/docs/guides/cli)
- [Supabase接続プーラー](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)