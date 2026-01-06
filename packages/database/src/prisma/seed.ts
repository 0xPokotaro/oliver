import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/client";
import type { Prisma } from "../../generated/client";
import { defineAttributes, ProductCategories } from "../../src/lib/types/product-attributes";

// PrismaClientを初期化
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // 既存のデータをクリア（外部キー制約のため順序に注意）
  await prisma.userTransaction.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.paymentHistory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();
  await prisma.wallet.deleteMany();

  // 加盟店データを作成
  console.log("📦 Creating merchants...");
  const merchantCount = 10;
  const merchants = await Promise.all(
    Array.from({ length: merchantCount }, (_, i) =>
      prisma.merchant.create({
        data: { name: `Shop ${i + 1}` },
      })
    )
  );
  const [merchant1, merchant2, merchant3] = merchants;

  console.log(`✅ Created ${merchants.length} merchants`);

  // ウォレットデータを作成
  console.log("💼 Creating wallets...");
  const wallet1 = await prisma.wallet.create({
    data: {
      address: "0x1234567890123456789012345678901234567890",
    },
  });

  const wallet2 = await prisma.wallet.create({
    data: {
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    },
  });

  const wallet3 = await prisma.wallet.create({
    data: {
      address: "0x9876543210987654321098765432109876543210",
    },
  });

  console.log(`✅ Created 3 wallets`);

  // ユーザーデータを作成
  console.log("👤 Creating users...");
  const user1 = await prisma.user.create({
    data: {
      privyUserId: "privy_user_001",
      walletId: wallet1.id,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      privyUserId: "privy_user_002",
      walletId: wallet2.id,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      privyUserId: "privy_user_003",
      walletId: wallet3.id,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      privyUserId: "did:privy:cmju07bqh03xti60caidby3zh",
      walletId: null,
    },
  });

  console.log(`✅ Created 4 users`);

  // 商品データを作成
  console.log("🛍️ Creating products...");
  
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Royal Canin Indoor Adult Cat Food",
        description:
          "Specifically designed for indoor adult cats aged 1 to 7 years. Uses highly digestible proteins to reduce stool volume and odor. Supports healthy weight maintenance with moderate fat content and specific fibers that aid in hairball elimination.",
        price: BigInt(3200000000), // 3200 USD (6桁小数点想定: 3200 * 1000000)
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/royal-canin-indoor-adult.png",
        category: "cat_food",
        merchantId: merchant1.id,
        attributes: defineAttributes(ProductCategories.CAT_FOOD, {
          brand: "Royal Canin",
          flavor: "Chicken",
          targetAge: "adult",
          shape: "Dry Food",
          usage: "Cat Food",
          unit: "2000.0 grams",
          quantity: "1",
          packageInfo: "Bag",
          weight: "2 kilograms",
        }) as Prisma.InputJsonValue,
      },
      {
        name: "CIAO Churu Tuna Recipe",
        description:
          "Creamy paste-style cat treat made with fresh tuna. Free of grains, artificial colors, and preservatives. Convenient for giving medication to cats.",
        price: BigInt(1500000000), // 1500 USD
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/ciao-churu-tuna.png",
        category: "cat_food",
        merchantId: merchant1.id,
        attributes: defineAttributes(ProductCategories.CAT_FOOD, {
          brand: "CIAO",
          flavor: "Tuna",
          targetAge: "adult",
          shape: "Tube",
          usage: "Cat Food",
          unit: "420.0 grams",
          quantity: "14",
          packageInfo: "Box",
          weight: "0.5 kilograms",
        }) as Prisma.InputJsonValue,
      },
      {
        name: "Purina ONE Indoor Advantage",
        description:
          "Dry food designed for indoor cat health maintenance. Supports weight management and hairball care. Contains high-quality proteins and fiber to promote digestive health.",
        price: BigInt(2980000000), // 2980 USD
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/purina-one-indoor.png",
        category: "cat_food",
        merchantId: merchant1.id,
        attributes: defineAttributes(ProductCategories.CAT_FOOD, {
          brand: "Purina ONE",
          flavor: "Chicken",
          targetAge: "adult",
          shape: "Dry Food",
          usage: "Cat Food",
          unit: "2000.0 grams",
          quantity: "1",
          packageInfo: "Bag",
          weight: "2 kilograms",
        }) as Prisma.InputJsonValue,
      },
      {
        name: "Hill's Science Diet Adult Indoor",
        description:
          "Specially formulated dry food for indoor adult cats. Low-calorie design supports healthy weight maintenance. High-quality proteins and natural fibers aid digestion and reduce stool odor.",
        price: BigInt(3500000000), // 3500 USD
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/hills-science-diet-indoor.png",
        category: "cat_food",
        merchantId: merchant2.id,
        attributes: defineAttributes(ProductCategories.CAT_FOOD, {
          brand: "Hill's",
          flavor: "Chicken",
          targetAge: "adult",
          shape: "Dry Food",
          usage: "Cat Food",
          unit: "2000.0 grams",
          quantity: "1",
          packageInfo: "Bag",
          weight: "2 kilograms",
        }) as Prisma.InputJsonValue,
      },
      {
        name: "Orijen Original Cat",
        description:
          "High-protein dry food using fresh chicken, turkey, fish, and eggs. Grain-free formula that replicates a cat's natural diet.",
        price: BigInt(4200000000), // 4200 USD
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/orijen-original-cat.png",
        category: "cat_food",
        merchantId: merchant2.id,
        attributes: defineAttributes(ProductCategories.CAT_FOOD, {
          brand: "Orijen",
          flavor: "Chicken",
          targetAge: "adult",
          shape: "Dry Food",
          usage: "Cat Food",
          unit: "2000.0 grams",
          quantity: "1",
          packageInfo: "Bag",
          weight: "2 kilograms",
        }) as Prisma.InputJsonValue,
      },
    ],
  });

  console.log(`✅ Created ${products.count} products`);

  // トランザクションデータを作成
  console.log("💳 Creating transactions...");
  const transaction1 = await prisma.transaction.create({
    data: {
      hash: "0x0a3bfb651bed850cd871ecedc74aadf6dfc1e73d48eed47691f6bfd4cdbe3f88",
    },
  });

  const transaction2 = await prisma.transaction.create({
    data: {
      hash: "0x4653cd3ae3105d47b58bcca8aa4d1eabca385222a70899cd628f6b2e7c74a979",
    },
  });

  console.log(`✅ Created 2 transactions`);

  // UserTransactionデータを作成
  console.log("🔗 Creating user transactions...");
  await prisma.userTransaction.createMany({
    data: [
      {
        userId: user4.id,
        transactionId: transaction1.id,
        type: "SESSION_KEY_ACTIVATE",
      },
      {
        userId: user4.id,
        transactionId: transaction2.id,
        type: "SESSION_KEY_ACTIVATE",
      },
    ],
  });

  console.log(`✅ Created 2 user transactions`);
  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
