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
uses_skill: task-managing  # Domain knowledge for classification, priority, tagging
composition:
  # Tier 1: Core tools (always available)
  - tool: linear_createIssue
  - tool: linear_updateIssue
  - tool: linear_searchIssues
  - tool: linear_getIssueById
  - tool: linear_createComment
  - tool: linear_archiveIssue
  - tool: TodoWrite
  # Tier 2-3: Extended tools (via Linear GraphQL API when intent detected)
  # See "Linear Feature Awareness" section for full capability map

# Linear Feature Awareness
# /task-manager is conceptually aware of the FULL Linear API surface.
# When user intent maps to advanced features, use Linear GraphQL API directly.
linear_awareness:
  tier_2_organization:
    projects:
      intents: ["group", "project", "collect", "organize together"]
      examples:
        - 'project add "Cross-Layer Architecture"'
        - 'add SS-57 to project "Cross-Layer"'
        - 'create project for these tasks'
    labels:
      intents: ["label", "tag", "categorize", "mark as"]
      examples:
        - 'label SS-57 architecture'
        - 'tag SS-58 with "backend"'
    cycles:
      intents: ["sprint", "cycle", "week", "iteration", "add to current"]
      examples:
        - 'add SS-57 to current cycle'
        - 'create sprint "Week of Jan 27"'
    relations:
      intents: ["blocks", "blocked by", "parent of", "child of", "relates to", "depends on"]
      examples:
        - 'SS-57 blocks SS-58'
        - 'SS-58 is child of SS-57'
        - 'SS-59 relates to SS-60'
  tier_3_advanced:
    batch:
      intents: ["batch", "bulk", "all of these", "multiple"]
      examples:
        - 'batch add ["Task 1", "Task 2", "Task 3"]'
        - 'update all P3 tasks to P2'
    milestones:
      intents: ["milestone", "checkpoint", "phase"]
      examples:
        - 'add milestone "Phase A Complete" to project'
    reminders:
      intents: ["remind", "follow up", "check back", "ping me"]
      examples:
        - 'remind me about SS-57 in 2 days'
    attachments:
      intents: ["attach", "link spec", "reference file"]
      examples:
        - 'attach spec to SS-57'
        - 'link .claude/specs/cross-layer to SS-57'
    semantic_search:
      intents: ["find anything about", "search for", "related to concept"]
      examples:
        - 'find anything about authentication'
    users:
      intents: ["assign", "assignee", "who is working"]
      examples:
        - 'assign SS-57 to @anak'

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

**Uses Skill**: [task-managing](./../skills/task-managing/SKILL.md) - Domain knowledge for:
- Task vs Project vs Epic classification
- Priority assignment heuristics (Eisenhower matrix)
- Tagging taxonomy best practices
- Dependency modeling patterns
- Sprint planning heuristics

**Design Philosophy**: **Low cognitive energy** - just say what you want. Natural language is the primary interface. Linear handles persistence, UI, and team collaboration.

**Thinking Pattern**: Before executing, `/task-manager` should:
1. **Understand the goal** - What does the user actually want to achieve?
2. **Consult skill** - Apply domain knowledge (classification, priority, tags)
3. **Plan the approach** - Which Linear features best serve this goal?
4. **Be tool-aware** - Know the full Linear API surface (Tier 1-3)
5. **Execute intelligently** - Use the right tool for the job

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

## Thinking Process (Before Execution)

When `/task-manager "some prompt"` is invoked, Claude should reason through:

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. GOAL UNDERSTANDING                                               │
│  What is the user trying to achieve?                                 │
│  - Task tracking? → Tier 1 (CRUD)                                    │
│  - Organization? → Tier 2 (Projects, Labels, Relations)              │
│  - Advanced workflow? → Tier 3 (Batch, Reminders, Semantic)          │
└─────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. INTENT DETECTION                                                 │
│  Which specific operation maps to this goal?                         │
│  - Scan Tier 1 intents (core keywords)                               │
│  - Scan Tier 2 intents (organization keywords)                       │
│  - Scan Tier 3 intents (advanced keywords)                           │
│  - If ambiguous, ask for clarification                               │
└─────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. TOOL SELECTION                                                   │
│  Which tool(s) best serve this intent?                               │
│  - Tier 1: Use MCP tools (composition list)                          │
│  - Tier 2-3: Use Linear GraphQL API                                  │
│  - May require multiple operations (e.g., resolve UUID first)        │
└─────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. EXECUTION & VERIFICATION                                         │
│  Execute the operation and verify success.                           │
│  - Report result to user                                             │
│  - If error, explain what went wrong                                 │
│  - Suggest next steps if applicable                                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Example Thinking**:

