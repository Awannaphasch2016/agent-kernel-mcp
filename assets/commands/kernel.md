---
name: kernel
description: Enter Agent Kernel mode - full Thinking Tuple protocol with gradient-based execution for all prompts
accepts_args: true
arg_schema:
  - name: task
    required: false
    description: Optional task to start executing immediately after entering kernel mode

# Agent Kernel Protocol (Principle #29)
domain: null
tuple_binding:
  slot: All
  effect: mode_switch
local_check: "Mode switched to Agent Kernel, all prompts route through /run"
entities:
  - mode
  - session
  - runtime_state
relations:
  - activates
  - configures
---

# Kernel Command (Enter Agent Kernel Mode)

**Purpose**: Enter Agent Kernel mode where all prompts are processed through the full Thinking Tuple protocol with gradient-based execution.

**Core Insight**: Agent Kernel mode is a distinct execution context from normal chat. In this mode, every prompt—not just explicit `/run` calls—goes through the full Agent Kernel machinery.

---

## What is Agent Kernel Mode?

Agent Kernel mode is an **execution context** where Claude operates with:

- **Full Tuple Protocol**: Every prompt instantiates a Thinking Tuple
- **Gradient-Based Termination**: Tasks continue until learning stops
- **Linear Integration**: Work is visible to the team
- **RuntimeState Persistence**: Progress is tracked and recoverable
- **Spec-Driven Development**: Invariants guide completion criteria

### Mode Comparison

| Aspect | Chat Mode (Default) | Agent Kernel Mode |
|--------|---------------------|-------------------|
| **Prompt Processing** | Direct response | Through `/run` → `/step` → primitives |
| **State Tracking** | Conversation only | RuntimeState + Tuple snapshots |
| **Termination** | User ends conversation | Gradient-based convergence |
| **Team Visibility** | None | Linear integration |
| **Checkpoints** | None | User checkpoints on ambiguity |
| **Recovery** | Manual context restoration | Automatic state persistence |

---

## Usage

```bash
# Enter Agent Kernel mode
/kernel

# Enter and immediately start a task
/kernel "implement rate limiting"

# Enter with Linear issue
/kernel SS-19
```

---

## What Happens When You Enter

1. **Mode Switch**: Session transitions to Agent Kernel context
2. **State Initialization**: RuntimeState created for session
3. **Prompt Routing**: All subsequent prompts route through `/run`
4. **Confirmation**: Claude confirms mode entry

### Entry Confirmation

```
═══════════════════════════════════════════════════════════════
AGENT KERNEL MODE ACTIVATED
═══════════════════════════════════════════════════════════════

Session is now in Agent Kernel mode.

**Active protocols**:
- Thinking Tuple Protocol (Principle #26)
- Gradient-based termination
- Linear integration (team: Ss-automation)
- RuntimeState persistence

**Behavior changes**:
- All prompts processed through /run → /step pipeline
- Tasks continue until gradient becomes insignificant
- Checkpoints triggered on critical ambiguity
- Progress updates posted to Linear

**To exit**: /chat or /mode chat

Ready for task...
```

---

## Prompt Routing in Agent Kernel Mode

When in Agent Kernel mode, prompts are automatically wrapped:

```
User: "implement rate limiting"

↓ (Agent Kernel mode transforms to)

/run "implement rate limiting"

↓ (which executes)

/step → primitives → gradient evaluation → ...
```

### What Gets Routed

| Prompt Type | In Chat Mode | In Kernel Mode |
|-------------|--------------|----------------|
| Natural language task | Direct response | `/run "task"` |
| Question | Direct answer | `/step` with understand intent |
| `/run` explicit | Full `/run` | Full `/run` (unchanged) |
| `/step` explicit | Full `/step` | Full `/step` (unchanged) |
| `/chat` | No-op | Exit kernel mode |
| Other slash commands | Execute command | Execute command |

### Commands That Bypass Routing

Some commands execute directly even in Kernel mode:
- `/chat` - Exit kernel mode
- `/mode` - Check/switch mode
- `/help` - Show help
- Utility commands (`/wt-*`, `/list-*`, etc.)

---

## With Task Argument

If you provide a task argument, execution starts immediately:

```bash
/kernel "refactor the authentication module"
```

Equivalent to:
```bash
/kernel
/run "refactor the authentication module"
```

---

## With Linear Issue

If you provide a Linear issue ID, enters kernel mode and seeds from that issue:

```bash
/kernel SS-19
```

Equivalent to:
```bash
/kernel
/run SS-19
```

---

## Exit Kernel Mode

To return to normal chat mode:

```bash
/chat
# or
/mode chat
```

See [/chat command](./chat.md) for details.

---

## Why Use Agent Kernel Mode?

### Use Cases

1. **Complex implementation tasks**: Multi-step work that benefits from structured reasoning
2. **Team-visible work**: When teammates need to track progress in Linear
3. **Long-running sessions**: Where state persistence and recovery matter
4. **Spec-driven development**: When working from PRDs and invariants

### When NOT to Use

1. **Quick questions**: "What does this function do?"
2. **Simple edits**: "Add a log statement here"
3. **Exploration without commitment**: "What options do we have for X?"
4. **Learning/research**: When you want raw Claude responses

---

## Benchmark Value

Keeping chat mode as the default provides a **baseline** for measuring Agent Kernel's value:

```
Chat mode performance:    Baseline (vanilla Claude)
Kernel mode performance:  Enhanced (your system)

Δ = Kernel - Chat = Agent Kernel's value add
```

This measurable delta helps you:
- Validate the Agent Kernel improves outcomes
- Identify which tasks benefit most from structured reasoning
- Tune the protocols based on evidence

---

## Quick Reference

```bash
# Enter kernel mode
/kernel

# Enter and start task
/kernel "implement feature X"

# Enter with Linear issue
/kernel SS-19

# Check current mode
/mode

# Exit kernel mode
/chat
```

---

## See Also

- [/chat command](./chat.md) - Return to chat mode
- [/mode command](./mode.md) - Check or switch execution mode
- [/run command](./run.md) - The execution engine used in kernel mode
- [/step command](./step.md) - Single tuple execution
- [CLAUDE.md - Principle #26](../CLAUDE.md) - Thinking Tuple Protocol
