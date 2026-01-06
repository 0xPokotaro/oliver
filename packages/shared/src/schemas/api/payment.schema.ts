import { z } from "zod";

export const PaymentResponseSchema = z.object({
  error: z.string(),
  accepts: z.array(z.object({
    scheme: z.string(),
    network: z.string(),
    maxAmountRequired: z.string(),
    resource: z.string(),
    description: z.string(),
    mimeType: z.string(),
    payTo: z.string(),
    maxTimeoutSeconds: z.number(),
    asset: z.string(),
    outputSchema: z.object({
      input: z.object({
        type: z.string(),
        method: z.string(),
        discoverable: z.boolean(),
      })
    }),
    extra: z.object({
      name: z.string(),
      version: z.string(),
    })
  })),
  x402Version: z.number(),
})

export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;

export const PaymentRequestSchema = z.object({
  x402Version: z.number(),
  scheme: z.string(),
  network: z.string(),
  payload: z.object({
    signature: z.string(),
    authorization: z.object({
      from: z.string(),
      to: z.string(),
      value: z.string(),
      validAfter: z.string(),
      validBefore: z.string(),
      nonce: z.string(),
    }),
  }),
});

export type PaymentRequest = z.infer<typeof PaymentRequestSchema>;

