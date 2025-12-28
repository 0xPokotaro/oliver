/**
 * Centralized type exports
 * Import types from a single location: import { Product, PaymentPayload } from "@/lib/types"
 */

// Merchant API types
export type {
  Product,
  ProductDetail,
  Order,
  BuyRequest,
  BuyResponse,
  PaymentMetadata,
  HealthResponse,
  StockStatus,
  OrderStatus,
} from "./merchant-types";

// Note: PaymentInfo, PaymentRequiredResponse, and PaymentAccept are defined in both
// merchant-types.ts and x402-types.ts. Exporting from x402-types as the primary source.

// X402 payment protocol types
export type {
  Signature,
  PaymentPayload,
  PaymentPayloadData,
  PaymentAccept,
  PaymentRequiredResponse,
  PaymentInfo,
  VerifyResponse,
  SettleResponse,
  X402Config,
  X402MiddlewareResult,
} from "./x402-types";

// Product attributes types
export type {
  ProductCategory,
  ProductAttributes,
  CatFoodAttributes,
  BeverageAttributes,
  DailyGoodsAttributes,
  TypedProductCreateManyInput,
} from "./product-attributes";

export {
  defineAttributes,
  createProductDataForPrisma,
  ProductCategories,
  ProductCategorySchema,
  CatFoodAttributesSchema,
  BeverageAttributesSchema,
  DailyGoodsAttributesSchema,
} from "./product-attributes";

// User API types
export type {
  Balance,
  Purchase,
  UserInformation,
} from "./user-types";