```
User: /task-manager "group SS-57, SS-58, SS-59, SS-60 into Cross-Layer project"

1. GOAL: User wants to organize related tasks together
   → Organization (Tier 2)

2. INTENT: Keywords "group" + "project" → project_create + project_assign
   → Need to create project AND add issues to it

3. TOOLS:
   - First: projectCreate mutation (GraphQL)
   - Then: issueUpdate for each issue to set projectId (GraphQL)
   - Need to resolve SS-XX identifiers to UUIDs first

4. EXECUTION:
   a. Create project "Cross-Layer Architecture"
   b. Get project UUID from response
   c. Resolve SS-57, SS-58, SS-59, SS-60 to UUIDs
   d. Update each issue with projectId
   e. Report: "Created project and added 4 issues"
```

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

# Organization (Tier 2)
/task-manager "group SS-57, SS-58, SS-59, SS-60 into a project called Cross-Layer"
/task-manager "SS-57 blocks SS-58"
/task-manager "tag SS-57 as architecture"
/task-manager "add SS-57 to current sprint"
/task-manager "assign SS-57 to @anak"

# Advanced (Tier 3)
/task-manager "remind me about SS-57 tomorrow"
/task-manager "batch create: Task 1, Task 2, Task 3"
/task-manager "find anything related to authentication"
```

### Intent Detection

**Tier 1: Core Intents** (via MCP tools)

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

**Tier 2: Organization Intents** (via Linear GraphQL API)

| You Say | Detected Intent | Linear Action |
|---------|-----------------|---------------|
| "project add X" / "group tasks" | **project_create** | `projectCreate` mutation |
| "add SS-X to project Y" | **project_assign** | `projectUpdate` mutation |
| "label SS-X as Y" / "tag" | **label** | `issueAddLabel` mutation |
| "SS-X blocks SS-Y" | **relation_blocks** | `issueRelationCreate` (blocks) |
| "SS-X parent of SS-Y" | **relation_parent** | `issueRelationCreate` (parent) |
| "add to sprint" / "cycle" | **cycle** | `cycleCreate` or issue update |
| "assign to @user" | **assign** | `issueUpdate` (assignee) |

**Tier 3: Advanced Intents** (via Linear GraphQL API)

| You Say | Detected Intent | Linear Action |
|---------|-----------------|---------------|
| "batch add [...]" | **batch_create** | `issueBatchCreate` mutation |
| "remind me about SS-X" | **reminder** | `issueReminder` mutation |
| "attach spec to SS-X" | **attach** | `attachmentCreate` mutation |
| "find anything about X" | **semantic_search** | `semanticSearch` query |
| "add milestone X" | **milestone** | `projectMilestoneCreate` mutation |

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

## Tier 2-3: Extended Operations (via Linear GraphQL API)

For advanced features not available via MCP tools, `/task-manager` uses the Linear GraphQL API directly. This requires the `LINEAR_API_KEY` from Doppler.

### API Access Pattern

```bash
# Get API key from Doppler
LINEAR_API_KEY=$(doppler secrets get LINEAR_API_KEY --plain)

