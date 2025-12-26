# @oliver/database

Oliverプロジェクトで使用されるデータベースパッケージです。PostgreSQLとPrismaを使用してデータモデルを管理します。

## セットアップ

### 環境変数の設定

`.env`ファイルを作成し、データベース接続文字列を設定してください。

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/oliver?schema=public"
```

### Prisma Clientの生成

```bash
pnpm prisma:gen
```

### マイグレーション

#### 開発環境

新しいマイグレーションを作成して実行：

```bash
pnpm prisma:migrate --name migration_name
```

スキーマをプッシュ（マイグレーションファイルを生成せずにDBを更新）：

```bash
pnpm prisma:push
```

#### 本番環境

マイグレーションを適用：

```bash
pnpm prisma migrate deploy
```

### データベースのリセット

**警告：このコマンドはすべてのデータを削除します。開発環境でのみ使用してください。**

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

## スキーマ構成

### User

ユーザー情報を管理します。

- `id`: UUID（プライマリキー）
- `walletAddress`: ウォレットアドレス（ユニーク）
- `name`: ユーザー名（オプション）
- `email`: メールアドレス（オプション）
- `avatar`: アバター画像URL（オプション）
- `metadata`: 追加情報（JSON）
- `payments`: 決済履歴（リレーション）

### Merchant

加盟店情報を管理します。

- `id`: UUID（プライマリキー）
- `name`: 加盟店名
- `products`: 商品一覧（リレーション）

### Product

商品情報を管理します。

- `id`: UUID（プライマリキー）
- `name`: 商品名
- `description`: 商品説明
- `price`: 価格（wei単位、BigInt）
- `currency`: トークンコントラクトアドレス
- `stockStatus`: 在庫ステータス（`in_stock` | `low_stock` | `out_of_stock`）
- `imageUrl`: 商品画像URL（オプション）
- `category`: カテゴリ（オプション）
- `attributes`: カテゴリごとの属性（JSON）
- `merchantId`: 加盟店ID（外部キー）

### PaymentHistory

決済履歴を管理します。

- `id`: UUID（プライマリキー）
- `paymentId`: x402決済ID（ユニーク）
- `payer`: 支払い者のアドレス
- `userId`: ユーザーID（オプション、外部キー）
- `recipient`: 受取人のアドレス
- `amount`: 決済金額（wei単位の文字列）
- `asset`: トークンコントラクトアドレス
- `network`: ネットワーク名
- `chainId`: チェーンID
- `status`: ステータス（`pending` | `settled` | `failed`）
- `txHash`: トランザクションハッシュ（オプション）
- `blockNumber`: ブロック番号（オプション）
- `orderId`: 注文ID（オプション）
- `productId`: 商品ID（オプション、外部キー）
- `metadata`: 追加情報（JSON）
- `settledAt`: 決済完了日時（オプション）

## 使用方法

### Prisma Clientのインポート

このパッケージからPrismaClientをインポートして、各アプリケーションで初期化します。

```typescript
// apps/web/src/lib/prisma.ts など
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

### データベース操作

```typescript
// アプリケーション内でprismaインスタンスを使用
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

### 型定義のインポート

Prisma Clientの型定義は`@oliver/database`から直接インポートできます。

```typescript
import { User, Product, PaymentHistory } from '@oliver/database';
```

## トラブルシューティング

### マイグレーションエラー

マイグレーションが失敗した場合は、以下を確認してください：

1. `DATABASE_URL`が正しく設定されているか
2. データベースサーバーが起動しているか
3. データベースユーザーに適切な権限があるか

開発環境の場合は、`pnpm prisma:reset`でデータベースをリセットできます。

### Prisma Clientが見つからない

`pnpm prisma:gen`を実行して、Prisma Clientを生成してください。

```bash
pnpm prisma:gen
```

## 参考資料

- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
