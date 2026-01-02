import { v4 as uuidv4 } from 'uuid'

export const generateMessageId = (): string => {
  return `message-${uuidv4()}`
}

export const generateTaskId = (): string => {
  return `task-${uuidv4()}`
}

export const generateContextId = (): string => {
  return `context-${uuidv4()}`
}
