# ss-automation - Development Guide

**Meta Ads → Google Sheets Automation**

**CLAUDE.md is the ground truth contract for how we work.**

This document is part of the **Agent Kernel** - the cognitive operating system for AI-assisted development. See [AGENT-KERNEL.md](AGENT-KERNEL.md) for full architecture.

---

## About This Document

Principles are organized by **applicability tier**:
- **Tier-0 (Core)**: Apply to EVERY task - documented here
- **Tier-1/2/3 (Context-specific)**: Apply by task/domain - documented in `.claude/principles/`

This reduces token usage by ~60% while maintaining full principle coverage.

---

## Project Context

**Project Type:** Python script automation (no CLI, no database)

**Data Flow:** Meta Ads API → Python processing → Google Sheets

**Key Files:**
- `meta_to_sheets.py` - Main entry point
- `meta_ads_parser.py` - Meta Ads data parsing
- `src/config.py` - Configuration management

**Execution:** `python meta_to_sheets.py`

**Branch Strategy:** `dev` → dev environment | `main` → staging environment | Tags `v*.*.*` → production

For complete component inventory, technology stack, and directory structure, see [Documentation Index](docs/README.md) and [Project Conventions](docs/PROJECT_CONVENTIONS.md).

---

## Tier-0: Core Principles (ALWAYS Apply)

These 11 principles guide EVERY task. They are non-negotiable.

### 0. Linear Task Management (Team Visibility)
For multi-step tasks or long-running sessions, use Linear MCP to create and track issues so the team can monitor progress in real-time.

**When to use Linear**:
- Tasks with 3+ steps that take significant time
- Work that teammates need to review or follow
- Planning sessions where task breakdown helps clarity
- Any work where "what is Claude doing?" matters

**Primary Interface**: Use `/task-manager` command for natural language task management:
```bash
/task-manager "remember: need to add rate limiting"     # Create issue
/task-manager "what's in progress?"                      # Query tasks
/task-manager "done with SS-6"                           # Complete task
/task-manager "blocked on SS-7, waiting for credentials" # Add blocker
/task-manager load                                       # Load active tasks
```

**Direct Linear MCP Tools** (for fine-grained control):
- `linear_createIssue` - Create tasks (team: Ss-automation)
- `linear_updateIssue` - Update status, priority, assignee
- `linear_createComment` - Add progress notes
- `linear_searchIssues` - Find related issues
- `linear_addIssueToCycle` - Add to current sprint

**Workflow**:
1. **Start of task**: `/task-manager add "title"` or `linear_createIssue`
2. **Progress updates**: `linear_createComment` at milestones
3. **Subtasks discovered**: Create child issues or update description
4. **Completion**: `/task-manager done "SS-X"` or update issue state

**Team**: Ss-automation (SS) | **View**: https://linear.app/ss-automation

**Note**: Use Linear (via `/task-manager` or MCP tools) for team-visible work tracking. Use local `TodoWrite` for quick internal checklists that don't need team visibility.

See [/task-manager command](.claude/commands/task-manager.md) for full documentation.

### 1. Defensive Programming
Fail fast and visibly when something is wrong. Silent failures hide bugs. Validate configuration at startup, not on first use. Explicitly detect operation failures (rowcount, status codes). No silent fallbacks or default values that hide error recovery. **Never assume data exists** without validating first. See [code-review skill](.claude/skills/code-review/).

### 2. Progressive Evidence Strengthening
Execution completion ≠ Operational success. Verify through increasingly strong evidence:
- **Layer 1 (Surface)**: Status codes, exit codes (weakest)
- **Layer 2 (Content)**: Payloads, data structures
- **Layer 3 (Observability)**: Traces, logs
- **Layer 4 (Ground truth)**: Actual state changes (strongest)

Never stop at weak evidence—progress until ground truth verified. See [error-investigation skill](.claude/skills/error-investigation/).

### 18. Logging Discipline (Storytelling Pattern)
Log for narrative reconstruction: ERROR (what failed), WARNING (unexpected), INFO (what happened), DEBUG (how). Logs are Layer 3 evidence.

**Narrative**: Beginning (context) → Middle (milestones) → End (✅/❌).

**Boundary logging**: WHERE you log determines WHAT survives Lambda failures. Log at handler boundaries.

See [Logging Discipline Guide](docs/guides/logging-discipline.md) if available.

### 20. Execution Boundary Discipline
**Reading code ≠ Verifying code works.** Before concluding "correct", verify:
- WHERE does code run?
- WHAT environment required?
- WHAT systems called?
- WHAT entity properties?
- HOW verify contract?

See [Execution Boundary Discipline Guide](docs/guides/execution-boundary-discipline.md).

### 23. Configuration Variation Axis
Choose config mechanism by WHAT varies:
- **Secret** → Doppler (or secret manager)
- **Environment-specific** → Doppler (or env vars)
- **Complex structure** → JSON file
- **Static** → Python constant

Read env vars ONCE at startup. See [Configuration Variation Guide](docs/guides/configuration-variation.md) if available.

### 25. Universal Property Verification (Generalized Invariant)

**Core insight**: Many claims are **universal quantifiers** (∀) requiring exhaustive verification, not **existential** (∃) requiring only one example.

Before claiming ANY universal property, verify the **FULL envelope**:

**For CORRECTNESS claims** ("system works"):
- **Level 0 (User)**: User can X
- **Level 1 (Service)**: Lambda returns Y
- **Level 2 (Data)**: Database has Z
- **Level 3 (Infra)**: A can reach B
- **Level 4 (Config)**: X is set to Y

**For SAMENESS claims** ("A matches B"):
- Decompose into comparable units
- Verify: ∀ unit: Similar(A.unit, B.unit)
- Report coverage: "X of Y units match"

**For COMPLETENESS claims** ("all X have Y"):
- Enumerate all instances of X
- Verify: ∀ x: HasProperty(x, Y)
- Report coverage: "X of Y verified"

**Universal Verification Protocol**:
```
1. IDENTIFY claim type (correctness, sameness, completeness)
2. DECOMPOSE entity into appropriate units (not just prominent ones)
3. ENUMERATE all units explicitly (N = count)
4. VERIFY each unit systematically
5. REPORT coverage: "X of Y verified (Z%)"
6. REQUIRE 100% for universal claims (or explicit threshold)
```

