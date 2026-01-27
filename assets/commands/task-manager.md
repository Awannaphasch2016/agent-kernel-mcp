---
name: task-manager
description: Persistent task management using Linear MCP for team visibility and cross-session continuity
accepts_args: true
arg_schema:
  - name: input
    required: true
    description: "Natural language query OR explicit subcommand. Examples: 'tasks for backtester', 'remember: add rate limiting', 'add \"title\" --priority=P1'"
  - name: additional
    required: false
    description: "Additional arguments for explicit subcommand mode"
composition:
  - tool: linear_createIssue
  - tool: linear_updateIssue
  - tool: linear_searchIssues
  - tool: linear_getIssueById
  - tool: linear_createComment
  - tool: linear_archiveIssue
  - tool: TodoWrite

# Agent Kernel Protocol (Principle #29)
domain: null
tuple_binding:
  slot: Constraints
  effect: manage_tasks
local_check: "Task state persisted in Linear with priority, status, and team visibility"
entities:
  - task (Linear issue)
  - priority (Linear priority 1-4)
  - status (Linear workflow state)
  - context (Linear description)
  - project (Linear label or project)
relations:
  - manages
  - persists
  - tracks
  - prioritizes
---

# Task Manager Command

**Purpose**: Persistent task management using **Linear MCP** as the backend. Enables Claude to track tasks across sessions with rich states, priorities, and **real-time team visibility**.

**Core Principle**: Tasks are visible to the entire team via Linear. No more hidden YAML files - everyone can see what Claude is working on.

**Design Philosophy**: **Low cognitive energy** - just say what you want. Natural language is the primary interface. Linear handles persistence, UI, and team collaboration.

**Backend**: Linear (via MCP) | **Team**: Ss-automation (SS) | **View**: https://linear.app/ss-automation

**When to use**:
- Planning work that spans multiple sessions
- Capturing tasks that can't be done immediately
- Tracking blocked work and blockers
- Prioritizing among competing tasks
- Any work where team needs visibility

**When NOT to use**:
- Single-session, simple tasks (use `TodoWrite` directly)
- Trivial changes that don't need tracking
- Research/exploration tasks (use `/explore`)

---

## Backend: Linear MCP

Tasks are stored as **Linear issues** in the Ss-automation workspace. This provides:

| Feature | Benefit |
|---------|---------|
| **Team visibility** | Everyone sees tasks in Linear app/web |
| **Mobile access** | Linear mobile app for on-the-go updates |
| **History** | Full audit trail of state changes |
| **Comments** | Progress updates, blockers, context |
| **Relations** | Block/blocked-by relationships |
| **Search** | Powerful filtering and querying |

### Linear Configuration

```yaml
Team: Ss-automation
Team ID: 786afd74-3316-459e-a10f-a0f30a0b869e
Key: SS
URL: https://linear.app/ss-automation
```

### State Mapping

| Task Manager State | Linear State | Description |
|-------------------|--------------|-------------|
| `proposed` | Backlog | Idea captured, not committed |
| `ready` | Todo | Ready to start |
| `in_progress` | In Progress | Actively being worked |
| `blocked` | Todo + comment | Cannot proceed (reason in comment) |
| `deferred` | Backlog | Intentionally postponed |
| `done` | Done | Completed |

### Priority Mapping

| Task Manager | Linear | Description |
|--------------|--------|-------------|
| **P0** (Crisis) | 1 (Urgent) | Do immediately |
| **P1** (Strategic) | 2 (High) | Schedule (most valuable) |
| **P2** (Tactical) | 3 (Normal) | Batch or automate |
| **P3** (Backlog) | 4 (Low) | Defer or drop |

---

## Natural Language Interface (Primary)

**Just say what you want** - Claude interprets your intent and executes the appropriate Linear operation.

### Quick Examples

```bash
# Query tasks
/task-manager "what tasks relate to backtester?"
/task-manager "show me blocked tasks"
/task-manager "tasks for the API feature"

# Create tasks
/task-manager "remember: need to add rate limiting"
/task-manager "save for later: optimize database queries"
/task-manager "add task: implement user auth"

# Update status
/task-manager "I finished the API implementation"
/task-manager "done with backtester API"
/task-manager "completed the login feature"

# Block/defer
/task-manager "blocked on database schema, waiting for review"
/task-manager "park the optimization work until after launch"
/task-manager "defer caching until we have performance metrics"

# Session management
/task-manager "what should I work on?"
/task-manager "load my tasks"
```

### Intent Detection

| You Say | Detected Intent | Linear Action |
|---------|-----------------|---------------|
| "tasks for X" / "show X tasks" | **query** | `linear_searchIssues` |
| "remember:" / "add task:" | **create** | `linear_createIssue` |
| "save for later:" / "park:" | **defer** | `linear_updateIssue` → Backlog |
| "done with" / "finished" | **complete** | `linear_updateIssue` → Done |
| "blocked on" / "stuck on" | **block** | `linear_createComment` |
| "unblocked" / "resolved" | **unblock** | `linear_updateIssue` → In Progress |
| "what's next?" | **recommend** | `linear_searchIssues` (priority sort) |
| "load" / "status" | **load** | `linear_searchIssues` (active) |

