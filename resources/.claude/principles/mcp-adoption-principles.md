# Principle #34: Occam's Razor Implementation

**Tier**: 0 (Core) — applies to ALL implementation decisions

---

## Core Statement

**Start with the minimum viable configuration that achieves the goal. Escalate complexity only when you observe a specific failure at the current level. Each escalation adds exactly one mechanism. When all levels are exhausted, you've found the limitation boundary of the approach itself.**

This is not about being lazy — it's about **making complexity legible**. When something breaks, you know exactly which level failed and what to add. When everything works, you know nothing is superfluous.

---

## The General Pattern

```
Level 0: Minimum viable (default behavior)
Level 1: + One declarative instruction
Level 2: + One enforcement mechanism
Level 3: + One optimization
Level N: + ...
────────────────────────────────────
Level N+1: Approach limitation → Rethink
```

### Rules

1. **Start at Level 0**. Always. No exceptions.
2. **Observe actual behavior** before escalating. Never assume failure.
3. **Add one thing** per escalation. Not two. Not "just in case."
4. **Each level must have a test** that proves it's needed.
5. **Escalation is reversible**. If Level 1 suffices after testing Level 2, remove Level 2.
6. **Document why** each level was added (the failure that triggered escalation).

---

## Why This Matters for Agent Kernel

The Agent Kernel has many layers (principles, commands, skills, hooks, MCPs, DSLPs). Without Occam's Razor discipline, configurations become **cargo-cult** — layers added "because they might help" with no evidence they're needed.

**The anti-pattern**: Adding all layers at once, then being unable to diagnose which one actually drives behavior.

**The discipline**: Progressive escalation with evidence at each step.

---

## Interaction with Other Principles

| Principle | Occam's Razor Says |
|-----------|--------------------|
| #1 Defensive Programming | Fail fast applies — but don't add defensive code for impossible scenarios |
| #2 Progressive Evidence | Strengthen evidence progressively — don't jump to Layer 4 when Layer 2 suffices |
| #23 Configuration Variation | Choose the simplest config mechanism that fits the variation axis |
| #25 Universal Property Verification | Verify exhaustively — but only what's claimed, not what's imagined |
| #26 Thinking Tuple | Use the full tuple — but don't create tuples for trivial tasks (Principle #31) |

**Key tension**: Occam's Razor doesn't override other principles. It governs **when to apply** them. You still do defensive programming — but you don't add error handling for cases that can't occur. You still verify — but you don't verify properties nobody claimed.

---

## Domain Applications

Occam's Razor instantiates differently per domain. Each domain has its own escalation ladder:

| Domain | Skill | Escalation Ladder |
|--------|-------|-------------------|
| **MCP Integration** | [mcp-integration skill](.claude/skills/mcp-integration/SKILL.md) | Level 0-4: registration → CLAUDE.md → hook → script → permissions |
| **Deployment** | [deployment skill](.claude/skills/deployment/SKILL.md) | Start local → add CI → add staging → add canary |
| **Testing** | [testing-workflow skill](.claude/skills/testing-workflow/SKILL.md) | Unit → integration → e2e → chaos |
| **Error Handling** | — | Return code → exception → retry → circuit breaker |

Each domain skill defines its own levels. Principle #34 provides the **meta-pattern** that all domain ladders follow.

---

## Anti-Patterns

### A1: Cargo-Cult Configuration
Adding all levels at once "just in case". Obscures causation.

### A2: Premature Optimization
Adding Level 3 (optimization) before confirming Level 1 (basic) works.

### A3: Invisible Complexity
Adding mechanisms without documenting which failure triggered them. Future you won't know what's load-bearing vs vestigial.

### A4: Assuming Failure Without Observing
Jumping to Level 3 because "it might not work at Level 1". Always test first.

### A5: Irreversible Escalation
Never removing higher levels after finding lower levels sufficient. Dead config is technical debt.

---

## See Also

- [MCP Integration Skill](.claude/skills/mcp-integration/SKILL.md) — Domain-specific Occam's Razor for MCP servers
- Principle #23: Configuration Variation Axis
- Principle #31: Execution Modes (chat vs kernel = Occam's Razor for reasoning overhead)
