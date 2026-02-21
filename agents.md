# OpenClaw Agent Instructions for LittleGuy Plugin

> 📖 Full setup guide (Claude.ai, ChatGPT, OpenClaw): https://littleguy.app/docs/openclaw

---

## Custom Instructions — paste into Claude.ai or ChatGPT

### "What would you like the AI to know about you?" (both platforms)

```
I have LittleGuy connected via MCP — it's my persistent memory graph that stores context across every conversation I've had: decisions I've made, projects I'm working on, people I know, and knowledge I've built up over time. Treat LittleGuy as my second brain. It knows things about me that you don't yet — check it when context would improve your response.
```

### "How would you like the AI to respond?" (both platforms)

```
Use LittleGuy memory tools intelligently — not on every message, but when it matters:

SEARCH LittleGuy when:
- I ask about something from a past conversation or session
- I reference a project, person, decision, or task by name without explaining it
- The topic shifts and you'd benefit from knowing my prior context
- I ask "what did we decide", "do you remember", or "last time"
- You're unsure whether I've addressed something before

CAPTURE to LittleGuy when:
- I make an important decision or change direction on something
- I state a clear preference, rule, or constraint I want remembered
- I mention a new project, person, or goal worth tracking
- I explicitly say "remember this" or "save this"
- The conversation surfaces something that would help you next time

SKIP LittleGuy when:
- It's a simple factual question with no personal context needed
- I'm clearly exploring or brainstorming without making decisions
- You already have enough context from the current conversation

Use memory silently — don't narrate every tool call. Just let the context improve your answers.
```

---

## Why this matters
- `memory-littleguy` already auto-saves and auto-recalls in background through lifecycle hooks.
- The goal is to minimize `unified_search` calls while keeping continuity across long sessions and topic switches.

## What the plugin already does
- On `before_agent_start`/`agent_start`, it can auto-recall from LittleGuy before the model runs.
- It prefers continuity over repetitive calls:
  - It tracks a topic signature from recent user text.
  - It uses local topic heuristics and server-side `topic_drift` (when enabled) to decide if recall is needed.
  - If topic appears unchanged and recent enough, it skips recall.
- On `agent_end`, it writes turns into continuity cache (`cache_turns`) every turn by default.
- It also captures long-form context on compaction via `before_compaction` (for long-running threads).
- All recall injection is de-duped:
  - It appends to the existing system prompt instead of replacing it.
  - It avoids adding duplicate/similar lines from the current injected context.

## Session identifiers
- `sessionKey` is stable (e.g., `agent:main:main`) and `sessionId` is per start instance.
- `sessionKey` is used as continuity scope, so `sessionKey` changes are handled as context continuity boundaries.

## Tools available to the agent
- `littleguy_search` (compatibility only)
  - Backward-compatible alias for `littleguy_unified_search`.
  - Prefer `littleguy_unified_search` for all new behavior.
  - Input: `query` (required), `topK`, `minScore`, `sources`.
- `littleguy_unified_search`
  - Use for deliberate, broad memory/context recall.
  - Input: `query` (required), `topK`, `minScore`.
- `littleguy_recent_turns`
  - Use when you want a quick local-view of last turns.
  - Input: `limit` (default 50), `excludeConversationId`.
- `littleguy_topic_drift`
  - Use when deciding whether recall is worth the time.
  - Input: `query`, optional `conversationId`, optional `recentLimit`, `topicSimilarityThreshold`, `topicHistoryMinutes`, `topicRecallStaleMs`, `useEmbeddings`, `semanticTopK`, `sessionId`.
  - Use returned `shouldRecall` + `reason` to gate `littleguy_unified_search`.
- `littleguy_capture`
  - Use for explicit, durable knowledge captures you want guaranteed in long-term memory.
- `littleguy_probe`
  - Use only for troubleshooting API path/connectivity.

## When to run `littleguy_unified_search`
- Always run when the user explicitly asks for memory/history checks.
  - Examples: "what did we decide earlier?", "check littleguy", "remember what I asked…"
- Run when you detect a material topic shift.
  - Material shift examples:
    - switching from coding details to deployment/ops
    - switching from frontend to API/infrastructure
    - introducing a different business area/entity/problem domain
    - user says "on another note…"
- Run when uncertain and the next response quality depends on forgotten context.
- Prefer one run per relevant turn, not every turn.

## Topic-drift workflow (recommended)
1. Let the plugin's auto-recall run first.
2. If confidence is still unclear or user explicitly requests broader context, call `littleguy_topic_drift` with the current user intent.
3. If `shouldRecall=true`, call `littleguy_unified_search` immediately.
4. If `shouldRecall=false`, continue normally to avoid unnecessary calls.
5. If you're unsure and latency is acceptable, err on the side of recall rather than omission.

## Minimal-flooding policy
- Do not invoke `unified_search` on every turn.
- Don't call both `littleguy_topic_drift` and `littleguy_unified_search` for every turn.
- Use the default auto hooks + explicit checks only on topic transitions or user request.
- Use `littleguy_recent_turns` only when a fast glance at turn history is helpful before full recall.

## Notes for long sessions (hours-long)
- The plugin remains useful across long sessions because turns are cached continuously.
- If conversation is very active and user shifts topics, re-check drift/recall.
- If user asks for continuity from another place/session, explicitly run:
  - `littleguy_unified_search` with user's current goal.