---

## Implementation: Linear MCP Tool Mapping

### Create Task

```bash
/task-manager "remember: add rate limiting for API"
```

**Maps to**:
```
linear_createIssue(
  title: "Add rate limiting for API",
  teamId: "786afd74-3316-459e-a10f-a0f30a0b869e",
  description: "Context: API protection\n\nCreated via /task-manager",
  priority: 3  # P2 = Normal
)
```

### Start Task

```bash
/task-manager "starting work on SS-6"
```

**Maps to**:
```
linear_updateIssue(
  id: "SS-6",
  stateId: "ab2e480e-662f-46fc-9616-d0ddab2f6f30"  # In Progress
)
```

### Block Task

```bash
/task-manager "blocked on SS-6, waiting for API credentials"
```

**Maps to**:
```
linear_createComment(
  issueId: "SS-6",
  body: "🔴 **Blocked**: Waiting for API credentials"
)
```

### Complete Task

```bash
/task-manager "finished SS-6"
```

**Maps to**:
```
linear_updateIssue(
  id: "SS-6",
  stateId: "f2057f94-6a05-4640-aaf6-2510188d7c86"  # Done
)
```

### Query Tasks

```bash
/task-manager "what's in progress?"
```

**Maps to**:
```
linear_searchIssues(
  teamId: "786afd74-3316-459e-a10f-a0f30a0b869e",
  states: ["In Progress"]
)
```

### Get Recommendation

```bash
/task-manager "what should I work on next?"
```

**Maps to**:
```
linear_searchIssues(
  teamId: "786afd74-3316-459e-a10f-a0f30a0b869e",
  states: ["Todo"],
  limit: 5
)
# Then sort by priority and return highest
```

---

## Quick Reference

```bash
# ─────────────────────────────────────────────────────────────
# CRUD Operations (→ Linear Issues)
# ─────────────────────────────────────────────────────────────
/task-manager add "title" [--priority=P0|P1|P2|P3] [--context="why"]
/task-manager edit "SS-X" [--title=X] [--priority=X]
/task-manager drop "SS-X"

# ─────────────────────────────────────────────────────────────
# State Transitions (→ Linear States)
# ─────────────────────────────────────────────────────────────
/task-manager start "SS-X"           # → In Progress
/task-manager block "SS-X" "reason"  # → Add blocker comment
/task-manager unblock "SS-X"         # → In Progress
/task-manager defer "SS-X"           # → Backlog
/task-manager done "SS-X"            # → Done

# ─────────────────────────────────────────────────────────────
# Querying (→ Linear Search)
# ─────────────────────────────────────────────────────────────
/task-manager list [--status=todo,in_progress] [--priority=P0,P1]
/task-manager next                   # Recommend next task
/task-manager status                 # Dashboard summary
/task-manager show "SS-X"            # Show issue details

# ─────────────────────────────────────────────────────────────
# Session Management
# ─────────────────────────────────────────────────────────────
/task-manager load                   # Load active tasks into context
```

---

## Linear Workflow States

| State | Type | ID | Color |
|-------|------|-----|-------|
| Backlog | backlog | `585aeb63-c930-421f-8ebe-a47ca54f0cb8` | Gray |
| Todo | unstarted | `8329ed7c-6a8e-42d3-8c08-d1381fbbd3ad` | Light Gray |
| In Progress | started | `ab2e480e-662f-46fc-9616-d0ddab2f6f30` | Yellow |
| Done | completed | `f2057f94-6a05-4640-aaf6-2510188d7c86` | Purple |
| Canceled | canceled | `2dfc7eec-f817-45b6-9bc8-985480d1968a` | Gray |

---

## Priority Framework (Eisenhower-Inspired)

| Priority | Name | Linear | Action | Examples |
|----------|------|--------|--------|----------|
| **P0** | Crisis | Urgent (1) | Do immediately | Production bug, security issue |
| **P1** | Strategic | High (2) | Schedule (most valuable) | Core features, architecture |
| **P2** | Tactical | Normal (3) | Batch or automate | Minor fixes, cleanup |
| **P3** | Backlog | Low (4) | Defer or drop | Nice-to-have, experiments |

```
                    IMPORTANT
                        │
            ┌───────────┼───────────┐
            │           │           │
            │    P1     │    P0     │
            │ Strategic │  Crisis   │
            │ (Schedule)│ (Do Now)  │
    NOT     │           │           │     URGENT
   URGENT───┼───────────┼───────────┼───URGENT
            │           │           │
            │    P3     │    P2     │
            │  Backlog  │ Tactical  │
            │  (Defer)  │  (Batch)  │
            │           │           │
            └───────────┼───────────┘
                        │
                  NOT IMPORTANT
```

---

## Tuple Effects (Universal Kernel Integration)

**Mode Type**: `task_management`

`/task-manager` affects the Thinking Tuple's **Constraints** slot:

