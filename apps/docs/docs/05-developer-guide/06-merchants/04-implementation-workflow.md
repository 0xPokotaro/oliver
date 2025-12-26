---
id: implementation-workflow
title: 実装ワークフロー
sidebar_label: 実装ワークフロー
---

# api実装ワークフロー

このドキュメントでは、apiに新しいAPIエンドポイントを実装する際の、PrismaスキーマとRust実装、フロントエンドを同期させる手順を説明します。

## 概要

apiは、Rust（Axum）で実装されたバックエンドAPIと、TypeScript（Next.js）で実装されたフロントエンドが、Prismaスキーマを共有する構成になっています。

型定義の同期を保つため、以下の順序で実装を進めます：

```
1. Prismaスキーマ修正
   ↓
2. マイグレーション実行（DB構造変更）
   ↓
3. Prisma Client生成（フロントエンド用型定義）
   ↓
4. Rust側でAPI型定義（typeshare対応）
   ↓
5. typeshareでTypeScript型生成
   ↓
6. Rust API実装（DB接続）
   ↓
7. フロントエンド修正（生成された型を使用）
```

---

## 詳細な実装手順

### Step 1: Prismaスキーマ修正

まず、`packages/database/prisma/schema.prisma`を修正して、API仕様に必要なフィールドを追加します。

**例：商品一覧取得APIの場合**

```prisma
model Product {
  id          String   @id @default(uuid())
  sku         String   @unique  // 追加：商品SKU
  name        String
  description String
  price       Int
  currency    String   @default("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913")  // 追加：トークンアドレス
  stockStatus String   @default("in_stock")  // 追加：在庫ステータス
  imageUrl    String?  // 追加：商品画像URL
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("products")
}
```

**注意点：**
- API仕様書（`01-api-specification.md`）に記載されているフィールド名と型を確認
- `stockStatus`は`"in_stock" | "low_stock" | "out_of_stock"`のいずれか
- `price`はwei単位の数値として保存（APIでは文字列として返す）

---

### Step 2: マイグレーション実行

データベースの構造を変更します。

```bash
cd packages/database
pnpm prisma:migrate --name add_product_fields
```

**開発環境の場合：**
```bash
# 開発中は db push も使用可能（マイグレーションファイルを生成しない）
pnpm prisma:push
```

**本番環境の場合：**
```bash
# 本番環境では migrate deploy を使用
pnpm prisma migrate deploy
```

**DBリセット（開発環境のみ）：**
```bash
# マイグレーションをリセットしてシードデータを投入
pnpm prisma:reset
```

---

### Step 3: Prisma Client生成

フロントエンド側の型定義を更新します。

```bash
cd packages/database
pnpm prisma:gen
```

これにより、`node_modules/.prisma/client`にTypeScript型定義が生成されます。

---

### Step 4: Rust側でAPI型定義

`apps/api/src/types.rs`に、APIレスポンス用の型定義を追加します。

**typeshare属性を付与：**

```rust
use serde::{Deserialize, Serialize};
use typeshare::typeshare;

/// 在庫ステータス
#[typeshare]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum StockStatus {
    #[serde(rename = "in_stock")]
    InStock,
    #[serde(rename = "low_stock")]
    LowStock,
    #[serde(rename = "out_of_stock")]
    OutOfStock,
}

/// 商品情報（APIレスポンス用）
#[typeshare]
#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub sku: String,
    pub name: String,
    pub price: String,  // wei単位の文字列
    pub currency: String,  // トークンコントラクトアドレス
    #[serde(rename = "stockStatus")]
    pub stock_status: StockStatus,
    #[serde(rename = "imageUrl")]
    pub image_url: String,
}
```

**注意点：**
- `#[typeshare]`属性を付与することで、TypeScript型定義を自動生成できます
- JSONフィールド名は`#[serde(rename = "...")]`で指定（API仕様に合わせる）
- `price`は文字列型（wei単位の大きな数値のため）

---

### Step 5: typeshareで型生成

Rustの型定義からTypeScript型定義を自動生成します。

**Cargo.tomlにtypeshareを追加（まだの場合）：**

```toml
[dependencies]
typeshare = "1.0"
# ... 既存の依存関係
```

**型生成コマンドを実行：**

```bash
# ルートディレクトリで
typeshare . --lang=typescript --output-file=packages/types/src/generated/api.ts
```

または、`package.json`にスクリプトを追加している場合：

```bash
pnpm types:sync
```

**生成されるファイル：**
- `packages/types/src/generated/api.ts`（または指定したパス）

---

### Step 6: Rust API実装

Rust側でAPIエンドポイントを実装します。

**ハンドラーの作成：**

`apps/api/src/handlers/products.rs`（新規作成）：

