import { z } from "zod"
import { TaskState } from "@oliver/shared/enums"
import { Message } from "@oliver/shared/schemas/a2a/message.schema"
import { Artifact } from "@oliver/shared/schemas/a2a/artifact.schema"

/**
 * @see https://a2a-protocol.org/latest/specification/#412-taskstatus
 */
export const TaskStatus = z.object({
  state: z.enum(TaskState),
  message: Message.optional(),
  timestamp: z.string(), // ISO 8601 Timestamp when the status was recorded.
})

export type TaskStatus = z.infer<typeof TaskStatus>
/**
 * @see https://a2a-protocol.org/latest/specification/#411-task
 */
export const Task = z.object({
  id: z.string(),
  contextId: z.string(),
  status: TaskStatus,
  artifacts: z.array(Artifact).optional(),
  history: z.array(Message).optional(),
  metadata: z.any().optional(),
})

export type Task = z.infer<typeof Task>
