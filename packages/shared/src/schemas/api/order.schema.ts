import { z } from "zod";

export const CartItem = z.object({
  productId: z.string(),
  quantity: z.number(),
})

export type CartItem = z.infer<typeof CartItem>;

export const OrderConfirmRequest = z.object({
  items: z.array(CartItem)
})

export type OrderConfirmRequest = z.infer<typeof OrderConfirmRequest>;
