---
name: chat
description: Return to chat mode - exit Agent Kernel mode and return to normal conversational Claude
accepts_args: false

# Agent Kernel Protocol (Principle #29)
domain: null
tuple_binding:
  slot: All
  effect: mode_switch
local_check: "Mode switched to Chat, prompts processed directly"
entities:
  - mode
  - session
relations:
  - deactivates
  - restores
---

# Chat Command (Exit Agent Kernel Mode)

**Purpose**: Exit Agent Kernel mode and return to normal conversational Claude.

---

## What is Chat Mode?

Chat mode is the **default execution context** where Claude operates as a standard conversational assistant:

- **Direct responses**: No tuple machinery between prompt and response
- **Conversation context**: Uses conversation history, not RuntimeState
- **No gradient tracking**: Tasks complete when you say they're done
- **No Linear integration**: Work is not team-visible
- **No automatic checkpoints**: You guide the conversation

---

## Usage

```bash
# Exit Agent Kernel mode
/chat

# Alternative
/mode chat
```

---

## What Happens When You Exit

1. **Mode Switch**: Session transitions back to chat context
2. **State Preservation**: RuntimeState saved to `.claude/state/runs/`
3. **Prompt Routing**: Subsequent prompts processed directly
4. **Confirmation**: Claude confirms mode exit

### Exit Confirmation

```
═══════════════════════════════════════════════════════════════
CHAT MODE ACTIVATED
═══════════════════════════════════════════════════════════════

Session is now in Chat mode.

**Behavior**:
- Prompts processed directly (no tuple machinery)
- Normal conversational Claude
- Commands still available when explicitly invoked

**RuntimeState**: Saved to .claude/state/runs/{session-id}.yaml

**To re-enter Agent Kernel mode**: /kernel

Ready...
```

---

## State Preservation

When exiting kernel mode, any in-progress work is saved:

```yaml
# .claude/state/runs/{session-id}.yaml
session_id: "2026-01-22-143052"
mode: kernel
status: paused  # Was in progress when mode switched
task: "implement rate limiting"
iteration: 3
tuple_snapshot:
  Constraints: [...]
  Invariant: [...]
  Strategy: [...]
  Check: [...]
gradient_history: [...]
exit_reason: "user_mode_switch"
```

This enables resuming work later:

```bash
# Later session
/kernel
# Claude: "Found saved state from previous session. Resume?"
```

---

## When to Exit Kernel Mode

1. **Task complete**: Gradient converged, work done
2. **Need quick answer**: Simple question that doesn't need full machinery
3. **Exploration**: Want raw Claude responses without structure
4. **Benchmark comparison**: Testing chat vs kernel performance
5. **Context reset**: Fresh start without accumulated state

---

## Comparison with Kernel Mode

| Aspect | Chat Mode | Agent Kernel Mode |
|--------|-----------|-------------------|
| **Processing** | Direct | Through `/run` pipeline |
| **State** | Conversation only | RuntimeState + Tuple |
| **Termination** | Manual | Gradient-based |
| **Linear** | No integration | Full integration |
| **Overhead** | None | Tuple machinery |
| **Best for** | Quick tasks, questions | Complex implementations |

---

## Quick Reference

```bash
# Exit kernel mode
/chat

# Check current mode
/mode

# Re-enter kernel mode
/kernel
```

---

## See Also

- [/kernel command](./kernel.md) - Enter Agent Kernel mode
- [/mode command](./mode.md) - Check or switch execution mode
