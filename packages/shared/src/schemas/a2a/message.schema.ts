import { z } from "zod"
import { Role } from "@oliver/shared/enums"
import { Part } from "@oliver/shared/schemas/a2a/part.schema"

/**
 * @see https://a2a-protocol.org/latest/specification/#414-message
 */
export const Message = z.object({
  messageId: z.string(), // The unique identifier (e.g. UUID) of the message. This is required and created by the message creator.
  contextId: z.string().optional(), // The context id of the message. This is optional and if set, the message will be associated with the given context.
  taskId: z.string().optional(), // The task id of the message. This is optional and if set, the message will be associated with the given task.
  role: z.enum(Role), // The role of the message. This is required and can be one of the following: ROLE_UNSPECIFIED, ROLE_USER, ROLE_AGENT.
  parts: z.array(Part), // The parts of the message. This is required and contains an array of Part objects.
  metadata: z.any().optional(), // Any optional metadata to provide along with the message.
  extensions: z.array(z.string()).optional(), // The URIs of extensions that are present or contributed to this Message.
  referenceTaskIds: z.array(z.string()).optional(), // A list of task IDs that this message references for additional context.
})

export type Message = z.infer<typeof Message>;