**Anti-pattern: Prominent Sample Bias**
- Testing only the most visible part
- Assuming one positive result generalizes
- Stopping at first success

**Anti-pattern: Structural Proxy Bias**
- Substituting structural verification for perceptual verification
- Verifying "elements present" instead of "elements look/behave the same"
- Decomposing into structural units only, ignoring visual/content units

**Anti-pattern: Spatial Relationship Blindness**
- Verifying elements exist without verifying their spatial relationships
- Decomposing into elements (what exists) but not arrangement (how they relate)
- Missing above/below/inside/overlapping relationships between elements
- Example: "Video exists ✓, Stats exist ✓" but missing "Video ABOVE stats (not overlapping)"

**For SAMENESS claims specifically**, decompose into FOUR layers:
```
Layer 1 (Elements): What components exist
Layer 2 (Appearance): How each element looks (styling, colors, typography)
Layer 3 (Spatial): How elements relate spatially (above, below, inside, adjacent, overlapping)
Layer 4 (Behavior): How elements respond (scroll animations, hover effects, click interactions)

Elements match ≠ Appearance match ≠ Spatial match ≠ Behavior match
All four layers required for full "same" claim
```

**Layer 4 (Behavior) Verification Requirements**:

⚠️ **CRITICAL**: Behavior verification REQUIRES runtime testing, not just code inspection.

**Anti-Pattern: Structural Proxy Bias** (most common Layer 4 violation):
- ❌ Checking if animation CSS exists → "animations work"
- ❌ Checking if event handler defined → "interactions work"
- ❌ Assuming code existence = working behavior

**Correct Approach: Runtime + Structural**:
1. ✅ Execute runtime test (Playwright, manual interaction, or automated test)
2. ✅ Verify behavior works as expected (observe actual outcome)
3. ✅ THEN verify implementation code (as secondary confirmation)

**Example from Session** (2026-01-19):
- ❌ WRONG: "Found `animate-marquee` CSS in tailwind.config.js" → Concluded "animations work" → **FALSE NEGATIVE**
- ✅ RIGHT: "Scrolled page, observed timeline steps animate (opacity 0→1, translateY 30px→0)" → Verified actual behavior → **TRUE POSITIVE**

**Verification Tools by Domain** (Layer 4):
- Frontend: Playwright (automated browser interaction)
- API: curl/Postman (actual HTTP requests)
- Lambda: AWS test event invocation
- Database: Query actual data in SQL client

**Integration with Principle #20**: "Reading code ≠ Verifying code works" applies especially to Layer 4.

**Behavior Verification Tools** (Layer 4):
- `/sameness "original" "clone"` - Run full sameness test with instrumentation
- `/squeeze "url"` - Discover hidden behaviors through fuzzing
- `/compare-behavior "element"` - Compare specific behavior between sites

See [sameness-testing skill](.claude/skills/sameness-testing/) for Playwright-based instrumentation.

**The Invariant Feedback Loop**:
```
/invariant → /reconcile → /invariant
  (detect)    (converge)   (verify)
```

Use `/invariant "goal"` to identify what must hold, `/reconcile domain` to fix violations, then `/invariant` again to verify delta = 0.

**Spec-Driven Development (Two-Layer Model)**: For long-running tasks, use specification files to maintain ground truth:

**Layer 1: Feature Specs** (`.claude/specs/`)
- **Create**: `/feature "name"` creates PRDs with full context
- **Reference**: Specs declare `refs.invariants` for shared concerns
- **Composition**: Specs can reference other specs via `refs.specs`

**Layer 2: Shared Invariants** (`.claude/invariants/`)
- **Cross-feature concerns**: deployment, observability, security
- **Domain-organized**: Not tied to any single feature
- **Referenced**: Multiple feature specs can share these invariants

**PRD Auto-Discovery** (proactive practice):
When starting work on a feature, **always check for existing PRD first**:
```
1. Check: Does .claude/specs/{feature}/ exist?
2. If YES: Load spec.yaml, invariants.md, constraints.md
3. If NO:  Ask user if PRD should be created (/feature "name")
4. Load: Also load referenced invariants from refs.invariants
```

This ensures feature work starts from defined contracts, not assumptions.

**Environment Constraints**: local (mocks) → dev/stg (real APIs) → prd (real APIs + SLAs)

**Convergence Tracking**: [.claude/state/convergence/](.claude/state/convergence/) - Track verification status

See [Behavioral Invariant Guide](docs/guides/behavioral-invariant-verification.md) if available, [/invariant](.claude/commands/invariant.md), [/reconcile](.claude/commands/reconcile.md), [Invariants Directory](.claude/invariants/), and [Specifications](.claude/specs/).

### 26. Thinking Tuple Protocol (Universal Kernel)

**Meta-Invariant**: Every reasoning episode runs through a Thinking Tuple. The tuple is the OS; commands are apps running on it.

```
Tuple = (Constraints, Invariant, Principles, Strategy, Check)
```

| Component | Question | Source |
|-----------|----------|--------|
| **Constraints** | What do we have/know? | Current state, specs, context |
| **Invariant** | What must be true at end? | Success criteria, `/invariant` |
| **Principles** | What tradeoffs guide us? | Tier-0 + task-specific clusters |
| **Strategy** | What modes to execute? | Pipeline of command-modes |
| **Check** | Did we satisfy invariant? | Progressive Evidence (Layers 1-4) |

**Strategy** is a pipeline of modes (commands as first-class functions):
```
Strategy = [
  { mode: "/decompose", prompt: "break the problem" },
  { mode: "/explore",   prompt: "find alternatives" },
  { mode: "/consolidate", prompt: "synthesize" }
]
```

**Tuple Router** (for any prompt, slash or plain):
| Intent | Default Strategy |
|--------|------------------|
| Goal-oriented (build X, fix Y) | `[/step]` |
| Exploration (what are options) | `[/explore]` |
| Verification (is X correct) | `[/validate]` |
| Deductive proof (prove X from Y) | `[/proof]` |
| Explanation (how does X work) | `[/understand]` |
| Comparison (X vs Y) | `[/what-if]` |
| Causal analysis (why X) | `[/trace]` |

**Check Loop**: After Strategy completes, evaluate Invariant. If insufficient, extend Strategy or spin new tuple with updated Constraints.

