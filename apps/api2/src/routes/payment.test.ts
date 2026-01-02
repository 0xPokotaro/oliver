import { describe, it, expect } from "vitest";
import { testClient } from "hono/testing";
import app from "./payment";
import { Role, PaymentState, TaskState } from "@oliver/shared/enums";

describe("POST /", () => {
  it("should return 402 Payment Required when payment is missing", async () => {
    const client = testClient(app);

    const res = await (client as any).index.$post({
      json: {
        message: {
          messageId: "123",
          role: Role.ROLE_USER,
          parts: [
            {
              kind: "text",
              text: "Hello, world!",
            },
          ],
        },
      },
    });

    expect(res.status).toBe(402);
    const data = (await res.json()) as {
      success: boolean;
      error: string;
      task: {
        id: string;
        contextId: string;
        status: {
          state: string;
          message?: {
            role: string;
            parts: Array<{ text: string }>;
          };
        };
        metadata?: Record<string, unknown>;
      };
      events: unknown[];
    };

    // レスポンスボディの基本構造を検証
    expect(data.success).toBe(false);
    expect(data.error).toBe("Payment Required");
    expect(data.task).toBeDefined();
    expect(data.events).toBeDefined();
    expect(Array.isArray(data.events)).toBe(true);
    expect(data.events.length).toBeGreaterThan(0);

    // taskオブジェクトの構造を検証
    const task = data.task;
    expect(task.id).toBeDefined();
    expect(task.contextId).toBeDefined();
    expect(task.status).toBeDefined();
    expect(task.status.state).toBe(TaskState.SUBMITTED);
    expect(task.status.message).toBeDefined();

    // task.status.messageが存在することを確認した後、型アサーションを使用
    const statusMessage = task.status.message;
    if (!statusMessage) {
      throw new Error("task.status.message should be defined");
    }
    expect(statusMessage.role).toBe(Role.ROLE_AGENT);
    expect(statusMessage.parts).toBeDefined();
    expect(statusMessage.parts[0].text).toBe(
      "Payment required. Please submit payment to continue.",
    );

    // task.metadataに支払い情報が含まれていることを確認
    expect(task.metadata).toBeDefined();
    if (!task.metadata) {
      throw new Error("task.metadata should be defined");
    }
    expect(task.metadata["x402.payment.required"]).toBeDefined();
    expect(task.metadata["x402.payment.status"]).toBe(PaymentState.REQUIRED);

    // events配列の最初の要素がtaskと一致することを確認
    expect(data.events[0]).toEqual(task);
  });
});
