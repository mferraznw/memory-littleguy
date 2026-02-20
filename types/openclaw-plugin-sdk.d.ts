declare module "openclaw/plugin-sdk" {
  export interface PluginHookAgentContext {
    agentId?: string;
    sessionKey?: string;
    sessionId?: string;
    workspaceDir?: string;
    messageProvider?: string;
  }

  export interface BeforeAgentStartEvent {
    prompt?: string;
    context?: PluginHookAgentContext;
  }

  export interface BeforeAgentStartResult {
    prependContext?: string;
    systemPrompt?: string;
  }

  export interface AgentEndEvent {
    success?: boolean;
    messages?: unknown[];
    context?: PluginHookAgentContext;
  }

  export interface BeforeCompactionEvent {
    messageCount?: number;
    messages?: unknown[];
    sessionFile?: string;
    context?: PluginHookAgentContext;
  }

  export interface OpenClawPluginApi {
    pluginConfig: Record<string, unknown>;
    logger: {
      info: (...args: unknown[]) => void;
      warn: (...args: unknown[]) => void;
    };
    on(
      event: "before_agent_start",
      handler: (event: BeforeAgentStartEvent) => Promise<BeforeAgentStartResult | void>
    ): void;
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

declare module "fs/promises" {
  export type EncodingOption = string | { encoding?: string };
  export function readFile(path: string, encoding?: EncodingOption): Promise<string>;
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function writeFile(path: string, data: string, options?: EncodingOption): Promise<void>;
}

declare module "path" {
  export function dirname(path: string): string;
  export function join(...parts: string[]): string;
}

declare namespace NodeJS {
  interface ErrnoException extends Error {
    code?: string | number;
    errno?: number;
    path?: string;
    syscall?: string;
  }
}
