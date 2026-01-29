# Tier-0: Core Principles (ALWAYS Apply)

These principles guide EVERY task. They are non-negotiable and form the foundation of the Agent Kernel protocol.

---

## #1. Defensive Programming

Fail fast and visibly when something is wrong. Silent failures hide bugs.

**Key practices:**
- Validate configuration at startup, not on first use
- Explicitly detect operation failures (rowcount, status codes)
- No silent fallbacks or default values that hide error recovery
- **Never assume data exists** without validating first

---

## #2. Progressive Evidence Strengthening

Execution completion ≠ Operational success. Verify through increasingly strong evidence:

| Layer | Type | Strength | Example |
|-------|------|----------|---------|
| **Layer 1** | Surface | Weakest | Status codes, exit codes |
| **Layer 2** | Content | Weak | Payloads, data structures |
| **Layer 3** | Observability | Strong | Traces, logs |
| **Layer 4** | Ground truth | Strongest | Actual state changes |

Never stop at weak evidence—progress until ground truth verified.

---

## #18. Logging Discipline (Storytelling Pattern)

Log for narrative reconstruction:
- **ERROR**: What failed
- **WARNING**: Unexpected but handled
- **INFO**: What happened
- **DEBUG**: How it happened

**Narrative structure**: Beginning (context) → Middle (milestones) → End (success/failure)

Logs are Layer 3 evidence. WHERE you log determines WHAT survives failures.

---

## #20. Execution Boundary Discipline

**Reading code ≠ Verifying code works.**

Before concluding "correct", verify:
1. WHERE does code run?
2. WHAT environment required?
3. WHAT systems called?
4. WHAT entity properties?
5. HOW verify contract?

---

## #25. Universal Property Verification (Generalized Invariant)

**Core insight**: Many claims are **universal quantifiers** (∀) requiring exhaustive verification, not **existential** (∃) requiring only one example.

Before claiming ANY universal property, verify the **FULL envelope**:

**For CORRECTNESS claims** ("system works"):
- Level 0 (User): User can X
- Level 1 (Service): Service returns Y
- Level 2 (Data): Data has Z
- Level 3 (Infra): A can reach B
- Level 4 (Config): X is set to Y

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

**Anti-patterns to avoid:**
- **Prominent Sample Bias**: Testing only the most visible part
- **Structural Proxy Bias**: Substituting structural verification for perceptual verification
- **Spatial Relationship Blindness**: Verifying elements exist without verifying their spatial relationships

---

## #26. Thinking Tuple Protocol (Universal Kernel)

**Meta-Invariant**: Every reasoning episode runs through a Thinking Tuple. The tuple is the OS; commands are apps running on it.

```
Tuple = (Constraints, Invariant, Principles, Strategy, Check)
```

| Component | Question | Source |
|-----------|----------|--------|
| **Constraints** | What do we have/know? | Current state, specs, context |
| **Invariant** | What must be true at end? | Success criteria |
| **Principles** | What tradeoffs guide us? | Tier-0 + task-specific clusters |
| **Strategy** | What modes to execute? | Pipeline of command-modes |
| **Check** | Did we satisfy invariant? | Progressive Evidence (Layers 1-4) |

**Tuple Router** (for any prompt):
| Intent | Default Strategy |
|--------|------------------|
| Goal-oriented (build X, fix Y) | `[/step]` |
| Exploration (what are options) | `[/explore]` |
| Verification (is X correct) | `[/validate]` |
| Deductive proof (prove X from Y) | `[/proof]` |
| Explanation (how does X work) | `[/understand]` |
| Comparison (X vs Y) | `[/what-if]` |
| Causal analysis (why X) | `[/trace]` |

**Error bound**: Without tuples, error ∝ (steps × drift). With tuples, error bounded by check frequency.

---

## #27. Commands as Strategy Modes

Commands are not independent—they are **modes within Strategy**.

**Command Types**:
- **Primitive**: Irreducible operations (~17 commands)
- **Process**: Ordered sequences of primitives
- **Alias**: Different name for a primitive
- **Meta**: Controls execution of other commands
- **Domain-specialized**: Primitive bound to domain
- **Output mode**: Produces artifacts, not Tuple operations
- **Utility**: Operational helpers

**Primitive Commands by Tuple Slot**:

| Slot | Commands | Mode |
|------|----------|------|
| **Constraints** | `/explore`, `/observe`, `/context`, `/hypothesis`, `/consolidate`, `/trace` | Expand what we know |
| **Invariant** | `/understand`, `/decompose`, `/specify`, `/feature` | Define what must be true |
| **Strategy** | `/what-if`, `/design` | Plan execution |
| **Check** | `/validate`, `/proof`, `/reflect`, `/invariant`, `/reconcile` | Verify invariant |
| **All** | `/step` | Full tuple orchestration (single pass) |
| **All** | `/run` | Full tuple orchestration (gradient loop) |

---

## #28. DSLP Framework Integration (Pattern-Based Reasoning)

**Problem**: Micro-level replication of complex behaviors is time-consuming and doesn't converge.

**Solution**: DSLP (DSL-driven Semantic Layer Protocol) - pattern-based reasoning framework.

**Core Insight**: DSLP is a **meta-layer** that defines the vocabulary/grammar for specifications in a domain. Specifications are instances of DSLPs. Commands operate on specifications.

