# Custom Subagents

This directory contains custom subagent definitions for multi-agent orchestration.

## Registered Agents

| Agent | Type | Purpose | Max Concurrent |
|-------|------|---------|----------------|
| [explorer](explorer.md) | Explore | Parallel codebase investigation | 3 |
| [verifier](verifier.md) | general-purpose | Scatter-gather validation | 4 |
| [worker](worker.md) | general-purpose | Supervisor-worker execution | 10 |
| [pipeline-stage](pipeline-stage.md) | general-purpose | Pipeline stage execution | 10 |

## How Agents Work

### Agent File Format

Each `.md` file defines an agent with YAML frontmatter:

```yaml
---
name: agent-name
description: What this agent does
subagent_type: Explore | general-purpose | Bash | Plan
max_concurrent: 10
specialization: domain_name
tuple_binding:
  slot: Constraints | Invariant | Strategy | Check | all
  effect: expand | define | plan | verify | execute
---
```

### Spawning Agents

Agents are spawned via Claude Code's **Task tool**:

```
Task(
  subagent_type: "Explore",  # Built-in type
  prompt: "Find all auth patterns in codebase",
  description: "Search auth"
)
```

The agent definition in this directory provides:
- **Documentation** of the agent's purpose
- **Output schema** expectations
- **Integration** with ThinkingTuple

### Parallel Execution

**CRITICAL**: To run agents in parallel, all Task calls must be in a **SINGLE message**:

```
# PARALLEL (correct)
Message contains:
  Task(...), Task(...), Task(...)

# SEQUENTIAL (wrong - agents run one at a time)
Message 1: Task(...)
Message 2: Task(...)
Message 3: Task(...)
```

## Multi-Agent Patterns

### 1. Parallel Explore

Launch multiple explorers for independent subtasks:
```
Task(subagent_type: "Explore", prompt: "Find auth patterns")
Task(subagent_type: "Explore", prompt: "Find API endpoints")
Task(subagent_type: "Explore", prompt: "Find database queries")
```

### 2. Scatter-Gather

Launch verifiers per domain layer, aggregate results:
```
Task(prompt: "Verify Layer 1 (Elements)")
Task(prompt: "Verify Layer 2 (Appearance)")
Task(prompt: "Verify Layer 3 (Spatial)")
Task(prompt: "Verify Layer 4 (Behavior)")
→ Weighted aggregation: delta = sum(w * layer_delta)
```

### 3. Supervisor-Worker

Supervisor decomposes task, workers execute in waves:
```
Supervisor: Decompose "refactor auth" into 6 work units
Wave 1: [WU1, WU2] parallel → Task(...), Task(...)
Wave 2: [WU3, WU4, WU5] parallel → Task(...), Task(...), Task(...)
Wave 3: [WU6] sequential → Task(...)
Supervisor: Synthesize results
```

### 4. Pipeline Parallel

Sequential stages with parallel agents per stage:
```
Stage 1: Task(...), Task(...), Task(...) [parallel]
  → Barrier: Wait all
Stage 2: Task(...), Task(...) [parallel]
  → Barrier: Wait all
Stage 3: Task(...) [single]
```

## Constraints

| Constraint | Limit | Workaround |
|------------|-------|------------|
| Max concurrent agents | 10 | Use wave execution |
| No agent nesting | N/A | Flat parallelism only |
| Context per agent | ~200k | Use file-based passing |
| Communication | Files only | Write/read from .claude/state/ |

## Integration with Commands

| Command | Pattern Used | Agents Spawned |
|---------|--------------|----------------|
| `/orchestrate` | Supervisor-Worker | workers (1-10) |
| `/analysis` | Pipeline | pipeline-stage (per stage) |
| `/validate` | Scatter-Gather | verifiers (per layer) |

## See Also

- [Patterns](../patterns/README.md) - Pattern documentation
- [Kernel Schema](../kernel/schema.yaml) - Agent type definitions
- [Commands](../commands/orchestrate.md) - /orchestrate command
