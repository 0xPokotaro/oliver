import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getCategoryLabel } from "@/lib/format";
import type { Product } from "@/generated/prisma/client";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <p className="text-2xl font-bold">
            {formatPrice(product.price)} USDC
          </p>
          <Badge variant="outline">{getCategoryLabel(product.category)}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
