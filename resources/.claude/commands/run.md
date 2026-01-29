---
name: run
description: Execute /step in a loop with gradient-based termination—the thinking engine that runs until Claude stops learning. Supports Linear-seeded execution and user checkpoints.
accepts_args: true
composition:
  - meta
  - tool: linear_getIssueById
  - tool: linear_updateIssue
  - tool: linear_createComment
  - tool: linear_searchIssues
  - tool: AskUserQuestion

# Agent Kernel Protocol (Principle #29)
domain: null
tuple_binding:
  slot: All
  effect: loop
local_check: "Gradient insignificant or invariant satisfied with termination reason documented"
entities:
  - gradient
  - iteration
  - runtime_state
  - termination
  - linear_issue
  - spec
  - checkpoint
relations:
  - loops
  - evaluates
  - terminates
  - persists
  - seeds
  - completes
  - pauses
  - resumes
---

# Run Command (Thinking Engine)

**Purpose**: Execute `/step` in a loop with gradient-based termination—the "thinking engine" that runs until Claude stops learning. Optionally seeded by Linear issues for team-visible autonomous execution.

**Core Principle**: Terminate when gradient becomes insignificant, not after fixed iterations. This enables adaptive thinking that stops when it should, not when an arbitrary counter says so.

**When to use**:
- Complex tasks requiring multiple thinking iterations
- Tasks where you don't know how many steps needed
- When you want autonomous goal pursuit
- Long-running reasoning that should self-terminate
- **Linear-seeded work**: Working on team-visible tasks from backlog

**When NOT to use**:
- Simple single-step tasks (use `/step` directly)
- When you need manual control of each iteration
- Quick lookups or single queries

---

## Linear-Seeded Execution (Primary Mode)

**Core Insight**: Linear issues are the team-visible backlog. `/run` can be seeded by a Linear issue, creating a closed loop: Linear (what to do) → Spec (how to know done) → Commands (how to think) → `/run` (execution) → Linear (completion).

### Input Modes

```bash
# Mode 1: Free-form task (original)
/run "implement user authentication"

# Mode 2: Linear issue ID (new - preferred for team visibility)
/run SS-19

# Mode 3: Next from backlog (new - auto-select highest priority)
/run next
```

### Linear-Seeded Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  /run SS-19                                                          │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ 1. SEED PHASE
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Fetch Linear Issue                                                  │
│  - linear_getIssueById("SS-19")                                      │
│  - Extract: title, description, priority, labels                     │
│  - Update: state → "In Progress"                                     │
│  - Comment: "🤖 Starting work on this issue"                         │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ 2. SPEC PHASE
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Check/Create Spec                                                   │
│  - Check: Does .claude/specs/{slug}/ exist?                          │
│  - If NO: Create minimal spec from issue description                 │
│  - If YES: Load existing spec (invariants, constraints, acceptance)  │
│  - Spec becomes Invariant for termination                            │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ 3. EXECUTE PHASE (gradient loop)
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Adaptive /step Loop                                                 │
│  - /step routes to commands based on needs:                          │
│    - Need info? → /explore, /understand                              │
│    - Need plan? → /decompose, /what-if                               │
│    - Need verify? → /validate, /invariant                            │
│    - Need code? → Write, Edit tools                                  │
│  - Milestone comments → Linear (every significant progress)          │
│  - Gradient evaluation → continue or terminate                       │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ 4. COMPLETE PHASE
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Update Linear                                                       │
│  - Comment: Summary of what was done                                 │
│  - If invariant satisfied: state → "Done"                            │
│  - If blocked: Comment blocker, state stays "In Progress"            │
│  - If converged (partial): Comment progress, suggest next steps      │
└─────────────────────────────────────────────────────────────────────┘
```

### Seed Phase: Issue to Constraints

Linear issue fields map to Thinking Tuple Constraints:

| Linear Field | Tuple Constraint |
|--------------|------------------|
| `title` | Task goal (what to achieve) |
| `description` | Context, requirements, acceptance hints |
| `priority` | Urgency (affects Strategy aggressiveness) |
| `labels` | Domain/project context |
| `parent` | Scope boundary (if subtask) |
| `comments` | Prior context, blockers, decisions |

```yaml
# Example: Seeding from SS-19
Constraints:
  goal: "Module A: Implement intent classification engine"
  context: |
    From Linear issue description:
    - Part of LinkedIn bot module
    - Must classify incoming messages into intents
    - Intents: greeting, question, objection, interest, other
  priority: High (P1)
  labels: ["module-a", "llm"]
  prior_comments:
    - "Related to SS-20 (reply generator)"
