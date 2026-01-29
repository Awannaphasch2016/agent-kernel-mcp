# /orchestrate - Supervisor-Worker Parallel Execution

## Overview

Execute complex tasks using the supervisor-worker pattern. The supervisor decomposes tasks into work units, coordinates parallel worker agents, handles failures, and synthesizes results.

## Usage

```bash
/orchestrate "refactor authentication module to use OAuth2"
/orchestrate by_domain "analyze codebase for security issues"
/orchestrate by_file max_workers=8 "update all test files to use new mocking pattern"
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `task` | string | (required) | The task to execute |
| `decomposition` | enum | `auto` | How to break task into work units |
| `max_workers` | number | `5` | Maximum parallel workers (max 10) |
| `failure_mode` | enum | `retry` | How to handle worker failures |

### Decomposition Modes

| Mode | When to Use |
|------|-------------|
| `auto` | Let supervisor decide based on task |
| `by_domain` | Task spans multiple domains (auth, db, cache) |
| `by_file` | Task involves multiple files/directories |
| `by_phase` | Task has clear phases (gather, analyze, report) |
| `by_concern` | Task has orthogonal concerns (security, performance) |

### Failure Modes

| Mode | Behavior |
|------|----------|
| `retry` | Retry failed workers up to 2 times |
| `reassign` | Assign failed work to different worker |
| `fail_fast` | Stop on first worker failure |

## Execution Flow

```
1. PLANNING (Supervisor)
   - Analyze task complexity
   - Decompose into work units
   - Identify dependencies
   - Create execution plan

2. WAVE EXECUTION
   Wave 1: [Independent units] → parallel workers
   Wave 2: [Units depending on Wave 1] → parallel workers
   ...

3. GATHERING
   - Collect all worker outputs
   - Validate completeness
   - Detect conflicts

4. SYNTHESIS (Supervisor)
   - Merge results into ThinkingTuple
   - Resolve conflicts
   - Produce final output
```

## Work Unit Types

| Type | Description | Example |
|------|-------------|---------|
| `exploration` | Find information | "Identify auth patterns in codebase" |
| `verification` | Check claims | "Verify no SQL injection vulnerabilities" |
| `generation` | Produce output | "Write OAuth2 client implementation" |
| `transformation` | Convert format | "Update all auth calls to new API" |

## Examples

### Example 1: Multi-Domain Analysis

```bash
/orchestrate by_domain "analyze system for performance issues"

# Creates workers for each domain:
# - Worker 1: Database query analysis
# - Worker 2: API endpoint latency
# - Worker 3: Frontend rendering performance
# - Worker 4: Caching efficiency
```

### Example 2: Large Refactoring

```bash
/orchestrate by_file max_workers=8 "update logging to use new structured format"

# Creates workers for file groups:
# - Worker 1: src/api/*.py
# - Worker 2: src/services/*.py
# - Worker 3: src/utils/*.py
# - Worker 4: tests/*.py
# ...
```

### Example 3: Phased Implementation

```bash
/orchestrate by_phase "implement new feature: user analytics"

# Creates workers for each phase:
# - Wave 1: Research existing analytics patterns
# - Wave 2: Design data model and API
# - Wave 3: Implement backend + frontend
# - Wave 4: Write tests + documentation
```

## Output

The command produces:
1. **Execution log** - Trace of supervisor decisions
2. **Work unit results** - Output from each worker
3. **Synthesis report** - Unified findings
4. **ThinkingTuple** - Populated with results

## Constraints

- **Max 10 workers** (Claude Code limitation)
- **No nested delegation** (workers cannot spawn sub-workers)
- **File-based communication** (workers write outputs to files)

## Tuple Binding

```yaml
tuple_binding:
  slot: all
  effect: orchestrate_parallel
```

The supervisor routes worker outputs to appropriate tuple slots based on work unit type.

## Related

- [/run](run.md) - Gradient-based loop execution
- [/step](step.md) - Single tuple iteration
- [/decompose](decompose.md) - Break problems into parts
- [Supervisor-Worker Pattern](../patterns/supervisor-worker.md)

## Protocol Reference

- Schema: [kernel/schema.yaml](../kernel/schema.yaml) - Agent, WorkUnit, AgentPool types
- Pattern: [patterns/supervisor-worker.md](../patterns/supervisor-worker.md)