**The Thinking Engine (`/run`)**: For complex tasks, use `/run` instead of `/step`. `/run` wraps `/step` in a gradient-based loop that terminates when learning stops:

```
/run = /step executed repeatedly until gradient → 0

Gradient components:
- Knowledge: Did we discover new insights?
- Invariant: Did we refine success criteria?
- Evidence: Did we strengthen verification?
- Confidence: Did our certainty change?

Termination: When ALL components = insignificant
```

**Linear-Seeded Execution** (team-visible autonomous work):

`/run` can be seeded by a Linear issue, creating a closed loop for team-visible autonomous execution:

```
Linear (what to do) → Spec (how to know done) → Commands (how to think) → /run (execution) → Linear (done)
```

| Input Mode | Example | Behavior |
|------------|---------|----------|
| Linear issue | `/run SS-19` | Fetch issue → seed Constraints → execute → update Linear |
| Auto-select | `/run next` | Pick highest-priority Todo → execute → update Linear |
| Free-form | `/run "task"` | Traditional mode, no Linear integration |

**Linear-Seeded Flow**:
1. **Seed Phase**: Fetch issue → extract title/description/priority → set state to "In Progress"
2. **Spec Phase**: Check `.claude/specs/{slug}/` → load or create minimal invariant
3. **Execute Phase**: Adaptive `/step` loop with milestone comments to Linear
4. **Complete Phase**: Update Linear state based on termination (Done, blocked, partial)

**User Checkpoints** (Precision Gates):

During `/run`, Claude can **pause and ask** the user for critical input:
- Ambiguous requirements with significant tradeoffs
- User preferences that can't be inferred
- Irreversible decisions requiring confirmation
- Missing domain knowledge essential for precision

```
/run detects ambiguity → triggers checkpoint → AskUserQuestion → user responds → resume with answer in Constraints
```

**Rule**: Checkpoint when **cost of guessing wrong** > **cost of pausing to ask**. This prevents wasted effort and ensures precision.

This integrates with Principle #0 (Linear Task Management) to provide full team visibility of Claude's autonomous work.

**Error bound**: Without tuples, error ∝ (steps × drift). With tuples, error bounded by check frequency. With `/run`, convergence is adaptive—stops when it should, not after N fixed iterations.

See [Thinking Tuple Guide](docs/guides/thinking-tuple-protocol.md) if available, [Tuple Architecture](.claude/diagrams/tuple-kernel-architecture.md) if available, and [/run command](.claude/commands/run.md).

### 27. Commands as Strategy Modes

Commands are not independent—they are **modes within Strategy**. The complete command ontology is defined in [.claude/commands/metadata.yaml](.claude/commands/metadata.yaml).

**Command Types**:
- **Primitive**: Irreducible operations (~17 commands) - cannot be decomposed further
- **Process**: Ordered sequences of primitives with implied execution order (e.g., `/analysis` = explore→what-if→validate→consolidate)
- **Alias**: Different name for a primitive (e.g., `/compare` = `/what-if`)
- **Meta**: Controls execution of other commands (e.g., `/run` = `/step` in gradient loop)
- **Domain-specialized**: Primitive bound to domain (e.g., `/animate` = DSLP + web_motion)
- **Output mode**: Produces artifacts, not Tuple operations (e.g., `/journal`, `/report`)
- **Utility**: Operational helpers (e.g., `/wt-spin-off`, `/task-manager`)

**Primitive Commands by Tuple Slot**:

| Slot | Commands | Mode |
|------|----------|------|
| **Constraints** | `/explore`, `/observe`, `/context`, `/hypothesis`, `/consolidate`, `/trace` | Expand what we know |
| **Invariant** | `/understand`, `/decompose`, `/specify`, `/feature` | Define what must be true |
| **Strategy** | `/what-if`, `/design` | Plan execution |
| **Check** | `/validate`, `/proof`, `/reflect`, `/invariant`, `/reconcile` | Verify invariant |
| **All** | `/step` | Full tuple orchestration (single pass) |
| **All** | `/run` | Full tuple orchestration (gradient loop) |

**Process Definitions** (ordered step sequences for `/step` routing):
```yaml
/analysis:    [explore → what-if → validate → consolidate]
/bug-hunt:    [observe → trace → hypothesis → validate]
/reproduce:   [observe → decompose → document]
/abstract:    [observe → consolidate → extract_pattern]
/evolve:      [observe → validate → propose_updates → sync_protocol]  # Recursive self-evolution
```

**Alias Resolution** (for `/step` routing):
```yaml
/compare:  → /what-if (multi_way mode)
/summary:  → /consolidate (communication focus)
/explain:  → /understand (communication focus)
/research: → /explore (thorough mode)
/impact:   → /trace (forward mode)
```

**Domain-Specialized Commands**:
| Command | Base | Domain |
|---------|------|--------|
| `/animate` | dslp_pipeline | web_motion |
| `/architect` | design | aws_architecture |
| `/refacter` | design | code_refactoring |
| `/sameness` | validate | ui_comparison |
| `/squeeze` | explore | behavioral_fuzzing |
| `/locate` | explore | code_navigation |
| `/deploy` | reconcile | deployment |

**Chaining**: Strategy can chain modes. Each mode updates tuple state before next mode executes.

**Internal Modes**: Beyond slash commands, internal modes exist for micro-operations:
- `summarize`, `rewrite_simple`, `extract_criteria`, `compare_two`, `extract_pattern`
- `sync_protocol` (Protocol compliance sync for `/evolve protocol`)
- `check_coherence` (System coherence check for `/evolve kernel`)

**Recursive Self-Evolution** (`/evolve`):

The Agent Kernel has a special meta-property: `/evolve` can detect when IT ITSELF is out of sync with the system it's meant to evolve. This closure property enables meta-system integrity.

```
/evolve protocol  → Sync command files with metadata.yaml Protocol
/evolve kernel    → Check coherence of entire Agent Kernel system

Key insight: /evolve protocol includes /evolve itself in scope.
When Principle #29 was added, /evolve needed Protocol fields.
/evolve kernel detects this and proposes self-update.
```

This recursive property ensures the Agent Kernel can maintain its own consistency as it evolves.

See [Command Metadata](.claude/commands/metadata.yaml) for complete ontology and [Command Mode Specifications](.claude/commands/README.md) for individual command docs.

### 28. DSLP Framework Integration (Pattern-Based Reasoning)