```

### Spec Phase: Issue to Invariant

If spec exists (`.claude/specs/{slug}/`), load it as Invariant:

```yaml
# Spec provides structured completion criteria
Invariant:
  from_spec: ".claude/specs/intent-classification/invariants.md"
  levels:
    L0_user: "Agent can classify message intent correctly"
    L1_service: "Classification endpoint returns valid intent enum"
    L2_data: "Classification confidence > 0.8 for clear intents"
    L3_infra: "LLM calls traced in observability"
    L4_config: "Prompt template version controlled"
```

If no spec exists, create minimal invariant from issue description:

```yaml
# Auto-generated from issue description
Invariant:
  derived_from: "SS-19 description"
  success_criteria:
    - "Intent classification engine implemented"
    - "Handles: greeting, question, objection, interest, other"
    - "Integrated with message handler"
  evidence_required: "Layer 2 (functional verification)"
```

### Execute Phase: Adaptive Command Routing

During the gradient loop, `/step` routes to appropriate commands based on current needs:

| Situation | Command Routed | Purpose |
|-----------|----------------|---------|
| Don't understand requirements | `/understand` | Build mental model |
| Need to explore options | `/explore` | Divergent search |
| Need to compare approaches | `/what-if` | Evaluate alternatives |
| Need to break down task | `/decompose` | Create subtasks |
| Need to validate approach | `/validate` | Check correctness |
| Need to verify invariants | `/invariant` | Generate checklist |
| Code implementation | Write, Edit tools | Create artifacts |
| Test implementation | Bash (pytest) | Execute tests |

**Milestone Comments**: At significant progress points, post to Linear:

```markdown
# Linear comment (auto-posted)
🔄 **Progress Update** (Iteration 3)

✅ Completed:
- Explored 3 classification approaches (rule-based, LLM, hybrid)
- Selected LLM approach with confidence scoring

🔜 Next:
- Implement classification prompt template
- Create integration tests
```

### Complete Phase: Closing the Loop

Based on termination reason, update Linear accordingly:

| Termination | Linear Action |
|-------------|---------------|
| **Invariant satisfied** | State → Done, summary comment |
| **Blocked** | Keep In Progress, blocker comment |
| **Converged (partial)** | Keep In Progress, progress comment |
| **Max iterations** | Keep In Progress, timeout comment |
| **User interrupt** | Keep In Progress, paused comment |

```markdown
# Example: Success completion comment
✅ **Issue Completed**

**Summary**: Implemented intent classification engine using LLM-based approach.

**Artifacts**:
- `src/linkedin_bot/intent_classifier.py` - Main classification logic
- `src/linkedin_bot/prompts/classify_intent.txt` - Prompt template
- `tests/test_intent_classifier.py` - Unit tests (passing)

**Verification**:
- Layer 2: All unit tests passing
- Layer 3: Logging integrated
- Layer 4: Manual test with sample messages confirmed

**Follow-up**: Consider SS-20 (reply generator) which depends on this.
```

---

## `/run next` - Auto-Select from Backlog

When invoked with `next`, `/run` queries Linear for the highest-priority Todo issue:

```bash
/run next

# Equivalent to:
# 1. linear_searchIssues(states: ["Todo"], limit: 5)
# 2. Sort by priority (Urgent > High > Normal > Low)
# 3. /run {highest_priority_issue_id}
```

**Selection criteria**:
1. State = "Todo" (not Backlog, not In Progress)
2. Sorted by priority descending
3. Within same priority, sorted by creation date ascending (FIFO)
4. Skip issues with "blocked" label

---

## Relationship to /step

```
/run = /step in a gradient-based loop

┌─────────────────────────────────────────────────────────────┐
│  /run (The Thinking Engine)                                  │
│  - Loop control                                              │
│  - Gradient evaluation                                       │
│  - Termination decision                                      │
│  - RuntimeState management                                   │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ calls repeatedly until gradient → 0
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  /step (Single Tuple Execution)                              │
│  - Intent detection                                          │
│  - Command routing                                           │
│  - Slot filling                                              │
│  - Single-pass result                                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ routes to primitives
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Primitives (/explore, /validate, /trace, etc.)              │
└─────────────────────────────────────────────────────────────┘
```

---

## The Gradient Concept

### What is Gradient?

The **gradient** measures "change in knowledge/understanding" between iterations:

```
gradient = Δ(TupleState_n, TupleState_n-1)