```rust
use crate::types::{Product, StockStatus};
use axum::{extract::Query, Json};
use serde::Deserialize;

/// 商品一覧取得のクエリパラメータ
#[derive(Debug, Deserialize)]
pub struct GetProductsQuery {
    pub category: Option<String>,
}

/// GET /api/v1/products ハンドラー
pub async fn get_products(
    Query(query): Query<GetProductsQuery>,
) -> Json<Vec<Product>> {
    // TODO: データベースから商品を取得
    // 現時点ではモックデータを返す
    let products = vec![
        Product {
            sku: "cat-food-rc-2kg".to_string(),
            name: "Royal Canin Indoor 2kg".to_string(),
            price: "3000000".to_string(),
            currency: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".to_string(),
            stock_status: StockStatus::InStock,
            image_url: "https://assets.oliver.dev/products/rc-2kg.png".to_string(),
        },
    ];
    
    Json(products)
}
```

**ルーティングの追加：**

`apps/api/src/main.rs`：

```rust
let app = Router::new()
    .route("/api/v1/health", get(handlers::health::get_health))
    .route("/api/v1/products", get(handlers::products::get_products))  // 追加
    .route("/api/x402/resource", get(handlers::resource::get_resource))
    .with_state(x402_config);
```

**データベース接続：**

将来的にPostgreSQLに接続する場合、`sqlx`や`diesel`などのORMを使用します。

```toml
# Cargo.toml
[dependencies]
sqlx = { version = "0.7", features = ["runtime-tokio-native-tls", "postgres"] }
```

---

### Step 7: フロントエンド修正

生成された型定義を使用して、フロントエンド側を実装します。

**型定義のインポート：**

```typescript
// 生成された型定義を使用
import { Product, StockStatus } from '@/lib/types/generated/merchant-api';
// または
import { Product, StockStatus } from '@oliver/types/generated/api';
```

**Prisma型からAPI型への変換：**

Prisma Clientの型とAPI型は別物なので、必要に応じて変換関数を作成します。

```typescript
import { Product as PrismaProduct } from '@oliver/database';
import { Product, StockStatus } from '@/lib/types/generated/merchant-api';

function prismaToApiProduct(prisma: PrismaProduct): Product {
  // stockStatusの変換
  const stockStatusMap: Record<string, StockStatus> = {
    'in_stock': StockStatus.InStock,
    'low_stock': StockStatus.LowStock,
    'out_of_stock': StockStatus.OutOfStock,
  };

  return {
    sku: prisma.sku,
    name: prisma.name,
    price: prisma.price.toString(),  // Int → String (wei単位)
    currency: prisma.currency,
    stockStatus: stockStatusMap[prisma.stockStatus] || StockStatus.OutOfStock,
    imageUrl: prisma.imageUrl || '',
  };
}
```

**API呼び出し：**

```typescript
// apps/web/src/app/api/products/route.ts
import { prisma } from '@oliver/database';
import { prismaToApiProduct } from '@/lib/utils/product-mapper';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const prismaProducts = await prisma.product.findMany({
    where: category ? { category } : undefined,
  });

  const products = prismaProducts.map(prismaToApiProduct);
  
  return Response.json(products);
}
```

---

## 型定義の同期について

### Prisma型とAPI型の違い

- **Prisma型**: データベースの構造をそのまま反映（`Int`, `DateTime`など）
- **API型**: API仕様に合わせた形式（`String`（wei単位）、Unix timestampなど）

### 変換が必要なケース

1. **数値型の変換**
   - Prisma: `Int`（32bit整数）
   - API: `String`（wei単位の大きな数値）

2. **日時型の変換**
   - Prisma: `DateTime`
   - API: `i64`（Unix timestamp）

3. **列挙型の変換**
   - Prisma: `String`（データベース上は文字列）
   - API: `enum`（TypeScriptでは型安全な列挙型）

---

## トラブルシューティング

### typeshareが型を生成しない

- `#[typeshare]`属性が付いているか確認
- `Cargo.toml`に`typeshare`依存関係が追加されているか確認
- 生成コマンドのパスが正しいか確認

### Prisma型とAPI型が一致しない

- API仕様書を確認し、必要なフィールドが揃っているか確認
- 変換関数（`prismaToApiProduct`など）が正しく実装されているか確認

### マイグレーションエラー

- 既存のデータと互換性があるか確認
- 開発環境では`prisma migrate reset`でリセット可能
- 本番環境では慎重にマイグレーションを実行

---

## 参考資料

- [API仕様書](/docs/developer-guide/api-reference/api-specification)
- [モノレポ構造](/docs/developer-guide/monorepo-structure)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [typeshare公式ドキュメント](https://github.com/1Password/typeshare)

