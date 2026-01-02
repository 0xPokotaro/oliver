import { z } from "zod"
import { Part } from "@oliver/shared/schemas/a2a/part.schema"

/**
 * @see https://a2a-protocol.org/latest/specification/#419-artifact
 */
export const Artifact = z.object({
  artifactId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  parts: z.array(Part),
  metadata: z.record(z.string(), z.string()).optional(),
  extensions: z.array(z.string()).optional(),
})