When gradient is significant: Keep learning
When gradient is insignificant: Stop (converged)
```

### Gradient Components

| Component | Measures | Significant If |
|-----------|----------|----------------|
| **Knowledge** | New entities, relations, insights | At least 1 new insight |
| **Invariant** | Refinement of success criteria | More precise or testable |
| **Evidence** | Strengthening of evidence layers | Moved up 1+ evidence layer |
| **Confidence** | Change in certainty | Uncertainty meaningfully reduced |

### Termination Rule

```
If ALL gradient components = insignificant → TERMINATE
If ANY gradient component = significant → CONTINUE
```

### Todo Completion Gate (CRITICAL)

**Before evaluating gradient for termination, always check pending todos.**

```
If has_pending_todos() → CANNOT TERMINATE (regardless of gradient)
   - Pending todos represent committed work
   - Gradient evaluation only applies AFTER all todos complete
   - This prevents "declared done but work remains" bug
```

**Anti-pattern** (the bug this fixes):
```
1. Write todos: [..., {status: "pending", content: "update file X"}]
2. Evaluate gradient: "insignificant"
3. Declare "converged"  ← BUG: pending todo ignored!
```

**Correct pattern**:
```
1. Write todos: [..., {status: "pending", content: "update file X"}]
2. Check pending todos: YES → CONTINUE (cannot evaluate convergence yet)
3. Complete todo: update file X
4. Mark todo complete
5. Check pending todos: NO → Now evaluate gradient
6. Gradient insignificant + no pending todos → TERMINATE
```

---

## Execution Flow

### 1. Initialize

```yaml
RuntimeState:
  task: "user's task"
  iteration: 0
  max_iterations: 20  # Safety net
  status: running
  tuple: ThinkingTuple(task)
```

### 2. Loop

```
LOOP:
  │
  ├── Execute /step with current tuple
  │     └── Routes to primitives based on intent
  │
  ├── Evaluate gradient
  │     └── "Did we learn something new?"
  │
  ├── Check termination conditions
  │     ├── Invariant satisfied? → EXIT (success)
  │     ├── Gradient insignificant? → EXIT (converged)
  │     ├── Zero gradient (stuck)? → EXIT (stuck)
  │     ├── Max iterations? → EXIT (limit)
  │     └── Continue? → LOOP
  │
  └── Update state
        └── iteration++, record gradient
```

### 3. Terminate

```yaml
Output:
  status: success | converged | stuck | limit_reached
  iterations: N
  termination_reason: "why we stopped"
  final_tuple: ThinkingTuple
  gradient_history: [...]
  summary: "human-readable summary"
```

---

## Gradient Evaluation

At each iteration, Claude evaluates:

```markdown
## Gradient Evaluation (Iteration N)

**Before**: [summary of tuple state before /step]
**After**: [summary of tuple state after /step]

### Component Analysis

1. **Knowledge gradient**: Did we discover new knowledge?
   - New entities/relations/properties?
   - New insights that change understanding?
   → Significant: YES / NO

2. **Invariant gradient**: Did we refine the invariant?
   - More precise success criteria?
   - More testable conditions?
   → Significant: YES / NO

3. **Evidence gradient**: Did we strengthen evidence?
   - Higher evidence layer reached?
   - More confidence in claims?
   → Significant: YES / NO

4. **Confidence gradient**: Did our certainty change?
   - Hypotheses confirmed or refuted?
   - Assumptions validated?
   → Significant: YES / NO

### Overall

