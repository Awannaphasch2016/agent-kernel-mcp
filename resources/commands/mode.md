---
name: mode
description: Check current execution mode or switch between chat and kernel modes
accepts_args: true
arg_schema:
  - name: target_mode
    required: false
    description: Mode to switch to (chat or kernel). If omitted, shows current mode.

# Agent Kernel Protocol (Principle #29)
domain: null
tuple_binding:
  slot: All
  effect: mode_query_or_switch
local_check: "Mode displayed or switched successfully"
entities:
  - mode
  - session
relations:
  - queries
  - switches
---

# Mode Command (Check or Switch Execution Mode)

**Purpose**: Display the current execution mode or switch between chat and kernel modes.

---

## Usage

```bash
# Check current mode
/mode

# Switch to kernel mode
/mode kernel

# Switch to chat mode
/mode chat
```

---

## Check Current Mode

When invoked without arguments, displays the current execution context:

```bash
/mode
```

### Output (Chat Mode)

```
═══════════════════════════════════════════════════════════════
CURRENT MODE: Chat
═══════════════════════════════════════════════════════════════

**Context**: Normal conversational Claude

**Behavior**:
- Prompts processed directly
- No tuple machinery
- No Linear integration
- No gradient tracking

**Switch to Agent Kernel**: /mode kernel or /kernel
```

### Output (Agent Kernel Mode)

```
═══════════════════════════════════════════════════════════════
CURRENT MODE: Agent Kernel
═══════════════════════════════════════════════════════════════

**Context**: Full Thinking Tuple protocol

**Active protocols**:
- Thinking Tuple Protocol (Principle #26)
- Gradient-based termination
- Linear integration (team: Ss-automation)
- RuntimeState persistence

**Current state**:
- Iteration: 3
- Task: "implement rate limiting"
- Gradient: significant (knowledge=YES, evidence=NO)

**Switch to Chat**: /mode chat or /chat
```

---

## Switch Mode

When invoked with a target mode, switches execution context:

```bash
# Enter kernel mode
/mode kernel

# Exit to chat mode
/mode chat
```

These are equivalent to:
- `/mode kernel` = `/kernel`
- `/mode chat` = `/chat`

---

## Mode Definitions

### Chat Mode (Default)

The baseline execution context:

| Property | Value |
|----------|-------|
| Prompt routing | Direct to Claude |
| State management | Conversation only |
| Termination | User-controlled |
| Team visibility | None |
| Best for | Quick tasks, questions, exploration |

### Agent Kernel Mode

The enhanced execution context:

| Property | Value |
|----------|-------|
| Prompt routing | Through `/run` → `/step` → primitives |
| State management | RuntimeState + Tuple snapshots |
| Termination | Gradient-based convergence |
| Team visibility | Linear integration |
| Best for | Complex implementations, spec-driven work |

---

## Mode Comparison Table

| Aspect | Chat | Agent Kernel |
|--------|------|--------------|
| **Overhead** | None | Tuple machinery |
| **Consistency** | Variable | Structured |
| **Observability** | Conversation | Full trace |
| **Recovery** | Manual | Automatic |
| **Benchmarking** | Baseline | Enhanced |

---

## Why Two Modes?

### 1. Right Tool for the Job

Not every task needs the full Agent Kernel machinery:
- **Quick questions**: Chat mode is faster
- **Complex implementations**: Kernel mode is more reliable

### 2. Benchmarking

Chat mode serves as a baseline to measure Agent Kernel's value:

```
Performance(Kernel) - Performance(Chat) = Agent Kernel Value Add
```

### 3. User Agency

Explicit mode choice gives you control over execution context, rather than heuristics guessing which mode you need.

### 4. Mental Model Clarity

You always know which mode you're in:
- Chat mode: "I'm talking to Claude"
- Kernel mode: "Claude is running my Agent Kernel protocol"

---

## Quick Reference

```bash
# Check current mode
/mode

# Enter kernel mode
/mode kernel    # or /kernel

# Enter chat mode
/mode chat      # or /chat

# Enter kernel and start task
/kernel "task"  # shorthand for mode + run
```

---

## See Also

- [/kernel command](./kernel.md) - Enter Agent Kernel mode
- [/chat command](./chat.md) - Return to chat mode
- [/run command](./run.md) - Execute tasks in kernel mode
