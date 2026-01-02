import OpenAI from "openai";
import { Model } from "@oliver/shared/enums";
import { Task, Message } from "@oliver/shared/schemas/a2a";

interface AgentOptions {
  apiKey: string;
  model?: Model;
}

export interface RequestContext {
  taskId: string;
  contextId: string;
  currentTask?: Task;
  message: Message;
}

export interface EventQueue {
  enqueueEvent(event: Task): Promise<void>;
}

export interface IAiAgent {
  execute(context: RequestContext, eventQueue: any): Promise<void>;
}

export class AiAgent implements IAiAgent {
  private openai: OpenAI;
  private model: Model;

  constructor({ apiKey, model = Model.GPT_4O_MINI }: AgentOptions) {
    this.openai = new OpenAI({
      apiKey,
    });
    this.model = model;
  }

  async execute(context: RequestContext, eventQueue: EventQueue) {
    console.log("executing agent");
    const task = context.currentTask;

    console.log("task", task);
  }
}
