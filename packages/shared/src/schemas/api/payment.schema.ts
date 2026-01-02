import { z } from "zod"
import { Message } from "@oliver/shared/schemas/a2a/message.schema"

export const PaymentRequest = z.object({
  message: Message,
})
