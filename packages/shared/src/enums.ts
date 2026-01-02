import { z } from 'zod'

/**
 * Task state enumeration.
 * - TASK_STATE_UNSPECIFIED: The task is in an unknown or indeterminate state.
 * - TASK_STATE_SUBMITTED: Represents the status that acknowledges a task is created.
 * - TASK_STATE_WORKING: Represents the status that a task is actively being processed.
 * - TASK_STATE_COMPLETED: Represents the status a task is finished. This is a terminal state.
 * - TASK_STATE_FAILED: Represents the status a task is done but failed. This is a terminal state.
 * - TASK_STATE_CANCELLED: Represents the status a task was cancelled before it finished. This is a terminal state.
 * - TASK_STATE_INPUT_REQUIRED: Represents the status that the task requires information to complete. This is an interrupted state.
 * - TASK_STATE_REJECTED: Represents the status that the agent has decided to not perform the task. This may be done during initial task creation or later once an agent has determined it can't or won't proceed. This is a terminal state.
 * - TASK_STATE_AUTH_REQUIRED: Represents the state that some authentication is needed from the upstream client. Authentication is expected to come out-of-band thus this is not an interrupted or terminal state.
 */
export enum TaskState {
  UNSPECIFIED = 'TASK_STATE_UNSPECIFIED',
  SUBMITTED = 'TASK_STATE_SUBMITTED',
  WORKING = 'TASK_STATE_WORKING',
  COMPLETED = 'TASK_STATE_COMPLETED',
  FAILED = 'TASK_STATE_FAILED',
  CANCELLED = 'TASK_STATE_CANCELLED',
  INPUT_REQUIRED = 'TASK_STATE_INPUT_REQUIRED',
  REJECTED = 'TASK_STATE_REJECTED',
  AUTH_REQUIRED = 'TASK_STATE_AUTH_REQUIRED',
}

/**
 * Payment state enumeration.
 * - PAYMENT_REQUIRED: Represents the state that the payment is required.
 * - PAYMENT_SUBMITTED: Represents the state that the payment is submitted.
 * - PAYMENT_VERIFIED: Represents the state that the payment is verified.
 * - PAYMENT_REJECTED: Represents the state that the payment is rejected.
 * - PAYMENT_COMPLETED: Represents the state that the payment is completed.
 * - PAYMENT_FAILED: Represents the state that the payment is failed.
 * @see https://github.com/coinbase/x402/blob/main/specs/transports-v2/a2a.md#payment-status-lifecycle
 */
export enum PaymentState {
  REQUIRED = 'PAYMENT_REQUIRED',
  SUBMITTED = 'PAYMENT_SUBMITTED',
  VERIFIED = 'PAYMENT_VERIFIED',
  REJECTED = 'PAYMENT_REJECTED',
  COMPLETED = 'PAYMENT_COMPLETED',
  FAILED = 'PAYMENT_FAILED',
}

/**
 * Role enumeration.
 * - ROLE_UNSPECIFIED
 * - ROLE_USER: USER role refers to communication from the client to the server.
 * - ROLE_AGENT: AGENT role refers to communication from the server to the client.
 */
export enum Role {
  ROLE_UNSPECIFIED = 'ROLE_UNSPECIFIED',
  ROLE_USER = 'ROLE_USER',
  ROLE_AGENT = 'ROLE_AGENT',
}

export enum Model {
  GPT_4O_MINI = 'gpt-4o-mini',
}

export enum MineType {
  APPLICATION_JSON = 'application/json',
}
