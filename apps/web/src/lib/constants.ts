/**
 * Application-wide constants
 */

/**
 * Default product category used throughout the application
 */
export const DEFAULT_PRODUCT_CATEGORY = "cat_food";

/**
 * Stock status labels for display
 */
export const STOCK_STATUS_LABELS: Record<string, string> = {
  in_stock: "在庫あり",
  low_stock: "在庫少",
  out_of_stock: "在庫切れ",
} as const;

/**
 * Mobile breakpoint in pixels
 * Used for responsive design and media queries
 */
export const MOBILE_BREAKPOINT = 768;