| Tuple Component | Effect |
|-----------------|--------|
| **Constraints** | **POPULATE**: Active Linear issues become "what we have to do" |
| **Invariant** | **LINK**: Issue description defines success criteria |
| **Principles** | NONE |
| **Strategy** | **INFORM**: Issue priority influences action order |
| **Check** | **LINK**: Issue completion = acceptance verified |

**Tasks as Constraints** (from Linear):
```yaml
# On /task-manager load
Constraints:
  active_tasks:
    - id: SS-6
      title: "Implement /task-manager with Linear MCP backend"
      state: In Progress
      priority: Urgent
      url: https://linear.app/ss-automation/issue/SS-6
```

---

## Local Check (Mode Completion Criteria)

| Subcommand | Completion Criterion |
|------------|---------------------|
| `add` | Linear issue created, URL returned |
| `start` | Issue state changed to In Progress |
| `done` | Issue state changed to Done |
| `list` | Issues fetched and displayed |
| `load` | Context loaded, TodoWrite synced |

---

## Examples

### Example 1: Create Task

```bash
/task-manager "remember: need to add rate limiting for API protection"

# Claude executes:
linear_createIssue(
  title: "Add rate limiting for API protection",
  teamId: "786afd74-3316-459e-a10f-a0f30a0b869e",
  description: "Context: API protection",
  priority: 3
)

# Output:
✅ Created: SS-7 "Add rate limiting for API protection"
   Priority: P2 (Normal)
   URL: https://linear.app/ss-automation/issue/SS-7
```

### Example 2: Query In-Progress Tasks

```bash
/task-manager "what's in progress?"

# Claude executes:
linear_searchIssues(
  teamId: "786afd74-3316-459e-a10f-a0f30a0b869e",
  states: ["In Progress"]
)

# Output:
📋 IN PROGRESS TASKS (2)

🟠 P1 (High)
  SS-6: Implement /task-manager with Linear MCP backend
        https://linear.app/ss-automation/issue/SS-6

🟡 P2 (Normal)
  SS-5: Test Linear MCP integration
        https://linear.app/ss-automation/issue/SS-5
```

### Example 3: Complete Task

```bash
/task-manager "finished SS-6"

# Claude executes:
linear_updateIssue(
  id: "SS-6",
  stateId: "f2057f94-6a05-4640-aaf6-2510188d7c86"
)

# Output:
✅ Completed: SS-6 "Implement /task-manager with Linear MCP backend"
   View: https://linear.app/ss-automation/issue/SS-6
```

### Example 4: Block with Reason

```bash
/task-manager "blocked on SS-7, waiting for API credentials"

# Claude executes:
linear_createComment(
  issueId: "SS-7",
  body: "🔴 **Blocked**: Waiting for API credentials\n\n_Added via /task-manager_"
)

# Output:
🔴 Blocked: SS-7 "Add rate limiting for API protection"
   Reason: Waiting for API credentials
   View: https://linear.app/ss-automation/issue/SS-7
```

### Example 5: Load Context

```bash
/task-manager load

# Claude executes:
linear_searchIssues(
  teamId: "786afd74-3316-459e-a10f-a0f30a0b869e",
  states: ["Todo", "In Progress"],
  limit: 20
)

# Output:
📥 LOADED TASK CONTEXT

Active Tasks (3):
  🔵 SS-6: Implement /task-manager with Linear MCP backend [In Progress, P1]
  ⬜ SS-7: Add rate limiting for API protection [Todo, P2]
  ⬜ SS-8: Write unit tests [Todo, P3]

View all: https://linear.app/ss-automation
```

---

## Migration from YAML

If you have existing tasks in `.claude/tasks/tasks.yaml`, they can be migrated to Linear:

```bash
/task-manager migrate
```

This creates Linear issues for each task and archives the YAML file.

**Note**: Going forward, all tasks are stored in Linear. The YAML backend is deprecated.

---

## Agent Kernel Integration

### Integration Points

| Component | Integration | Details |
|-----------|-------------|---------|
| **Thinking Tuple** | Tasks are Constraints | Active issues → "what to do" |
| **TodoWrite** | Sync display | in_progress issues mirror to TodoWrite |
| **Linear MCP** | Primary backend | All persistence via Linear API |
| **`/journal`** | Auto-journal option | Task completion → journal entry |
| **`/decompose`** | Task creation | Decomposition → create issues |

### Session Start Hook (Recommended)

```bash
# At session start
/task-manager load
```

This loads active Linear issues into context and syncs with TodoWrite for visibility.

---

## Error Handling

| Error | Response |
|-------|----------|
| Issue not found | Search by title, suggest similar issues |
| Invalid state transition | Show valid transitions from current state |
| Linear API error | Show error, suggest retry |
| Network error | Fallback to cached state if available |

---

## Related Commands

| Command | Relationship |
|---------|--------------|
| `/decompose` | Can create issues from decomposition |
| `/journal` | Task completion prompts journaling |
| `/step` | Tasks inform Constraints slot |

---

## See Also

- [CLAUDE.md - Principle #0](./../CLAUDE.md) - Linear Task Management
- [Linear MCP Setup](../../docs/guides/linear-mcp-setup.md) - Setup guide
- [Linear App](https://linear.app/ss-automation) - View all tasks
