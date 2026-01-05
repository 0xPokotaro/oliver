import { Hono } from "hono";
import { sValidator } from "@hono/standard-validator";
import { PaymentRequest } from "@oliver/shared/schemas/api";
import type { Task, Message } from "@oliver/shared/schemas/a2a";
import { TaskState, PaymentState, Role } from "@oliver/shared/enums";
import {
  generateMessageId,
  generateTaskId,
  generateContextId,
} from "@oliver/shared/utils";
import {
  AiAgent,
  type RequestContext,
  type EventQueue,
} from "@oliver/api/lib/AiAgent";
import { PaymentManager } from "@oliver/api/lib/PaymentManager";
import { getAppConfig } from "@oliver/api/config";
import type { PaymentPayload } from "@x402/core/types";
import { createRepositories } from "../repositories";

// 遅延初期化: 実際に使用される時まで初期化を遅延
let paymentManager: PaymentManager | null = null;
let agent: AiAgent | null = null;

async function getPaymentManager(): Promise<PaymentManager> {
  if (!paymentManager) {
    const config = getAppConfig();
    const repositories = createRepositories();
    paymentManager = new PaymentManager({
      baseURL: config.facilitatorBaseURL,
      merchantAddress: config.merchantAddress,
      productRepository: repositories.product,
      defaultCurrency: config.defaultCurrency,
    });
    await paymentManager.initialize();
  }
  return paymentManager;
}

function getAiAgent(): AiAgent {
  if (!agent) {
    const config = getAppConfig();
    agent = new AiAgent({
      apiKey: config.openaiApiKey,
    });
  }
  return agent;
}

const app = new Hono();

app.post("/", sValidator("json", PaymentRequest), async (c) => {
  const payload = c.req.valid("json");
  console.log("payment request", payload);

  // Create a task from the request
  const task: Task = {
    id: payload.message.taskId || generateTaskId(),
    contextId: payload.message.contextId || generateContextId(),
    status: {
      state: TaskState.SUBMITTED,
      message: payload.message,
      timestamp: new Date().toISOString(),
    },
    metadata: payload.message.metadata || {},
  };

  // Create request context
  const context: RequestContext = {
    taskId: task.id,
    contextId: task.contextId,
    currentTask: task,
    message: payload.message,
  };

  // Create event queue to collect responses
  const events: Task[] = [];
  const eventQueue: EventQueue = {
    enqueueEvent: async (event: Task) => {
      events.push(event);
    },
  };

  const paymentPayload = payload.message.metadata?.["x402.payment.payload"] as
    | PaymentPayload
    | undefined;
  const paymentStatus = payload.message.metadata?.["x402.payment.status"] as
    | PaymentState
    | undefined;

  // 重要 - 支払いが不足しているか、まだ送信されていないかを確認します。
  // 不足している場合は、タスクのメタデータに支払い要件を埋め込んだ「支払いが必要（payment-required）」というレスポンスを返します。
  // これは、メッセージのメタデータを介して支払い要件を伝達する「A2A」パターンに従った設計です。
  if (!paymentPayload || paymentStatus !== PaymentState.SUBMITTED) {
    const manager = await getPaymentManager();
    const paymentRequired = await manager.buildPaymentRequired([]);
    console.log("payment required", paymentRequired);

    const responseMessage: Message = {
      messageId: generateMessageId(),
      role: Role.ROLE_AGENT,
      parts: [
        {
          kind: "text",
          text: "Payment required. Please submit payment to continue.",
        },
      ],
      metadata: {
        "x402.payment.required": paymentRequired,
        "x402.payment.status": PaymentState.REQUIRED,
      },
    };

    task.status.state = TaskState.SUBMITTED;
    task.status.message = responseMessage;
    task.metadata = {
      ...(task.metadata || {}),
      "x402.payment.required": paymentRequired,
      "x402.payment.status": PaymentState.REQUIRED,
    };

    events.push(task);

    return c.json(
      {
        success: false,
        error: "Payment Required",
        task,
        events,
      },
      402,
    );
  }

  // Verify the payment signature and authorization details (amount, recipient, timing) against the payment requirements.
  // This ensures the payment is cryptographically valid and matches what the merchant expects before processing the request.
  const manager = await getPaymentManager();
  const verifyResult = await manager.verifyPayment(paymentPayload);

  // Execute the AI agent's core logic to process the user's request.
  // This calls the LLM (e.g., OpenAI) with the conversation context and streams
  // the response back through the event queue, updating the task with the AI's reply.
  const aiAgent = getAiAgent();
  await aiAgent.execute(context, eventQueue);

  return c.json({ message: "payment" });
});

export default app;
