import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client";
import type { Prisma } from "../generated/client";
import { defineAttributes, ProductCategories } from "../src/lib/types/product-attributes";

// PrismaClientを初期化
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // 既存のデータをクリア（外部キー制約のため順序に注意）
  await prisma.paymentHistory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.merchant.deleteMany();
  await prisma.user.deleteMany();

  // 加盟店データを作成
  console.log("📦 Creating merchants...");
  const merchant1 = await prisma.merchant.create({
    data: {
      name: "ペットフード専門店 にゃんこ堂",
    },
  });

  const merchant2 = await prisma.merchant.create({
    data: {
      name: "プレミアムペット用品 わんわんストア",
    },
  });

  const merchant3 = await prisma.merchant.create({
    data: {
      name: "日用品マート くらしの便利屋",
    },
  });

  console.log(`✅ Created 3 merchants`);

  // ユーザーデータを作成
  console.log("👤 Creating users...");
  const user1 = await prisma.user.create({
    data: {
      dynamicUserId: "dyn_user_001",
      walletAddress: "0x1234567890123456789012345678901234567890",
      smartAccountAddress: "0x1111111111111111111111111111111111111111",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      dynamicUserId: "dyn_user_002",
      walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      smartAccountAddress: "0x2222222222222222222222222222222222222222",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      dynamicUserId: "dyn_user_003",
      walletAddress: "0x9876543210987654321098765432109876543210",
      smartAccountAddress: "0x3333333333333333333333333333333333333333",
    },
  });

  console.log(`✅ Created 3 users`);

  // 商品データを作成
  console.log("🛍️ Creating products...");
  const defaultCurrency = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base
  
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Nutro Natural Choice Adult Cat Chicken",
        description:
          "High-quality chicken-based dry food for adult cats with balanced nutrition. Contains natural antioxidants and supports healthy coat and skin.",
        price: BigInt(2980000000), // 2980 USD (6桁小数点想定: 2980 * 1000000)
        currency: defaultCurrency,
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/nutro-natural-choice-chicken.png",
        category: "cat_food",
        merchantId: merchant1.id,
        attributes: defineAttributes(ProductCategories.CAT_FOOD, {
          brand: "Nutro",
          flavor: "Chicken",
          targetAge: "adult",
          shape: "Dry Food",
          usage: "Cat Food",
          specialIngredients:
            "Chicken (meat), Chicken Meal, Pea Protein, Peas, Chicken Fat*, Tapioca, Beet Pulp, Potato Protein, Fish Meal, Salmon Meal, Alfalfa Meal, Protein Hydrolysate, Flaxseed, Yucca Extract, Vitamins (A, B1, B2, B6, B12, C, D3, E, Choline, Niacin, Pantothenic Acid, Biotin, Folic Acid), Minerals (Potassium, Chloride, Selenium, Sodium, Manganese, Iodine, Zinc, Iron, Copper), Amino Acids (Taurine, Methionine), Antioxidants (Mixed Tocopherols, Rosemary Extract, Citric Acid)",
          unit: "2000.0 grams",
          quantity: "1",
          packageInfo: "Bag",
          weight: "2 kilograms",
        }) as Prisma.InputJsonValue,
      },
      {
        name: "Nutro Ultra Adult Cat Salmon",
        description:
          "Premium dry food made primarily with salmon. Rich in omega-3 fatty acids, supports joint health and immune system.",
        price: BigInt(3480000000), // 3480 USD
        currency: defaultCurrency,
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/nutro-ultra-salmon.png",
        category: "cat_food",
        merchantId: merchant1.id,
        attributes: defineAttributes(ProductCategories.CAT_FOOD, {
          brand: "Nutro",
          flavor: "Salmon",
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
        name: "Nutro Natural Choice Kitten Chicken & Rice",
        description:
          "Balanced nutrition for growing kittens. Rich in DHA, supports brain and eye development.",
        price: BigInt(3280000000), // 3280 USD
        currency: defaultCurrency,
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/nutro-kitten-chicken-rice.png",
        category: "cat_food",
        merchantId: merchant1.id,
        attributes: defineAttributes(ProductCategories.CAT_FOOD, {
          brand: "Nutro",
          flavor: "Chicken & Rice",
          targetAge: "kitten",
          shape: "Dry Food",
          usage: "Cat Food",
          unit: "1500.0 grams",
          quantity: "1",
          packageInfo: "Bag",
          weight: "1.5 kilograms",
        }) as Prisma.InputJsonValue,
      },
      {
        name: "Royal Canin Indoor Cat 2kg",
        description:
          "Dry food specially developed for indoor cats. High digestibility and reduces stool odor.",
        price: BigInt(3200000000), // 3200 USD
        currency: defaultCurrency,
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/rc-2kg.png",
        category: "cat_food",
        merchantId: merchant2.id,
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
        name: "Hills Science Diet Adult Cat Chicken",
        description:
          "Premium dry food recommended by veterinarians. Supports healthy weight maintenance and digestive health.",
        price: BigInt(3500000000), // 3500 USD
        currency: defaultCurrency,
        stockStatus: "low_stock",
        imageUrl: "https://assets.oliver.dev/products/hills-science-diet-chicken.png",
        category: "cat_food",
        merchantId: merchant2.id,
        attributes: defineAttributes(ProductCategories.CAT_FOOD, {
          brand: "Hills",
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
        name: "Mineral Water 2L × 6 bottles",
        description:
          "Delicious mineral water rich in natural minerals. Set of 6 bottles.",
        price: BigInt(800000000), // 800 USD
        currency: defaultCurrency,
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/water-2l-box.png",
        category: "beverage",
        merchantId: merchant3.id,
        attributes: defineAttributes(ProductCategories.BEVERAGE, {
          brand: "Natural Water",
          shape: "PET Bottle",
          usage: "Beverage",
          unit: "12000.0 milliliters",
          quantity: "6",
          packageInfo: "Cardboard",
          weight: "12 kilograms",
        }) as Prisma.InputJsonValue,
      },
      {
        name: "Toilet Paper 12 rolls",
        description:
          "Soft and durable toilet paper. 12 rolls.",
        price: BigInt(1200000000), // 1200 USD
        currency: defaultCurrency,
        stockStatus: "in_stock",
        imageUrl: "https://assets.oliver.dev/products/toilet-paper-12roll.png",
        category: "daily_goods",
        merchantId: merchant3.id,
        attributes: defineAttributes(ProductCategories.DAILY_GOODS, {
          brand: "Eco",
          shape: "Roll",
          usage: "Toilet Paper",
          unit: "12 rolls",
          quantity: "1",
          packageInfo: "Plastic Wrap",
          weight: "1.2 kilograms",
        }) as Prisma.InputJsonValue,
      },
    ],
  });

  console.log(`✅ Created ${products.count} products`);
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
