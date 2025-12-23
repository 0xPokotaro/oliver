/**
 * Formatting utility functions for the application
 */

/**
 * Convert wei-like value (6 decimal places) to number
 * @param wei - String representation of value in smallest unit (assumed 6 decimals)
 * @returns Number value
 */
export function weiToNumber(wei: string): number {
  return Number(wei) / 1e6;
}

/**
 * Format a number as currency
 * @param value - Numeric value to format
 * @param currency - Currency code (default: "JPY")
 * @param locale - Locale string (default: "ja-JP")
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = "JPY",
  locale: string = "ja-JP",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Truncate a string with ellipsis in the middle
 * @param str - String to truncate
 * @param maxLength - Maximum length before truncation
 * @param startChars - Number of characters to keep at start (default: 8)
 * @param endChars - Number of characters to keep at end (default: 4)
 * @returns Truncated string or original if under maxLength
 */
export function truncateString(
  str: string,
  maxLength: number,
  startChars: number = 8,
  endChars: number = 4,
): string {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}
