# memory-littleguy — Persistent Memory for OpenClaw Agents

> *"Your agent always knows everything relevant — across every surface you use."*

**memory-littleguy** is an [OpenClaw](https://openclaw.ai) plugin that gives your agent persistent, structured long-term memory powered by [LittleGuy](https://littleguy.app) — a self-organizing knowledge graph that turns raw conversation turns into real human context.

Built and used daily by **Gideon**, Mark Ferraz's personal AI agent running on OpenClaw.

---

## Why This Exists

OpenClaw agents wake up fresh every session. They forget everything — decisions, preferences, project context, relationships. That's a problem when your agent is managing sprints, coordinating across tools, or acting with genuine intent on your behalf.

**memory-littleguy** solves this by bridging OpenClaw's lifecycle hooks to LittleGuy's knowledge graph, giving your agent:

- **Automatic recall** — relevant memories injected into context *before* the agent runs
- **Automatic capture** — user and assistant turns persisted silently after each interaction
- **Compaction safety net** — full session summaries dumped to LittleGuy before context compaction, so nothing is truly lost
- **Topic-aware recall** — smart topic drift detection (local heuristics + server-side semantic embeddings) to avoid redundant searches
- **Cross-session continuity** — a turn cache that bridges conversations across clients, channels, and sessions

## What Makes LittleGuy Different

LittleGuy isn't another vector store with chat history dumped in. It's a **structured knowledge graph** with:

- **Human-like temporal decay** — older, less-reinforced knowledge fades naturally
- **Episodic + semantic + procedural memory** — not just "what was said" but decisions, patterns, and learned procedures
- **De-duplication and incremental injection** — no redundant context bloat
- **User-issuable API keys** — your entire agent stack can talk to it programmatically
- **Visual knowledge graph** — view, interact with, and refine your agent's memory
- **OAuth MCP server** — extensive tool surface for any MCP-compatible client

**Currently completely free** at [littleguy.app](https://littleguy.app).

> 🆕 **ChatGPT now supports MCP** (February 2026) — connect LittleGuy's MCP server to ChatGPT directly. Same graph, same memory, every surface.

📖 **[Full setup guide for OpenClaw, Claude.ai, and ChatGPT →](https://littleguy.app/docs/openclaw)**

---

## Getting Started

### Step 1 — Create your LittleGuy account

1. Go to **[littleguy.app](https://littleguy.app)** and sign up (free)
2. You'll be prompted to name your LittleGuy — this is your agent's memory identity
3. Once signed in, open your **Dashboard → Settings → API Keys**
4. Click **Generate API Key** — it will look like `lgk_xxxxxxxxxxxxxxxx`
5. Copy and store it somewhere safe — you'll need it for the plugin config

> 💡 API keys are user-scoped. Each key gives full read/write access to your LittleGuy knowledge graph.

---

## Installation

### 1. Install the plugin

```bash
# From npm (when published)
npm install memory-littleguy

# Or clone directly
git clone https://github.com/mferraznw/memory-littleguy.git
```

### 2. Add to your OpenClaw config

In your `openclaw.json` (or via the OpenClaw dashboard):

```json
{
  "plugins": {
    "memory-littleguy": {
      "apiKey": "lgk_your_api_key_here",
      "baseUrl": "https://mcp.littleguy.app",
      "autoRecall": true,
      "autoCapture": false,
      "cacheTurnsEnabled": true,
      "recallFromCache": true,
      "topicDriftEnabled": true
    }
  }
}
```

### 3. Get your API key

Sign up at [littleguy.app](https://littleguy.app), create a LittleGuy, and generate an API key from your dashboard.

---

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | *required* | Your LittleGuy API key (`lgk_...`) |
| `baseUrl` | string | `https://mcp.littleguy.app` | LittleGuy API endpoint |
| `autoRecall` | boolean | `true` | Inject relevant memories before each agent turn |
| `autoCapture` | boolean | `false` | Capture significant content to long-term graph memory |
| `cacheTurnsEnabled` | boolean | `true` | Write every turn into continuity cache |
| `recallFromCache` | boolean | `true` | Inject recent cross-session turns on start |
| `topicDriftEnabled` | boolean | `true` | Use server-side topic drift for smarter recall |
| `topicDriftUseEmbeddings` | boolean | `true` | Semantic embedding support for topic comparison |
| `recallTopK` | number | `6` | Max memories injected per turn |
| `recallMinScore` | number | `0.35` | Minimum relevance score for recall |
| `recentTurnsLimit` | number | `25` | Cached turns injected on session start (keep low to avoid flooding context) |
| `cacheTurnMaxChars` | number | `800` | Max chars per cached turn (truncates long turns) |
| `includeAssistantInCache` | boolean | `false` | Cache assistant turns (off by default — user turns are the signal) |
| `excludeCurrentConversationFromCache` | boolean | `true` | Skip current conversation when hydrating cache |
| `topicSimilarityThreshold` | number | `0.38` | Skip recall when topic similarity exceeds this |
| `topicRecallStaleMs` | number | `21600000` | Force fresh recall after 6 hours even if topic unchanged |

---

## Agent Tools

The plugin registers these tools for your agent to use directly:

| Tool | Purpose |
|------|---------|
| `littleguy_unified_search` | Search across knowledge graph, living memory, and messages |
| `littleguy_topic_drift` | Check if current topic warrants fresh recall |
| `littleguy_recent_turns` | Quick scan of recent cached turns |
| `littleguy_capture` | Manually store a thought, decision, or fact |
| `littleguy_probe` | Connectivity and write-path diagnostics |
| `littleguy_search` | Legacy compatibility wrapper |

---

## How It Works

```
┌─────────────────────────────────────────────────────┐
│                    OpenClaw Agent                     │
│                                                       │
│  before_agent_start ──► Topic Drift Check             │
│         │                    │                        │
│         │              [drift detected?]              │
│         │                yes │ no                     │
│         │                 │   └── skip recall         │
│         ▼                 ▼                           │
│   Hydrate Cache    Unified Search                    │
│   (recent turns)   (knowledge graph)                 │
│         │                 │                           │
│         └────────┬────────┘                           │
│                  ▼                                    │
│         Inject into system prompt                    │
│         (de-duped, incremental)                      │
│                                                       │
│  ═══════════════════════════════════════              │
│                                                       │
│  agent_end ──► Cache turns to LittleGuy              │
│         │──► Auto-capture significant content        │
│                                                       │
│  before_compaction ──► Dump session summary           │
│                        (nothing is lost)              │
└─────────────────────────────────────────────────────┘
```

---

## Real-World Usage

This plugin powers **Gideon**, an OpenClaw agent that manages:

- Sprint planning and release coordination (Govern365 v1)
- Email monitoring across Gmail and M365 accounts
- Calendar and contact management
- Sub-agent orchestration for coding, research, and ops
- Proactive heartbeat checks and daily briefings
- Voice interaction via GideonTalk (Swift menu bar app)

Gideon uses LittleGuy to remember decisions, track project context, maintain relationship history, and provide continuity across hundreds of sessions — without ever losing critical context to compaction.

---

## About

**Author:** Mark Ferraz ([@mferraznw](https://github.com/mferraznw))  
**Agent:** Gideon (OpenClaw AI familiar)  
**Company:** [SolutionsMark](https://solutionsmark.com)

Senior Technical Director with 25+ years in Microsoft 365. Co-authored Microsoft Press books on SharePoint. Building AI-native systems on top of structured memory for enterprise governance.

**LittleGuy** — [littleguy.app](https://littleguy.app) — A second brain for agents.  
**OpenClaw** — [openclaw.ai](https://openclaw.ai) — The agent platform.

---

## License

MIT
