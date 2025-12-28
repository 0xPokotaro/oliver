"use client";

import { useState } from "react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/use-products";
import { useBuyProduct } from "@/hooks/use-buy-product";
import type { Product } from "@/lib/types";
import { weiToNumber, formatCurrency } from "@/lib/formatting";

export default function PlaygroundPage() {
  const { products, isLoading: productsLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const { mutate: buyProduct, data, error, isLoading } = useBuyProduct();

  const handleBuy = () => {
    if (!selectedProduct) return;
    buyProduct({ productId: selectedProduct.id, request: { quantity } });
  };

  return (
    <Container maxWidth="7xl" className="py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">x402 Payment Playground</h1>
          <p className="text-muted-foreground mt-2">
            Test the first request (without X-PAYMENT header) to get payment
            information
          </p>
        </div>

        {/* 商品一覧 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Select Product</h2>
          {productsLoading ? (
            <div className="text-muted-foreground">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(weiToNumber(product.price), "USD", "en-US")}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Stock: {product.stockStatus}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 購入フォーム */}
        {selectedProduct && (
          <div className="border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Purchase Details</h2>
            <div>
              <div className="text-sm text-muted-foreground">Product</div>
              <div className="font-semibold">{selectedProduct.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(
                  weiToNumber(selectedProduct.price),
                  "USD",
                  "en-US",
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="text-sm font-medium block mb-2"
              >
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-32"
              />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="font-semibold text-lg">
                {formatCurrency(
                  weiToNumber(selectedProduct.price) * quantity,
                  "USD",
                  "en-US",
                )}
              </div>
            </div>
            <Button onClick={handleBuy} disabled={isLoading}>
              {isLoading ? "Requesting..." : "Buy (1st Request)"}
            </Button>
          </div>
        )}

        {/* レスポンス表示 */}
        {data && (
          <div className="border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Response</h2>
            <div>
              <div className="text-sm text-muted-foreground">HTTP Status</div>
              <div
                className={`font-semibold text-lg ${
                  data.status === 402
                    ? "text-orange-600"
                    : data.error
                      ? "text-red-600"
                      : "text-green-600"
                }`}
              >
                {data.status} {data.status === 402 ? "Payment Required" : ""}
              </div>
            </div>

            {data.error && (
              <div>
                <div className="text-sm text-muted-foreground mb-2">Error</div>
                <div className="bg-destructive/10 border border-destructive/20 rounded p-3 text-sm text-destructive">
                  {data.error}
                </div>
              </div>
            )}

            {data.paymentRequiredResponse && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Payment Required Response
                  </div>
                  <pre className="bg-muted border rounded p-4 overflow-auto text-xs">
                    {JSON.stringify(data.paymentRequiredResponse, null, 2)}
                  </pre>
                </div>

                {data.paymentRequiredResponse.accepts.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold">
                      Payment Information
                    </div>
                    {data.paymentRequiredResponse.accepts.map(
                      (accept, index) => (
                        <div
                          key={index}
                          className="border rounded p-4 space-y-2 bg-muted/50"
                        >
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Amount Required:
                              </span>{" "}
                              <span className="font-semibold">
                                {formatCurrency(
                                  Number(accept.maxAmountRequired) / 1e6,
                                  "USD",
                                  "en-US",
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Pay To:
                              </span>{" "}
                              <span className="font-mono text-xs">
                                {accept.payTo}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Asset:
                              </span>{" "}
                              <span className="font-mono text-xs">
                                {accept.asset}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Network:
                              </span>{" "}
                              <span>{accept.network}</span>
                            </div>
                            {accept.chainId && (
                              <div>
                                <span className="text-muted-foreground">
                                  Chain ID:
                                </span>{" "}
                                <span>{accept.chainId}</span>
                              </div>
                            )}
                            {accept.nonce && (
                              <div>
                                <span className="text-muted-foreground">
                                  Nonce:
                                </span>{" "}
                                <span className="font-mono text-xs">
                                  {accept.nonce}
                                </span>
                              </div>
                            )}
                            {accept.deadline && (
                              <div>
                                <span className="text-muted-foreground">
                                  Deadline:
                                </span>{" "}
                                <span>
                                  {new Date(
                                    accept.deadline * 1000,
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {accept.metadata && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-xs font-semibold mb-2">
                                Metadata
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {accept.metadata.subtotal && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Subtotal:
                                    </span>{" "}
                                    <span>
                                      {formatCurrency(
                                        Number(accept.metadata.subtotal) / 1e6,
                                        "USD",
                                        "en-US",
                                      )}
                                    </span>
                                  </div>
                                )}
                                {accept.metadata.shippingFee && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Shipping Fee:
                                    </span>{" "}
                                    <span>
                                      {formatCurrency(
                                        Number(accept.metadata.shippingFee) /
                                          1e6,
                                        "USD",
                                        "en-US",
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Error</h2>
            <div className="bg-destructive/10 border border-destructive/20 rounded p-3 text-sm text-destructive">
              {error.message}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
