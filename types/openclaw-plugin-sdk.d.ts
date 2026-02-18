declare module "openclaw/plugin-sdk" {
  export interface BeforeAgentStartEvent {
    prompt?: string;
  }

  export interface AgentEndEvent {
    success?: boolean;
    messages?: unknown[];
  }

  export interface BeforeCompactionEvent {
    messageCount?: number;
    messages?: unknown[];
    sessionFile?: string;
  }

  export interface OpenClawPluginApi {
    pluginConfig: Record<string, unknown>;
    logger: {
      info: (...args: unknown[]) => void;
      warn: (...args: unknown[]) => void;
    };
    on(event: "before_agent_start", handler: (event: BeforeAgentStartEvent) => Promise<{ prependContext?: string } | void>): void;
    on(event: "agent_end", handler: (event: AgentEndEvent) => Promise<void>): void;
    on(event: "before_compaction", handler: (event: BeforeCompactionEvent) => Promise<void>): void;
    on(event: string, handler: (event: unknown) => Promise<unknown | void>): void;
    registerTool(tool: {
      name: string;
      label: string;
      description: string;
      parameters: unknown;
      execute: (toolCallId: string, params: unknown) => Promise<{ content: Array<{ type: string; text: string }> }>;
    }, options?: { optional?: boolean }): void;
    registerService(service: {
      id: string;
      start: () => void;
      stop: () => void;
    }): void;
  }
}