- Components: [knowledge=YES, invariant=NO, evidence=YES, confidence=NO]
- Overall gradient: SIGNIFICANT (2/4 components)
- Recommendation: CONTINUE
```

---

## Termination Conditions

| Condition | Priority | When | Status |
|-----------|----------|------|--------|
| **User interrupt** | 0 (highest) | User signals stop | `interrupted` |
| **User checkpoint** | 0.25 | Critical question needs answer | `awaiting_input` |
| **Pending todos** | 0.5 | Any todo status = pending | `blocked` (cannot terminate) |
| **Invariant satisfied** | 1 | Check slot = PASS with Layer 3+ | `success` |
| **Gradient insignificant** | 2 | All components = NO | `converged` |
| **Zero gradient** | 2 | 2+ consecutive insignificant | `stuck` |
| **Max iterations** | 3 (safety) | iteration >= 20 | `limit_reached` |

**Note**: Pending todos at priority 0.5 means they block ALL other termination conditions except user interrupt. You cannot claim "converged" or "success" while work remains uncommitted.

---

## User Checkpoint (Precision Gate)

**Problem**: During autonomous execution, Claude may encounter critical decision points where:
- Multiple valid approaches exist with significant tradeoffs
- Requirements are ambiguous and guessing risks wasted effort
- User preferences/constraints are unknown but essential
- Domain knowledge is needed that Claude can't infer

**Solution**: `/run` can **pause and ask** the user via `AskUserQuestion`, then **resume** with the answer incorporated into Constraints.

### When to Checkpoint

| Situation | Example | Why Checkpoint |
|-----------|---------|----------------|
| **Ambiguous requirements** | "Should auth use JWT or sessions?" | Wrong choice = significant rework |
| **User preference needed** | "React or Vue for the frontend?" | Claude can't infer preference |
| **Critical tradeoff** | "Optimize for speed or memory?" | User must decide priority |
| **Missing context** | "What's the expected load?" | Affects architecture decisions |
| **Irreversible action** | "Delete old data during migration?" | Can't undo, user must confirm |

### When NOT to Checkpoint

| Situation | Why Continue |
|-----------|--------------|
| Implementation details | Claude can decide best practice |
| Recoverable decisions | Can refactor if wrong |
| Clear requirements | No ambiguity to resolve |
| Standard patterns | No user input needed |

**Rule of thumb**: Checkpoint when the **cost of guessing wrong** exceeds the **cost of pausing to ask**.

### Checkpoint Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  ITERATION N                                                         │
│  /step detects: Critical ambiguity or missing user input             │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ Trigger checkpoint
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CHECKPOINT                                                          │
│  - Status: awaiting_input                                            │
│  - Use AskUserQuestion tool                                          │
│  - Present: context, options, recommendation                         │
│  - Wait for user response                                            │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ User responds
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  RESUME                                                              │
│  - Incorporate answer into Tuple Constraints                         │
│  - Log checkpoint in gradient history                                │
│  - Continue execution from iteration N                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Checkpoint Format

When triggering a checkpoint, Claude uses `AskUserQuestion` with structured options:

```markdown
## 🔔 Checkpoint: [Brief description]

**Context**: [What Claude has learned so far]

**Why I'm asking**: [Why this decision matters and can't be inferred]

**Options**:
1. [Option A] - [tradeoffs]
2. [Option B] - [tradeoffs]
3. [Option C] - [tradeoffs]

**My recommendation**: [Option X] because [reasoning]

**Impact of choice**: [How this affects the rest of execution]
```

### Example: Checkpoint During Implementation

```
═══════════════════════════════════════════════════════════════
ITERATION 3
═══════════════════════════════════════════════════════════════

/step: Detected intent = implementation
       Analyzing: Authentication system design

Found critical ambiguity:
  - Issue description says "implement user auth"
  - No specification of auth method
  - Multiple valid approaches with different tradeoffs

Triggering checkpoint...

═══════════════════════════════════════════════════════════════
CHECKPOINT: Authentication Strategy
═══════════════════════════════════════════════════════════════

🔔 **I need your input to proceed with precision.**

**Context**: I'm implementing user authentication for the API.
I've analyzed the existing codebase and found no auth patterns
to follow.

**Why I'm asking**: The auth strategy affects:
- Security model (stateless vs stateful)
- Scalability (horizontal scaling implications)
- Client implementation (token storage)
- Session management complexity

**Options**:

1. **JWT tokens** (Recommended)
   - Stateless, scales horizontally
   - Self-contained user info
   - Requires token refresh logic

2. **Session-based auth**
   - Simpler implementation
   - Requires session storage (Redis/DB)
   - Better for single-server setups

3. **OAuth 2.0 / OpenID Connect**
   - Enterprise-grade
   - Supports SSO
   - More complex setup

**My recommendation**: JWT tokens - aligns with API-first
architecture and serverless deployment pattern I see in the codebase.

Waiting for your input...

───────────────────────────────────────────────────────────────
User: JWT is fine, but use short-lived tokens (15 min) with
      refresh tokens stored in httpOnly cookies.
