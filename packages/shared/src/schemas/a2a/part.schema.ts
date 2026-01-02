import { z } from "zod"

export const TextPart = z.object({
  kind: z.literal("text"),
  text: z.string(),
})

/**
 * @see https://a2a-protocol.org/latest/specification/#417-filepart
 */
export const FilePart = z.object({
  fileWithUri: z.string().optional(), // A URL pointing to the file's content.
  fileWithBytes: z.string().optional(), // The base64-encoded content of the file.
  mediaType: z.string().optional(), // The media type of the file (e.g., "application/pdf").
  name: z.string().optional(), // An optional name for the file (e.g., "document.pdf").
})

/**
 * @see https://a2a-protocol.org/latest/specification/#418-datapart
 */
export const DataPart = z.object({
  data: z.record(z.string(), z.string()), // A JSON object containing arbitrary data.
})

/**
 * @see https://a2a-protocol.org/latest/specification/#416-part
 */
export const Part = z.union([TextPart, FilePart, DataPart])