**Problem**: Micro-level replication of complex behaviors (animations, architectures) is time-consuming and doesn't converge to Delta = 0.

**Solution**: DSLP (DSL-driven Semantic Layer Protocol) - pattern-based reasoning framework.

**Core Insight**: DSLP is a **meta-layer** that defines the vocabulary/grammar for specifications in a domain. Specifications are instances of DSLPs. Commands operate on specifications.

**Three-Layer Architecture**:
```
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: DSLP (Domain Languages)                           │
│  Defines vocabulary, grammar, patterns for a domain         │
│  Registry: .claude/domain_packs/registry.yaml               │
│  Examples: web_motion, behavioral_invariant, feature_contract│
└─────────────────────────────────────────────────────────────┘
                         ▲
                         │ "spec uses DSL"
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Specification (Instances of DSLPs)                │
│  Declarative desired state written in a DSLP                │
│  Locations: .claude/specs/, .claude/invariants/             │
│  Examples: feature spec, animation spec, invariant spec     │
└─────────────────────────────────────────────────────────────┘
                         ▲
                         │ "command operates on spec"
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 0: Commands (Operations on Specs)                    │
│  Create, verify, or implement specifications                │
│  Registry: .claude/commands/metadata.yaml                   │
│  Examples: /feature, /invariant, /animate, /validate        │
└─────────────────────────────────────────────────────────────┘
```

**Spec Files Declare Their DSLP**:
```yaml
# .claude/specs/linkedin-automation/spec.yaml
dslp: feature_contract   # ← Declares which DSL this spec uses
version: "1.0"
name: LinkedIn LLM Response
...
```

**Registered DSLPs** (see [registry.yaml](.claude/domain_packs/registry.yaml)):

| DSLP | Purpose | Spec Commands |
|------|---------|---------------|
| `feature_contract` | Feature specifications | `/feature` |
| `behavioral_invariant` | Verification criteria (5 levels) | `/invariant`, `/validate`, `/sameness` |
| `web_motion` | Animation/motion design | `/animate`, `/squeeze` |
| `api_contract` | API design | `/specify` |
| `aws_architecture` | Infrastructure patterns | `/architect` |
| `code_complexity` | Refactoring analysis | `/refacter`, `/restructure` |

**DSLP Processing Pipeline** (L0→L4):
```
L0: Natural Language Intent
L1: Semantic Specification (domain-shaped meaning)
L2: Pattern Plan (named reusable solutions)
L3: Implementation Plan (technology-specific mapping)
L4: Artifacts (code, configs, diagrams)
```

**Architecture Components**:

| Component | Type | Responsibility | Location |
|-----------|------|----------------|----------|
| **DSLP Registry** | Config | Lists all DSLPs with schemas | `.claude/domain_packs/registry.yaml` |
| **Domain Pack** | Knowledge | Schema, patterns, backends for one DSL | `.claude/domain_packs/{domain}/` |
| **Spec Command** | Command | Creates/verifies specs using a DSLP | `.claude/commands/metadata.yaml` |
| **Domain Skill** | Skill | Implementation expertise, code generation | `.claude/skills/domain-{domain}/` |

**Example Domain: web_motion (Animation Replication)**

**Domain Pack Contents**:
- `schema.yaml` - L1 semantic structure (scene_types, drivers, triggers, easings)
- `patterns.yaml` - L2 pattern library (scroll_reveal, parallax, stagger, hover_lift, number_counter)
- `backends.yaml` - L3 technology mappings (React+CSS, GSAP, Framer Motion, WAAPI)
- `generators/` - L4 code generation scripts (Python templates)

**Skill Composition**:
```
/animate "cards fade and slide up on scroll"

→ Thinking Tuple Strategy:
  1. dslp-core.parse_intent(domain=web_motion)
     → Extract semantic spec (L1)
  2. dslp-core.match_patterns(domain=web_motion)
     → Select scroll_reveal pattern (L2)
  3. dslp-core.select_backend(domain=web_motion)
     → Choose react_css backend (L3)
  4. domain-web-animation.generate_code()
     → Produce Card.tsx + Card.css (L4)
  5. domain-web-animation.optimize()
     → Apply performance/accessibility
```

**Pattern-Based vs Micro-Replication**:

| Approach | Convergence | Time | Reusability |
|----------|-------------|------|-------------|
| **Micro-replication** | Delta ~0.08 (92%) | High (250 min for 50 components) | Low (one-off) |
| **Pattern-based (DSLP)** | Delta ~0.02 (98%) | Medium (40% time savings) | High (patterns reused) |

**Integration with Thinking Tuple**:

DSLP operates within Tuple Strategy slot:
```
Constraints: User intent (L0), Domain pack, Project stack
Invariant: Artifacts match semantic intent + behavioral correctness
Principles: #2 (Progressive Evidence), #25 (Universal Property Verification)
Strategy: [dslp-core stages + domain-skill generation]
Check: Layer 1-4 verification (syntax → semantics → visual → behavioral)
```

**Reverse Engineering Mode**:

DSLP can extract semantic specs from existing implementations:
```
/animate extract "https://reference-site.com"

→ Process:
  1. Playwright: Identify animated elements
  2. Chrome DevTools: Extract properties (timing, easing, triggers)
  3. Reverse-engineer semantic spec (L1)
  4. Match to known patterns (L2)
  5. Generate equivalent code (L4)
  6. Verify: Delta ≤ 0.03 (97% match)
```