───────────────────────────────────────────────────────────────

═══════════════════════════════════════════════════════════════
RESUMING ITERATION 3
═══════════════════════════════════════════════════════════════

Incorporating user input into Constraints:
  auth_strategy: JWT
  access_token_ttl: 15 minutes
  refresh_token_storage: httpOnly cookies

Continuing implementation with precise requirements...
```

### Checkpoint Tracking

Checkpoints are recorded in the gradient history:

```yaml
gradient_history:
  - iteration: 1
    gradient: significant
    action: explore
  - iteration: 2
    gradient: significant
    action: decompose
  - iteration: 3
    type: checkpoint
    question: "Authentication strategy"
    options: [JWT, Session, OAuth]
    user_answer: "JWT with 15-min tokens, refresh in httpOnly cookies"
    constraints_added:
      - auth_strategy: JWT
      - access_token_ttl: 15min
      - refresh_storage: httpOnly_cookie
  - iteration: 3  # Continues same iteration
    gradient: significant
    action: implement
```

### Checkpoint Best Practices

1. **Front-load checkpoints**: Ask early rather than backtrack later
2. **Batch related questions**: If multiple unknowns, ask together
3. **Provide recommendations**: Help user decide, don't just present options
4. **Explain impact**: Show how the choice affects the outcome
5. **Accept "your call"**: If user defers, use your recommendation

### Checkpoint vs. Stuck

| Checkpoint | Stuck |
|------------|-------|
| **Proactive**: Claude recognizes need for input | **Reactive**: Claude tried and made no progress |
| **Precise question**: Specific decision point | **Vague**: "I don't know what to do" |
| **Resumable**: Answer enables continuation | **May need reframe**: Fundamental approach issue |
| **Status**: `awaiting_input` | **Status**: `stuck` |

**Key insight**: Checkpoints prevent getting stuck by asking before thrashing.

---

## Quick Reference

```bash
# ─────────────────────────────────────────────────────────────
# Linear-Seeded Execution (Recommended for team visibility)
# ─────────────────────────────────────────────────────────────
/run SS-19                         # Work on specific Linear issue
/run next                          # Auto-select highest priority Todo
/run SS-19 --verbose               # With gradient logging

# ─────────────────────────────────────────────────────────────
# Free-form Execution (No Linear integration)
# ─────────────────────────────────────────────────────────────
/run "implement user authentication"
/run "refactor payment module" --max-iterations=10
/run "investigate timeout bug" --verbose

# ─────────────────────────────────────────────────────────────
# Dry Run (No Linear state updates)
# ─────────────────────────────────────────────────────────────
/run SS-19 --no-linear-update
```

---

## Example Execution

```
User: /run "implement a caching layer for the API"

═══════════════════════════════════════════════════════════════
ITERATION 1
═══════════════════════════════════════════════════════════════

/step: Detected intent = goal-oriented
       Running: /understand, /explore

Tuple after iteration 1:
  Constraints: 3 caching approaches identified (Redis, in-memory, DynamoDB)
  Invariant: "API response time < 100ms for cached data"
  Strategy: (empty)
  Check: (empty)

Gradient evaluation:
  - Knowledge: SIGNIFICANT (3 new alternatives discovered)
  - Invariant: SIGNIFICANT (success criteria defined)
  - Evidence: insignificant (no verification yet)
  - Confidence: insignificant (no claims tested)

Overall: SIGNIFICANT → CONTINUE

═══════════════════════════════════════════════════════════════
ITERATION 2
═══════════════════════════════════════════════════════════════

/step: Detected intent = need strategy
       Running: /what-if

Tuple after iteration 2:
  Constraints: (unchanged)
  Invariant: (unchanged)
  Strategy: "Use Redis with 5-minute TTL, fallback to DB"
  Check: (empty)

Gradient evaluation:
  - Knowledge: insignificant (no new knowledge)
  - Invariant: insignificant (unchanged)
  - Evidence: insignificant (no verification)
  - Confidence: SIGNIFICANT (decided on approach)

Overall: SIGNIFICANT → CONTINUE

═══════════════════════════════════════════════════════════════
ITERATION 3
═══════════════════════════════════════════════════════════════

/step: Detected intent = need validation
       Running: /validate

Tuple after iteration 3:
  Constraints: (unchanged)
  Invariant: (unchanged)
  Strategy: (unchanged)
  Check: PASS - Redis achieves 45ms response (Layer 3 evidence)

