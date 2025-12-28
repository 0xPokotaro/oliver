import { z } from "zod";
import type { Prisma } from "@oliver/database";

/**
 * 商品カテゴリの型定義
 */
export const ProductCategorySchema = z.enum([
  "cat_food",
  "beverage",
  "daily_goods",
]);

export type ProductCategory = z.infer<typeof ProductCategorySchema>;

/**
 * 商品カテゴリの定数（enumのように使用可能）
 */
export const ProductCategories = {
  CAT_FOOD: "cat_food",
  BEVERAGE: "beverage",
  DAILY_GOODS: "daily_goods",
} as const satisfies Record<string, ProductCategory>;

/**
 * 共通属性のベーススキーマ
 */
const BaseAttributesSchema = z.object({
  brand: z.string(),
  shape: z.string(),
  usage: z.string(),
  unit: z.string(),
  quantity: z.string(),
  packageInfo: z.string(),
  weight: z.string(),
});

/**
 * キャットフード専用属性スキーマ
 */
export const CatFoodAttributesSchema = BaseAttributesSchema.extend({
  flavor: z.string(),
  targetAge: z.enum(["adult", "kitten", "senior"]),
  specialIngredients: z.string().optional(),
});

export type CatFoodAttributes = z.infer<typeof CatFoodAttributesSchema>;

/**
 * 飲料専用属性スキーマ
 */
export const BeverageAttributesSchema = BaseAttributesSchema;

export type BeverageAttributes = z.infer<typeof BeverageAttributesSchema>;

/**
 * 日用品専用属性スキーマ
 */
export const DailyGoodsAttributesSchema = BaseAttributesSchema;

export type DailyGoodsAttributes = z.infer<typeof DailyGoodsAttributesSchema>;

/**
 * カテゴリに応じたスキーマのマッピング
 */
export const ProductAttributesSchemaMap = {
  cat_food: CatFoodAttributesSchema,
  beverage: BeverageAttributesSchema,
  daily_goods: DailyGoodsAttributesSchema,
} as const;

/**
 * カテゴリに応じたattributesの型を取得
 */
export type ProductAttributes<T extends ProductCategory> = T extends "cat_food"
  ? CatFoodAttributes
  : T extends "beverage"
    ? BeverageAttributes
    : T extends "daily_goods"
      ? DailyGoodsAttributes
      : never;

/**
 * 任意のカテゴリのattributes型
 */
export type AnyProductAttributes =
  | CatFoodAttributes
  | BeverageAttributes
  | DailyGoodsAttributes;

/**
 * ジェネリック型でattributesを定義するヘルパー関数
 * 型推論とランタイム検証の両方を提供
 */
export function defineAttributes<T extends ProductCategory>(
  category: T,
  attributes: ProductAttributes<T>,
): ProductAttributes<T> {
  const schema = ProductAttributesSchemaMap[category];
  return schema.parse(attributes) as ProductAttributes<T>;
}

/**
 * PrismaのProductCreateManyInputを拡張した型安全な型
 */
export type TypedProductCreateManyInput<T extends ProductCategory> = Omit<
  Prisma.ProductCreateManyInput,
  "attributes" | "category"
> & {
  category: T;
  attributes: ProductAttributes<T>;
};

/**
 * 型安全な商品データを作成するヘルパー関数
 */
export function createProductDataForPrisma<T extends ProductCategory>(
  category: T,
  data: Omit<TypedProductCreateManyInput<T>, "category">,
): Prisma.ProductCreateManyInput {
  const validatedAttributes = defineAttributes(category, data.attributes);

  return {
    ...data,
    category,
    attributes: validatedAttributes as Prisma.InputJsonValue,
  };
}
