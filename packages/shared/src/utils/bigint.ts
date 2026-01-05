/**
 * JSONから取得したデータのBigIntフィールドを復元する関数
 * @param obj - 復元対象のオブジェクト
 * @returns BigIntフィールドが復元されたオブジェクト
 */
export const restoreBigInt = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === "string" && /^\d+$/.test(obj)) {
    // 数値文字列をBigIntに変換
    return BigInt(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(restoreBigInt);
  }
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, restoreBigInt(value)]),
    );
  }
  return obj;
};

/**
 * BigIntを文字列に変換する関数
 * @param obj - 変換対象のオブジェクト
 * @returns BigIntフィールドが文字列に変換されたオブジェクト
 */
export const serializeBigInt = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        serializeBigInt(value),
      ]),
    );
  }
  return obj;
};