Gradient evaluation:
  - Knowledge: insignificant
  - Invariant: insignificant
  - Evidence: SIGNIFICANT (Layer 3 verification achieved)
  - Confidence: SIGNIFICANT (hypothesis confirmed)

Overall: SIGNIFICANT → CONTINUE

═══════════════════════════════════════════════════════════════
ITERATION 4
═══════════════════════════════════════════════════════════════

/step: Detected intent = done (invariant satisfied)
       Running: (none)

Gradient evaluation:
  - Knowledge: insignificant
  - Invariant: insignificant
  - Evidence: insignificant (no change)
  - Confidence: insignificant (no change)

Overall: INSIGNIFICANT → TERMINATE

═══════════════════════════════════════════════════════════════
RESULT
═══════════════════════════════════════════════════════════════

Status: converged
Iterations: 4
Termination reason: Gradient insignificant (goal achieved)

Final tuple:
  - Constraints: 3 caching approaches analyzed
  - Invariant: API response < 100ms
  - Strategy: Redis with 5-min TTL
  - Check: PASS (45ms actual, Layer 3 evidence)

Summary: Implemented Redis caching layer. Verified 45ms response time
meets the 100ms requirement. Ready to proceed with implementation.
```

---

## Example: Linear-Seeded Execution

```
User: /run SS-19

═══════════════════════════════════════════════════════════════
SEED PHASE
═══════════════════════════════════════════════════════════════

Fetching Linear issue SS-19...
  Title: "Module A: Implement intent classification engine"
  Priority: High (P1)
  Description: "Classify incoming LinkedIn messages into intents..."
  Labels: module-a, llm

Updating Linear: state → "In Progress"
Adding comment: "🤖 Starting work on this issue"

═══════════════════════════════════════════════════════════════
SPEC PHASE
═══════════════════════════════════════════════════════════════

Checking for existing spec: .claude/specs/intent-classification/
  → Not found

Creating minimal spec from issue description:
  Invariant:
    - Intent classification engine implemented
    - Handles: greeting, question, objection, interest, other
    - Returns confidence scores
  Evidence required: Layer 2 (functional tests)

═══════════════════════════════════════════════════════════════
ITERATION 1
═══════════════════════════════════════════════════════════════

/step: Detected intent = need understanding
       Running: /understand

Analyzed existing codebase:
  - Found: src/linkedin_bot/message_handler.py
  - Found: src/linkedin_bot/llm_client.py
  - Pattern: Messages flow through handler → response

Gradient evaluation:
  - Knowledge: SIGNIFICANT (understood message flow)
  - Invariant: insignificant
  - Evidence: insignificant
  - Confidence: SIGNIFICANT (know where to integrate)

Overall: SIGNIFICANT → CONTINUE

═══════════════════════════════════════════════════════════════
ITERATION 2
═══════════════════════════════════════════════════════════════

/step: Detected intent = need options
       Running: /what-if

Compared approaches:
  1. Rule-based (keywords) - Simple but brittle
  2. LLM classification - Flexible, higher cost
  3. Hybrid (rules + LLM fallback) - Best balance

Selected: Option 2 (LLM classification) with confidence scoring

Posting milestone to Linear...

Gradient evaluation:
  - Knowledge: SIGNIFICANT (approaches compared)
  - Invariant: insignificant
  - Evidence: insignificant
  - Confidence: SIGNIFICANT (approach decided)

Overall: SIGNIFICANT → CONTINUE

═══════════════════════════════════════════════════════════════
ITERATION 3
═══════════════════════════════════════════════════════════════

/step: Detected intent = implementation
       Running: Write, Edit tools

Created:
  - src/linkedin_bot/intent_classifier.py (new)
  - src/linkedin_bot/prompts/classify_intent.txt (new)
  - Updated message_handler.py to use classifier

Gradient evaluation:
  - Knowledge: insignificant
  - Invariant: insignificant
  - Evidence: SIGNIFICANT (code artifacts created)
  - Confidence: insignificant

Overall: SIGNIFICANT → CONTINUE

═══════════════════════════════════════════════════════════════
ITERATION 4
═══════════════════════════════════════════════════════════════

/step: Detected intent = verification
       Running: /validate

Created tests/test_intent_classifier.py
Running: pytest tests/test_intent_classifier.py -v
  ✓ test_classify_greeting
  ✓ test_classify_question
  ✓ test_classify_interest
  ✓ test_classify_objection
  ✓ test_confidence_threshold
  5 passed in 0.8s