**Convergence Protocol** (Principle #25 Applied):

For sameness claims, verify **all 4 layers**:
- **Layer 1 (Elements)**: DOM structure match
- **Layer 2 (Appearance)**: Visual properties match
- **Layer 3 (Spatial)**: Spatial relationships match
- **Layer 4 (Behavior)**: Animation timing/easing/thresholds match

**Delta Formula**: `Δ = 0.1×Δ_elements + 0.3×Δ_appearance + 0.2×Δ_spatial + 0.4×Δ_behavior`

**Acceptance**: Δ ≤ 0.03 (97% match or higher)

**Extending DSLP to New Domains**:

To add domain (e.g., `aws_architecture`, `data_visualization`):
1. Create domain pack: `.claude/domain_packs/{domain}/`
   - Define L1 semantic schema
   - Curate L2 pattern library
   - Map L3 backends
   - Create L4 generators
2. Create domain skill: `.claude/skills/domain-{domain}/`
3. Create slash command: `.claude/commands/{domain}.md`
4. DSLP Core requires **zero modifications** (domain-agnostic)

**Documentation**:
- Architecture: `docs/dslp-architecture.md`
- Pattern catalog: `docs/patterns/{domain}-patterns.md`
- Domain packs: `.claude/domain_packs/`
- Skills: `.claude/skills/dslp-core/`, `.claude/skills/domain-*/`

**Commands Using DSLP**:
- `/animate` - Web animation implementation (web_motion domain)
- (Future) `/architect` - AWS architecture generation
- (Future) `/visualize` - Data visualization patterns

See [DSLP Architecture Guide](docs/dslp-architecture.md), [Web Motion Patterns](docs/patterns/web-motion-patterns.md), and [/animate command](.claude/commands/animate.md).

### 29. Unified Ontological Framework (Agent Protocol)

**Problem**: Agent Kernel components (skills, commands, principles, DSLPs, specs) have heterogeneous formats. This makes parallel orchestration difficult—agents can't easily exchange results.

**Solution**: All components share a **universal formal structure** built on **11 irreducible metaphysical primitives** that enables typed message passing between agents.

**Metaphysical Primitives** (the atoms of the ontology):

```
┌────────────────────────────────────────────────────────────────────┐
│  STATIC (What exists)          │  DYNAMIC (What happens)           │
├────────────────────────────────┼───────────────────────────────────┤
│  Entity (things)               │  Event (instantaneous occurrence) │
│  Property (attributes)         │  Process (extended activity)      │
│  Relation (connections)        │  State (snapshots in time)        │
│  Constraint (limits)           │  Context (framing conditions)     │
├────────────────────────────────┴───────────────────────────────────┤
│  COMPUTATIONAL (How to derive and reason)                          │
├────────────────────────────────────────────────────────────────────┤
│  Function (input→output mappings)                                  │
│  Identity (same-entity-across-time criteria)                       │
│  Modality (alternative worlds/perspectives)                        │
└────────────────────────────────────────────────────────────────────┘
```

| Primitive | Category | Description | Example |
|-----------|----------|-------------|---------|
| **Entity** | Static | Things that exist | `Lambda`, `Endpoint`, `Component` |
| **Property** | Static | Attributes of entities | `timeout=30`, `status=running` |
| **Relation** | Static | Connections between entities | `generates`, `contains`, `triggers` |
| **Constraint** | Static | Conditions that must hold | preconditions, invariants, cardinality |
| **State** | Dynamic | Discrete configuration at a point in time | `pending`, `running`, `completed` |
| **Event** | Dynamic | Instantaneous occurrence | `command_invoked`, `error_occurred` |
| **Process** | Dynamic | Extended activity with ordered steps | `/analysis`, `/bug-hunt` sequences |
| **Context** | Dynamic | Framing conditions for reasoning | domain, active principles, environment |
| **Function** | Computational | Input→output mapping evaluated at runtime | `gradient()`, `delta()`, `lerp()` |
| **Identity** | Computational | What makes entity same across time/mutation | element identity in sameness tests |
| **Modality** | Computational | Alternative worlds for hypothetical reasoning | `/what-if` scenarios, perspective shifts |

**Universal Component Signature**:
```yaml
Component = {
  domain: Domain | null,        # Domain-agnostic or domain-specific
  entities: Entity[],            # What this component works with
  relations: Relation[],         # How entities interact
  properties: {
    domain_agnostic: Property[], # Work in any domain (domain=null)
    domain_specific: Property[]  # Require domain context (domain=X)
  },
  constraints: Constraint[],     # What must hold (unified constraint type)
  tuple_binding: {
    slot: TupleSlot,             # Constraints | Invariant | Principles | Strategy | Check
    effect: TupleEffect          # expand | define | guide | plan | verify
  }
}
```

**Domain Polymorphism**:

Properties fall into two categories based on whether they require domain context:

| Type | Domain | Examples |
|------|--------|----------|
| **Domain-Agnostic** | `null` | `name`, `version`, `status`, `local_check` |
| **Domain-Specific** | `X` | `css_properties`, `easing_function`, `endpoint_schema` |

**Investigative Processes**:

Each domain defines its own methods for discovering and verifying properties:

```yaml
website.sameness_verification:
  layers: [elements, appearance, spatial, behavior]
  methods: [DOM_diff, CSS_extraction, Playwright]

api.api_verification:
  layers: [contract, behavior, edge_cases, performance]
  methods: [schema_validation, request_replay, fuzz_testing]

deployment.deployment_verification:
  layers: [config, infra, service, observability]
  methods: [health_check, CloudWatch_query, smoke_test]
```

**Domain-Polymorphic Commands**:

Commands like `/invariant` detect domain from task and bind to appropriate investigative process:

```
/invariant "replicate site X"
     ↓
Detect: "replicate" → domain = website
     ↓
Bind: investigative_process = sameness_verification
     ↓
Output: Domain-specific invariants (4-layer sameness)
```

**Agent Protocol Benefits**:

Because all components share the same structure:
- **Typed Messages**: Components are messages with known schema
- **Formal Routing**: Messages route to tuple slots by binding
- **Parallel Execution**: Agents run in parallel, results merge via protocol

```python
async def orchestrate(task, agents):
    messages = await asyncio.gather(*[a.process(task) for a in agents])
    tuple_state = ThinkingTuple()
    for msg in messages:
        tuple_state[msg.tuple_binding.slot].apply(msg)
    return tuple_state.check()
```

**Schema Location**: `.claude/kernel/schema.yaml`

See [Agent Kernel Architecture](AGENT-KERNEL.md) and [Kernel Schema](.claude/kernel/schema.yaml).

### 30. Semantic Inheritance (Agent-Native Composability)

**Problem**: How do Agent Kernel components (commands, skills, templates) compose? Traditional OOP inheritance uses method dispatch at runtime, but Claude is a reasoning engine that processes prompts, not a runtime with method dispatch.

**Solution**: **Semantic Inheritance** - a template-based inheritance system where children have a "voice" to explain HOW they want to inherit from parents.

**Core Insight**: Templates are the agent-native equivalent of abstract classes. Children "fill in" slots with prompts. The child's **voice** expresses inheritance intent, enabling Claude to resolve merges semantically.

```
┌────────────────────────────────────────────────────────────────────┐
│  Traditional OOP                │  Semantic Inheritance             │
├─────────────────────────────────┼────────────────────────────────────┤
│  class Child(Parent):           │  /child-command:                   │
│    def method():                │    extends: parent                 │
│      super().method()           │    voice:                          │
│      # child additions          │      slot:                         │
│                                 │        intent: "I want parent's    │
│  Method dispatch at runtime     │          capability but adapted    │
│  MRO determines merge           │          for my context..."        │
│  Child has no voice             │        directive: wrap             │
│                                 │                                    │
│                                 │  Template expansion at prompt time │
│                                 │  Intent determines merge           │
│                                 │  Child explains WHY and HOW        │
└────────────────────────────────────────────────────────────────────┘
```

**Key Concepts**:

| Concept | Definition | OOP Equivalent |
|---------|------------|----------------|
| **Template** | Abstract structure with slots | Abstract class |
| **Slot** | Placeholder children fill with prompts | Abstract method |
| **Voice** | Child's explanation of inheritance intent | (none - this is new) |
| **MergeStrategy** | How to combine multiple parents | Method Resolution Order |

**Voice Directives**:

| Directive | Meaning | Example Use Case |
|-----------|---------|------------------|
| `before` | Child first, then parent | Setup context before parent runs |
| `after` | Parent first, then child | Add to parent's output (like super()) |
| `instead` | Replace parent completely | Override entirely |
| `wrap` | Child provides context, parent runs inside | Establish preconditions/postconditions |
| `filter` | Parent runs, child filters output | Narrow parent's results |
| `transform` | Parent runs, child transforms output | Adapt parent's format |
| `interleave` | Alternate parent and child steps | Complex multi-step composition |
| `extend` | Parent + child additions | Add capabilities without changing parent |

**Example: Forensic Investigator extends Investigator**:

```yaml
/forensic-investigator:
  extends: investigator

  voice:
    - slot: gather
      intent: |
        I need parent's systematic gathering, but adapted for forensic context.
        Prioritize volatile evidence before stable evidence.
        Preserve chain of custody for all artifacts.
      directive: wrap
      wrapper:
        before: "Initialize chain-of-custody log"
        after: "Seal evidence with timestamps and hashes"

    - slot: analyze
      intent: |
        Use parent's analysis framework, but add adversarial thinking.
        Assume threat actor, not just bug or misconfiguration.
      directive: extend
```

**Multi-Inheritance with Voice**:

When a child extends multiple templates with conflicting slots, voice resolves conflicts:

```yaml
/deep-analyst:
  extends: [investigator, synthesizer]  # Both have 'conclude' slot

  voice:
    - slot: conclude
      intent: |
        investigator.conclude produces raw findings.
        synthesizer.conclude formats them nicely.
        I want: investigator first (substance), then synthesizer (polish).
      directive: sequential

  merge:
    conclude:
      mode: sequential
      order: [investigator, synthesizer]
```

**Base Templates** (in `.claude/templates/registry.yaml`):

| Template | Slots | Purpose |
|----------|-------|---------|
| `investigator` | gather → analyze → conclude | Systematic investigation |
| `synthesizer` | collect → organize → format → deliver | Knowledge synthesis |
| `validator` | setup → execute → evaluate → report | Verification patterns |
| `explorer` | scope → search → evaluate → select | Divergent exploration |
| `deployer` | prepare → validate → execute → verify | Deployment workflows |

**Why Voice Matters**:

Traditional inheritance: Child can only `accept`, `override`, or `super()`.
Semantic inheritance: Child expresses **intent** in natural language.

This enables:
- **Semantic merge**: Claude interprets intent, not rigid MRO
- **Context adaptation**: Child explains WHY it needs different behavior
- **Self-documenting**: Voice serves as documentation of design decisions
- **Flexible composition**: Merge strategies beyond simple sequencing

**Integration with Thinking Tuple**:

Voice maps to Tuple slots:

| Voice Component | Tuple Slot |
|-----------------|------------|
| `intent` | Constraints (what child knows/wants) |
| `directive` | Strategy (how to execute) |
| `clarification` | Invariant (precision requirements) |
| Resolution | Check (verify merge produced intended behavior) |

**Template Registry**: `.claude/templates/registry.yaml`

See [Template Registry](.claude/templates/registry.yaml) and [Kernel Schema](.claude/kernel/schema.yaml).

### 31. Execution Modes (Chat vs Agent Kernel)

**Problem**: When should Claude use the full Agent Kernel protocol vs respond conversationally? Automatic detection creates fuzzy boundaries and prevents benchmarking.

**Solution**: Two explicit execution modes with clean separation:

| Mode | Prompt Processing | State | Termination | Best For |
|------|-------------------|-------|-------------|----------|
| **Chat** (default) | Direct response | Conversation only | User-controlled | Quick questions, simple edits |
| **Agent Kernel** | `/run` → `/step` → primitives | RuntimeState + Tuple | Gradient-based | Complex implementations |

**Mode Commands**:
```bash
/kernel                  # Enter Agent Kernel mode
/kernel "implement X"    # Enter and start task immediately
/kernel SS-19            # Enter and seed from Linear issue

/chat                    # Return to chat mode

/mode                    # Check current mode
/mode kernel             # Switch to kernel mode
/mode chat               # Switch to chat mode
```

**Agent Kernel Mode Behavior**:
When in Agent Kernel mode, ALL prompts route through the full protocol:
```
User: "implement rate limiting"
  ↓ (automatic routing)
/run "implement rate limiting"
  ↓
/step → primitives → gradient evaluation → ...
```

**Chat Mode Behavior**:
Normal conversational Claude. Commands available when explicitly invoked.

**Why Two Modes?**

1. **Right-sized execution**: Not every task needs tuple machinery
2. **Benchmark value**: Chat mode = baseline, Kernel mode = enhanced
   ```
   Δ = Performance(Kernel) - Performance(Chat) = Agent Kernel value add
   ```
3. **User agency**: Explicit choice over execution context
4. **Mental clarity**: Always know which mode you're in

**When to Use Each**:

| Task Type | Recommended Mode |
|-----------|------------------|
| Quick questions | Chat |
| Simple edits | Chat |
| Exploration | Chat |
| Complex implementations | Kernel |
| Spec-driven development | Kernel |
| Team-visible work | Kernel |
| Long-running sessions | Kernel |

**State Preservation**:
Exiting Kernel mode saves RuntimeState to `.claude/state/runs/` for resumption.

See [/kernel command](.claude/commands/kernel.md), [/chat command](.claude/commands/chat.md), and [/mode command](.claude/commands/mode.md).

### 32. Cognitive Architecture (Unified Backend)

**Problem**: The previous architecture had a "mode" layer (focused/divergent/deliberative) that statically bound primitives to execution modes. But primitives already specify HOW to think via their prompts—mode was an unnecessary abstraction.

**Solution**: Agent-Kernel uses a **unified execution backend** (Claude-Flow) where `/step` dynamically decides agent count based on primitive execution hints and task context.

**Key Insight: Mode is Redundant**

Primitive prompts already provide explicit HOW:
- `/explore.md` says "enumerate alternatives, identify tradeoffs"
- `/decompose.md` says "break into sub-components"

"Mode" only added ONE dimension: parallelism/coordination. This can be determined dynamically.

**The Unified Architecture**:
```
┌─────────────────────────────────────────────────────────────────────┐
│  /run (WHEN to stop)                                                 │
│  - Gradient-based termination                                        │
│  - Loop control until learning stops                                 │
├─────────────────────────────────────────────────────────────────────┤
│  /step (WHAT + HOW)                                                  │
│  - Selects primitive based on intent                                 │
│  - Reads primitive.execution_hints                                   │
│  - Evaluates context (complexity, phase, option space)               │
│  - Decides agent count dynamically                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Claude-Flow Unified Backend (EXECUTE)                               │
│  - agents=1: Zero overhead (no swarm init)                           │
│  - agents>1: Swarm coordination (parallel execution)                 │
│  - Memory persistence (HNSW-indexed patterns)                        │
├─────────────────────────────────────────────────────────────────────┤
│  Activation Patterns (Agents)                                        │
│  - "coder" = pattern for "how to produce code"                       │
│  - "researcher" = pattern for "how to gather information"            │
│  - "reviewer" = pattern for "how to detect errors"                   │
├─────────────────────────────────────────────────────────────────────┤
│  Neural Substrate (Claude API)                                       │
│  - Token prediction = pattern completion                             │
└─────────────────────────────────────────────────────────────────────┘
```

**Execution Hints** (primitives declare in metadata.yaml):
```yaml
explore:
  execution_hints:
    parallelizable: true
    benefits_from_multiple_perspectives: true
    requires_coherence: false
    max_agents: 5
    model_preference: haiku
    rationale: "Exploration benefits from diverse parallel search"
```

**/step Dynamic Decision**:

| Context | Decision | Pattern |
|---------|----------|---------|
| `parallelizable=false` OR implementation phase | agents=1 | focused |
| `parallelizable=true` AND option_space>=3 | agents=N | parallel_explore |
| verification phase AND evidence_layers>=2 | agents=N | parallel_verify |
| `requires_consensus=true` | agents>=3 | consensus |

**Message Protocol**: All agents produce Messages that route to Tuple slots:
```yaml
Message:
  content: "result"
  tuple_binding:
    slot: Constraints | Invariant | Strategy | Check
    effect: expand | define | plan | verify
  metadata:
    agents: number  # How many agents executed
    pattern: string # Which execution pattern used
```

**Integration Pattern**:
```python
# /step decides primitive and agent count
primitive = detect_intent(task)
hints = primitive.execution_hints
context = evaluate_context(task)
agents = decide_agent_count(hints, context)

# Execute via Claude Code Task tool
if agents == 1:
    # Single agent path
    Task({ prompt: primitive.prompt, subagent_type: agent_type })
else:
    # Parallel agents (run in background)
    for partition in task_partitions:
        Task({
            prompt: f"{primitive.prompt} Focus: {partition}",
            subagent_type: "researcher",
            run_in_background: true
        })

# Route result to Tuple slot
result.tuple_binding → Tuple[slot].apply(result)
```

**Key Insight**: The layers don't "command" each other—they **enable** each other:
```
Metacognition doesn't tell Cognition what to think
   → It monitors whether thinking is going well and adjusts strategy

Cognition doesn't command Patterns
   → It coordinates which patterns are active and how they connect

Patterns don't control the Substrate
   → They emerge from the substrate's potential
```

**The Cognitive Mapping**:

| Cognitive Science | System Component | Function |
|-------------------|------------------|----------|
| Working memory | Thinking Tuple | Holding problem state |
| Cognitive strategies | Principles | Proven patterns of reasoning |
| Feeling of knowing | Gradient | Sensing pattern convergence |
| Parallel processing | Swarm | Multiple patterns active |
| Attention routing | Topology | How patterns influence each other |
| Long-term memory | HNSW Memory | Stored patterns for retrieval |
| "How to code" | Coder pattern | Produces code when activated |
| "How to research" | Researcher pattern | Gathers info when activated |
| "How to detect errors" | Reviewer pattern | Finds mistakes when activated |

**Why Patterns > Brain Regions**:

| Analogy | Maps Agent To | Limitation |
|---------|---------------|------------|
| Brain Region | Location (motor cortex) | Only captures WHERE, not WHAT |
| Activation Pattern | Concept (how-to-code) | Captures the behavior itself |

Patterns are more accurate because:
- Both entities ("car") and processes ("move") are concepts with firing patterns
- Patterns compose naturally ("moving car" = two patterns combined)
- Agent instantiation = pattern activation, not function invocation
- This aligns with enactive cognition (Varela, Thompson, Rosch)

See [Executor Registry](.claude/kernel/executors.yaml) and [ExecutorSpec in Schema](.claude/kernel/schema.yaml).

---

## Principle Routing Index

**Load additional principles based on current task:**

| If doing... | Load cluster | Principles |
|-------------|--------------|------------|
| **Deploying** | [deployment-principles](.claude/principles/deployment-principles.md) | #6, #11, #15, #19, #21 |
| **Writing tests** | [testing-principles](.claude/principles/testing-principles.md) | #10, #19 |
| **Database/data work** | [data-principles](.claude/principles/data-principles.md) | #3, #5, #14, #16 |
| **Secrets/config** | [configuration-principles](.claude/principles/configuration-principles.md) | #13, #24 |
| **API/error handling** | [integration-principles](.claude/principles/integration-principles.md) | #4, #7, #8, #22 |
| **Debugging/analysis** | [meta-principles](.claude/principles/meta-principles.md) | #9, #12, #17 |

See [Principles Index](.claude/principles/index.md) for keyword triggers and multi-cluster scenarios.

---

## Quick Principle Reference

| # | Principle | Tier | Cluster | Applicable |
|---|-----------|------|---------|------------|
| 1 | Defensive Programming | 0 | Core | Yes |
| 2 | Progressive Evidence | 0 | Core | Yes |
| 3 | Database-First Data | 1 | Data | No (no DB) |
| 4 | Type System Integration | 2 | Integration | Yes |
| 5 | Database Migrations | 2 | Data | No (no DB) |
| 6 | Deployment Monitoring | 2 | Deployment | Future |
| 7 | Loud Mock Pattern | 2 | Integration | Yes |
| 8 | Error Handling Duality | 2 | Integration | Yes |
| 9 | Feedback Loop Awareness | 3 | Meta | Yes |
| 10 | Testing Anti-Patterns | 2 | Testing | Yes |
| 11 | Artifact Promotion | 2 | Deployment | Future |
| 12 | OWL Relationship Analysis | 3 | Meta | Yes |
| 13 | Secret Management | 2 | Configuration | Yes |
| 14 | Database Resource Naming | 1 | Data | No (no DB) |
| 15 | Infrastructure-App Contract | 2 | Deployment | Future |
| 16 | Timezone Discipline | 1 | Data | Yes |
| 17 | Shared Virtual Environment | 3 | Meta | No |
| 18 | Logging Discipline | 0 | Core | Yes |
| 19 | Cross-Boundary Testing | 2 | Testing/Deployment | Yes |
| 20 | Execution Boundary | 0 | Core | Yes |
| 21 | Deployment Blocker | 2 | Deployment | Future |
| 22 | LLM Observability | 2 | Integration | No (no LLM) |
| 23 | Configuration Variation | 0 | Core | Yes |
| 24 | External Service Credentials | 2 | Configuration | Yes |
| 25 | Universal Property Verification | 0 | Core | Yes |
| 26 | Thinking Tuple Protocol | 0 | Core | Yes |
| 27 | Commands as Strategy Modes | 0 | Core | Yes |
| 28 | DSLP Framework Integration | 0 | Core | Yes |
| 29 | Unified Ontological Framework | 0 | Core | Yes |
| 30 | Semantic Inheritance | 0 | Core | Yes |
| 31 | Execution Modes | 0 | Core | Yes |
| 32 | Cognitive Architecture | 0 | Core | Yes |

**Legend**: Yes = applies now | Future = when deployment added | No = not applicable

---

## Extension Points

1. **Adding Business Logic**: Create modules in `src/` → integrate into main script (`meta_to_sheets.py`).

2. **Adding Data Sources**: Create parser module (like `meta_ads_parser.py`) → integrate into processing pipeline.

3. **Adding Output Targets**: Extend Google Sheets integration or add new output formats.

4. **Adding Scheduling**: Integrate with cron, AWS Lambda, or GitHub Actions for automated execution.

---

## Automated Pipeline: Linear → GitHub → Claude

This project uses an automated pipeline where team ideas in Linear trigger PRD generation and implementation.

### Pipeline Flow

```
Linear (idea) → Pipedream → GitHub Issue → Claude (PRD) → Human Review → Claude (Implementation) → PR Merge
```

### PRD Generation Guidelines

When generating PRDs via GitHub Actions, create files in `.claude/specs/{slug}/`:

**spec.yaml** - Feature contract:
```yaml
dslp: feature_contract
version: "1.0"
objective: {slug}
description: |
  What this feature does
owner: TBD
created: {date}
environments: [dev, prd]
dependencies: []
refs:
  invariants: []
  specs: []
```

**invariants.md** - What must be true (5-layer verification):
- L0 (User): User-facing behavior
- L1 (Service): API/service behavior
- L2 (Data): Data requirements
- L3 (Infra): Infrastructure requirements
- L4 (Config): Configuration requirements

**constraints.md** - Limitations and boundaries

**acceptance.md** - Testable acceptance criteria

### Implementation Guidelines

When implementing from PRD:
1. **Read the full PRD** before starting
2. **Follow existing patterns** in the codebase
3. **Write tests** that verify acceptance criteria
4. **Create focused PRs** - one feature per PR
5. **Reference the issue** - include `Closes #N` in PR description

### Workflow Files

- `.github/workflows/linear-idea-to-prd.yml` - Triggered by Linear ideas
- `.github/workflows/claude-respond.yml` - Responds to @claude mentions
- `.github/workflows/claude-implement.yml` - Implements approved PRDs
- `.github/workflows/cleanup-claude-branches.yml` - Cleans up after merge

See [Pipeline Setup Guide](docs/guides/linear-github-claude-pipeline-setup.md) for configuration.

---

## References

### Agent Kernel Components

- **Agent Kernel Architecture**: [AGENT-KERNEL.md](AGENT-KERNEL.md) - Complete system overview and glossary
- **Commands**: [.claude/commands/README.md](.claude/commands/README.md) - Slash command definitions
- **Skills**: [.claude/skills/README.md](.claude/skills/README.md) - Executable workflows and checklists
- **Principles**: [.claude/principles/](.claude/principles/) - Context-specific principles by task/domain
- **Specifications**: [.claude/specs/](.claude/specs/) - Spec-driven development by objective
- **Convergence State**: [.claude/state/](.claude/state/) - Runtime verification and checkpoint tracking
- **Invariants**: [.claude/invariants/](.claude/invariants/) - System invariant checklists

### Project Documentation

- **Project Conventions**: [docs/PROJECT_CONVENTIONS.md](docs/PROJECT_CONVENTIONS.md) - Directory structure, naming patterns, CLI commands
- **Implementation Guides**: [docs/guides/README.md](docs/guides/README.md) - Comprehensive how-to guides
- **Documentation Index**: [docs/README.md](docs/README.md) - Complete documentation index
- **Architecture Decisions**: [docs/adr/README.md](docs/adr/README.md) - ADRs for major technology choices
- **Deployment**: [docs/deployment/](docs/deployment/) - Complete deployment guides and runbooks
- **Code Style**: [docs/CODE_STYLE.md](docs/CODE_STYLE.md) - Detailed coding patterns and conventions