**Three-Layer Architecture**:
```
Layer 2: DSLP (Domain Languages) - Defines vocabulary, grammar, patterns
Layer 1: Specification (Instances of DSLPs) - Declarative desired state
Layer 0: Commands (Operations on Specs) - Create, verify, implement
```

**DSLP Processing Pipeline** (L0→L4):
```
L0: Natural Language Intent
L1: Semantic Specification (domain-shaped meaning)
L2: Pattern Plan (named reusable solutions)
L3: Implementation Plan (technology-specific mapping)
L4: Artifacts (code, configs, diagrams)
```

---

## #29. Unified Ontological Framework (Agent Protocol)

All Agent Kernel components share a **universal formal structure** built on **11 irreducible metaphysical primitives**:

**Static (What exists)**:
- Entity (things)
- Property (attributes)
- Relation (connections)
- Constraint (limits)

**Dynamic (What happens)**:
- Event (instantaneous occurrence)
- Process (extended activity)
- State (snapshots in time)
- Context (framing conditions)

**Computational (How to derive and reason)**:
- Function (input→output mappings)
- Identity (same-entity-across-time criteria)
- Modality (alternative worlds/perspectives)

**Universal Component Signature**:
```yaml
Component = {
  domain: Domain | null,
  entities: Entity[],
  relations: Relation[],
  properties: { domain_agnostic: [], domain_specific: [] },
  constraints: Constraint[],
  tuple_binding: { slot: TupleSlot, effect: TupleEffect }
}
```

---

## #30. Semantic Inheritance (Agent-Native Composability)

**Problem**: How do Agent Kernel components compose?

**Solution**: **Semantic Inheritance** - a template-based inheritance system where children have a "voice" to explain HOW they want to inherit from parents.

**Voice Directives**:
| Directive | Meaning |
|-----------|---------|
| `before` | Child first, then parent |
| `after` | Parent first, then child |
| `instead` | Replace parent completely |
| `wrap` | Child provides context, parent runs inside |
| `filter` | Parent runs, child filters output |
| `transform` | Parent runs, child transforms output |
| `interleave` | Alternate parent and child steps |
| `extend` | Parent + child additions |

---

## #31. Execution Modes (Chat vs Agent Kernel)

Two explicit execution modes with clean separation:

| Mode | Processing | State | Best For |
|------|------------|-------|----------|
| **Chat** (default) | Direct response | Conversation only | Quick questions, simple edits |
| **Agent Kernel** | `/run` → `/step` → primitives | RuntimeState + Tuple | Complex implementations |

**Mode Commands**:
```bash
/kernel    # Enter Agent Kernel mode
/chat      # Return to chat mode
/mode      # Check current mode
```

---

## #32. Cognitive Architecture (Unified Backend)

Agent-Kernel uses a **unified execution backend** where `/step` dynamically decides agent count based on primitive execution hints and task context.

**Key Insight**: Mode is Redundant. Primitive prompts already provide explicit HOW. Mode only adds parallelism/coordination, which can be determined dynamically.

**The Unified Architecture**:
```
/run (WHEN to stop) - Gradient-based termination
  ↓
/step (WHAT + HOW) - Selects primitive, decides agent count
  ↓
Unified Backend (EXECUTE) - Single or parallel execution
  ↓
Activation Patterns (Agents) - coder, researcher, reviewer, etc.
  ↓
Neural Substrate (Claude API) - Token prediction = pattern completion
```

---

## #33. Consciousness Architecture

The **Consciousness Architecture** maps to functional consciousness from cognitive science.

**The Four-Layer Model**:

| Layer | Implementation | Function |
|-------|----------------|----------|
| **Self** | CLAUDE.md | Identity, preferences, constraints |
| **Episodic Memory** | Blackboard MCP | Path-dependent experiences |
| **Semantic Memory** | Graphiti MCP | Context-free facts |
| **Procedural Memory** | Agent Kernel MCP | How-to-think patterns |
| **Working Memory** | Thinking Tuple | Active problem state |
| **Priming** | Context Window | Recently activated concepts |
| **Prospective Memory** | Linear MCP | Future intentions |

**Key Insight**: The **Self layer** (CLAUDE.md) is unique. Unlike standard cognitive architectures, this has explicit representation of identity that shapes ALL processing.

---

## Quick Reference

| # | Principle | One-liner |
|---|-----------|-----------|
| 1 | Defensive Programming | Fail fast, no silent failures |
| 2 | Progressive Evidence | Verify weak → strong evidence |
| 18 | Logging Discipline | Log for narrative reconstruction |
| 20 | Execution Boundary | Reading code ≠ verifying it works |
| 25 | Universal Property Verification | Verify ALL units for universal claims (∀) |
| 26 | Thinking Tuple Protocol | Universal reasoning kernel |
| 27 | Commands as Strategy Modes | Commands are modes within Strategy |
| 28 | DSLP Framework | Pattern-based reasoning |
| 29 | Unified Ontological Framework | 11 metaphysical primitives |
| 30 | Semantic Inheritance | Agent-native composability |
| 31 | Execution Modes | Chat vs Agent Kernel |
| 32 | Cognitive Architecture | Unified backend |
| 33 | Consciousness Architecture | Four-layer cognitive model |