# Execute GraphQL mutation/query
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "mutation { ... }"}'
```

### Create Project

```bash
/task-manager "project add 'Cross-Layer Architecture'"
```

**Maps to GraphQL**:
```graphql
mutation {
  projectCreate(input: {
    name: "Cross-Layer Architecture"
    teamIds: ["786afd74-3316-459e-a10f-a0f30a0b869e"]
  }) {
    success
    project { id name }
  }
}
```

### Add Issue to Project

```bash
/task-manager "add SS-57 to project 'Cross-Layer Architecture'"
```

**Maps to GraphQL**:
```graphql
mutation {
  issueUpdate(
    id: "<issue-uuid>"
    input: { projectId: "<project-uuid>" }
  ) {
    success
    issue { id identifier project { name } }
  }
}
```

### Create Issue Relation (blocks)

```bash
/task-manager "SS-57 blocks SS-58"
```

**Maps to GraphQL**:
```graphql
mutation {
  issueRelationCreate(input: {
    issueId: "<ss-57-uuid>"
    relatedIssueId: "<ss-58-uuid>"
    type: blocks
  }) {
    success
    issueRelation { id type }
  }
}
```

### Add Label to Issue

```bash
/task-manager "label SS-57 architecture"
```

**Maps to GraphQL**:
```graphql
mutation {
  issueAddLabel(id: "<issue-uuid>", labelId: "<label-uuid>") {
    success
    issue { id labels { nodes { name } } }
  }
}
```

### Issue Relation Types

| Type | Meaning | Example |
|------|---------|---------|
| `blocks` | This issue blocks another | SS-57 blocks SS-58 |
| `duplicate` | This issue duplicates another | SS-57 duplicates SS-60 |
| `related` | Generic relation | SS-57 relates to SS-59 |

### Finding UUIDs

Linear issues have both identifiers (SS-57) and UUIDs. To resolve:

```graphql
query {
  issue(id: "SS-57") {
    id          # UUID
    identifier  # SS-57
    title
  }
}
```

---

## Quick Reference

```bash
# ─────────────────────────────────────────────────────────────
# CRUD Operations (→ Linear Issues) [Tier 1]
# ─────────────────────────────────────────────────────────────
/task-manager add "title" [--priority=P0|P1|P2|P3] [--context="why"]
/task-manager edit "SS-X" [--title=X] [--priority=X]
/task-manager drop "SS-X"

# ─────────────────────────────────────────────────────────────
# State Transitions (→ Linear States) [Tier 1]
# ─────────────────────────────────────────────────────────────
/task-manager start "SS-X"           # → In Progress
/task-manager block "SS-X" "reason"  # → Add blocker comment
/task-manager unblock "SS-X"         # → In Progress
/task-manager defer "SS-X"           # → Backlog
/task-manager done "SS-X"            # → Done

# ─────────────────────────────────────────────────────────────
# Querying (→ Linear Search) [Tier 1]
# ─────────────────────────────────────────────────────────────
/task-manager list [--status=todo,in_progress] [--priority=P0,P1]
/task-manager next                   # Recommend next task
/task-manager status                 # Dashboard summary
/task-manager show "SS-X"            # Show issue details

# ─────────────────────────────────────────────────────────────
# Session Management [Tier 1]
# ─────────────────────────────────────────────────────────────
/task-manager load                   # Load active tasks into context

# ─────────────────────────────────────────────────────────────
# Organization (→ Linear GraphQL) [Tier 2]
# ─────────────────────────────────────────────────────────────
/task-manager project add "Name"              # Create project
/task-manager project SS-X "Project Name"     # Add issue to project
/task-manager label SS-X "label-name"         # Add label to issue
/task-manager unlabel SS-X "label-name"       # Remove label
/task-manager SS-X blocks SS-Y                # Create blocks relation
/task-manager SS-X parent-of SS-Y             # Create parent/child
/task-manager assign SS-X @user               # Assign to user

# ─────────────────────────────────────────────────────────────
# Advanced (→ Linear GraphQL) [Tier 3]
# ─────────────────────────────────────────────────────────────
/task-manager batch add ["Task 1", "Task 2"]  # Bulk create
/task-manager remind SS-X "2 days"            # Set reminder
/task-manager attach SS-X "url-or-file"       # Create attachment
/task-manager find "concept or topic"         # Semantic search
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

## Priority Framework

**See**: [task-managing skill](../.claude/skills/task-managing/SKILL.md) for complete priority framework.

**Quick Reference** (Linear-specific mapping):

| Priority | Name | Linear | Action |
|----------|------|--------|--------|
| **P0** | Crisis | Urgent (1) | Do immediately |
| **P1** | Strategic | High (2) | Schedule this sprint |
| **P2** | Tactical | Normal (3) | Batch or delegate |
| **P3** | Backlog | Low (4) | Defer or drop |

For priority decision heuristics, classification frameworks, and anti-patterns, consult the **task-managing skill**.

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

- [task-managing skill](./../skills/task-managing/SKILL.md) - Domain knowledge for task/project management
- [CLAUDE.md - Principle #0](./../CLAUDE.md) - Linear Task Management
- [Linear MCP Setup](../../docs/guides/linear-mcp-setup.md) - Setup guide
- [Linear App](https://linear.app/ss-automation) - View all tasks
