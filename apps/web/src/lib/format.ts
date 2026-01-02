export function formatWalletAddress(
  address: string,
  startLength = 6,
  endLength = 4,
): string {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function formatPrice(price: bigint | string | number): string {
  const priceNum = typeof price === "bigint" ? Number(price) : Number(price);
  const usdcAmount = priceNum / 1000000; // 6桁小数点
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdcAmount);
}

export function getCategoryLabel(category: string | null | undefined): string {
  if (!category) return "";
  switch (category) {
    case "cat_food":
      return "Cat Food";
    case "dog_food":
      return "Dog Food";
    default:
      return category;
  }
}
