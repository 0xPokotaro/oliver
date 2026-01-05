import { PrismaClient, type Product } from "@oliver/database/generated/client";

// BigIntのpriceを文字列に変換したProduct型
type ProductWithStringPrice = Omit<Product, "price"> & {
  price: string;
};

export class ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * BigIntのpriceを文字列に変換するヘルパー関数
   */
  private serializeProduct(product: Product): ProductWithStringPrice {
    return {
      ...product,
      price: product.price.toString(),
    };
  }

  async findById(id: string): Promise<ProductWithStringPrice | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    return product ? this.serializeProduct(product) : null;
  }

  async findAll(): Promise<ProductWithStringPrice[]> {
    const products = await this.prisma.product.findMany();
    return products.map((product) => this.serializeProduct(product));
  }
}