Gradient evaluation:
  - Knowledge: insignificant
  - Invariant: SIGNIFICANT (success criteria met)
  - Evidence: SIGNIFICANT (Layer 2 verified)
  - Confidence: SIGNIFICANT (tests passing)

Overall: SIGNIFICANT → CONTINUE (one more check)

═══════════════════════════════════════════════════════════════
ITERATION 5
═══════════════════════════════════════════════════════════════

/step: Detected intent = done (invariant satisfied)
       Running: final verification

Invariant check:
  ✓ Intent classification engine implemented
  ✓ Handles all 5 intent types
  ✓ Returns confidence scores
  ✓ All tests passing (Layer 2 evidence)

Gradient evaluation:
  - All components: insignificant (nothing new to learn)

Overall: INSIGNIFICANT → TERMINATE

═══════════════════════════════════════════════════════════════
COMPLETE PHASE
═══════════════════════════════════════════════════════════════

Updating Linear SS-19:
  - State: In Progress → Done
  - Adding completion comment...

✅ **Issue Completed**

**Summary**: Implemented LLM-based intent classification engine.

**Artifacts**:
- `src/linkedin_bot/intent_classifier.py`
- `src/linkedin_bot/prompts/classify_intent.txt`
- `tests/test_intent_classifier.py` (5 tests passing)

**Verification**: Layer 2 (all unit tests passing)

**Follow-up**: Consider SS-20 (reply generator) which depends on this.

═══════════════════════════════════════════════════════════════
RESULT
═══════════════════════════════════════════════════════════════

Status: success (invariant satisfied)
Iterations: 5
Linear issue: SS-19 → Done
Termination reason: All invariant criteria met with Layer 2 evidence
```

---

## Zero Gradient Detection

If 2+ consecutive iterations have insignificant gradient, `/run` detects a "stuck" state:

```
Iteration 5: Gradient = insignificant
Iteration 6: Gradient = insignificant

Zero gradient detected!
Status: stuck
Message: "Thinking loop is stuck - no progress for 2 iterations"
Recommendation: Consider reframing the problem or seeking user input
```

---

## RuntimeState Persistence

Each `/run` execution saves state to `.claude/state/runs/`:

```
.claude/state/runs/
└── 2026-01-20-implement-caching-layer.yaml
    ├── task: "implement a caching layer for the API"
    ├── iterations: 4
    ├── status: converged
    ├── gradient_history: [...]
    └── final_tuple: {...}
```

This enables:
- Resuming interrupted runs
- Analyzing thinking patterns
- Learning from past executions

---

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `task` | string | required | The task to accomplish (free-form or `SS-X` issue ID) |
| `next` | keyword | - | Auto-select highest priority Todo from Linear |
| `--max-iterations` | number | 20 | Safety limit |
| `--verbose` | boolean | false | Show gradient evaluation each iteration |
| `--save-state` | boolean | true | Save RuntimeState to .claude/state/ |
| `--no-linear-update` | boolean | false | Skip Linear state updates (for dry runs) |
| `--create-spec` | boolean | auto | Force spec creation even if none exists |

### Input Format Detection

| Input | Detected Mode | Behavior |
|-------|---------------|----------|
| `SS-19` or `ss-19` | Linear-seeded | Fetch issue, seed tuple, update Linear |
| `next` | Auto-select | Query Linear for highest-priority Todo |
| `"implement X"` | Free-form | Traditional task string, no Linear integration |

---

## Integration with Agent Kernel

`/run` uses the full Agent Kernel Protocol:

- **GradientProtocol**: For termination decisions
- **LoopProtocol**: For execution flow
- **SlotCompletionCriteria**: For /step command selection
- **CommandSelectionRules**: For adaptive routing

See `.claude/kernel/schema.yaml` for full protocol definitions.

---

## See Also

- `/step` - Single tuple execution (what /run calls in loop)
- `/task-manager` - Natural language interface for Linear task management
- `/feature` - Create PRD/spec for a feature (used in spec phase)
- `kernel/schema.yaml` - GradientProtocol and LoopProtocol definitions
- `AGENT-KERNEL.md` - Architecture overview
- `CLAUDE.md` - Thinking Tuple Protocol (Principle #26)
- [Linear App](https://linear.app/ss-automation) - View all issues
