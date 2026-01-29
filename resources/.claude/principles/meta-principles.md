# Meta Principles Cluster

**Load when**: Debugging persistent issues, stuck in loops, concept analysis

**Principles**: #9, #12 (applicable), #17 (not applicable - standalone project)

**Related**: [Thinking Process Architecture](../diagrams/thinking-process-architecture.md)

---

## Principle #9: Feedback Loop Awareness (APPLICABLE)

When failures persist, use `/reflect` to identify which loop type you're using:

| Loop Type | When to Use | Pattern |
|-----------|-------------|---------|
| **Retrying** | Fix execution errors | Same approach, different input |
| **Initial-sensitive** | Change assumptions | Same goal, different starting point |
| **Branching** | Try different path | Same goal, different approach |
| **Synchronize** | Align knowledge | Update understanding to match reality |
| **Meta-loop** | Change loop type | Stop and reconsider strategy |

**Thinking tools for loop identification**:
- `/trace` - Root cause analysis (why did this fail?)
- `/hypothesis` - Generate new assumptions
- `/compare` - Evaluate alternative paths
- `/reflect` - Identify current loop pattern

**When to switch loops**:
- 2+ failed retries → Switch from retrying to research
- Same error repeated → Initial-sensitive (wrong assumptions)
- No progress → Meta-loop (change strategy entirely)

**ss-automation examples**:
- Meta API rate limit → Retrying loop (with backoff)
- Google Sheets auth fails → Synchronize loop (update credentials)
- Wrong data format → Initial-sensitive (check API response structure)

See [Thinking Process Architecture - Feedback Loops](../diagrams/thinking-process-architecture.md#11-feedback-loop-types-self-healing-properties).

---

## Principle #12: OWL-Based Relationship Analysis (APPLICABLE)

Use formal ontology relationships (OWL, RDF) for structured concept comparison. Eliminates "it depends" answers by applying 4 fundamental relationship types:

| Relationship | Question | Example |
|--------------|----------|---------|
| **Part-whole** | Is X part of Y? | "Is data parsing part of the automation pipeline?" |
| **Complement** | Does X complete Y? | "Does caching complement API requests?" |
| **Substitution** | Can X replace Y? | "Can CSV export substitute Google Sheets?" |
| **Composition** | Is X composed of Y+Z? | "Is the pipeline composed of fetch + parse + write?" |

**Usage**:
```
/compare "CSV export vs Google Sheets"

Apply relationship analysis:
1. Part-whole: Both are parts of data export pipeline
2. Complement: CSV complements Sheets (backup/portability)
3. Substitution: Partial - CSV can replace Sheets for archival
4. Composition: Google Sheets = write API + formatting + sharing
```

**Benefit**: Transforms vague "X vs Y" questions into precise analytical frameworks with concrete examples.

See [Relationship Analysis Guide](../../docs/RELATIONSHIP_ANALYSIS.md).

---

## Principle #17: Shared Virtual Environment Pattern (NOT APPLICABLE)

> **Note**: ss-automation is a standalone project, not part of a multi-repository ecosystem.

This principle applies to related codebases sharing dependencies. For ss-automation, use standard isolated virtual environment:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## Principle #28: Semantic Scope Disambiguation (APPLICABLE)

When domain terminology is used, **clarify semantic scope before executing**. The same syntax (words) can map to vastly different semantic scopes (intended meaning).

### The Problem

| User Says | Narrow Scope | Broad Scope |
|-----------|--------------|-------------|
| "Make it like X" | Copy visible attributes | Clone structure + behavior |
| "Add the style of X" | CSS colors/fonts only | Full visual design system |
| "Fix the bug" | Make error disappear | Address root cause |
| "Improve performance" | Make faster | Optimize architecture |
| "Refactor this" | Rename variables | Restructure design |

### The Solution: Scope Clarification Protocol

Before executing requests that reference external examples or use domain terminology:

```
1. IDENTIFY the domain: UI design, architecture, data model, etc.

2. LIST possible scopes:
   - Surface level: [what this could mean minimally]
   - Structural level: [what this could mean moderately]
   - Full scope: [what this could mean completely]

3. ASK for clarification:
   "When you say '<term>', do you mean:
    A) [narrow scope] - just X
    B) [medium scope] - X + Y
    C) [broad scope] - X + Y + Z"

4. CONFIRM what will/won't be included before executing
```

### Example: "Style" in Web Design

```
User: "Apply the style of website X"

Possible scopes:
A) Color theme only → CSS variables, palette
B) Visual system → Colors + typography + spacing + shadows
C) Full design → Colors + typography + layout + components + interactions

Clarification needed:
"Style can mean different things. Do you want:
 A) Just the color scheme?
 B) Colors + fonts + spacing?
 C) Complete visual structure (hero layout, cards, sections)?"
```

### Key Insight

When users reference **external examples** ("like X", "style of X", "similar to X"), they typically mean **perceptual similarity** (how it looks/feels), not **technical component extraction** (individual values).

**Default assumption**: Broader scope unless user specifies narrow.

### Anti-Pattern

```
❌ Assume narrowest interpretation to minimize work
❌ Extract data points without considering gestalt
❌ Jump to implementation without scope confirmation
```

### Connection to Principle #25 (Universal Property Verification)

Semantic scope disambiguation and universal verification are **deeply connected**:

| Principle | Phase | Question |
|-----------|-------|----------|
| **#28 (Scope)** | Before execution | "What is the FULL scope of this request?" |
| **#25 (Universal)** | During verification | "Did I verify the FULL scope?" |

**The pattern**: Scope mismatch in requests (#28) leads to incomplete verification (#25).

```
User: "A matches B"
  ↓
#28: What is "match"? (narrow: colors | broad: full design)
  ↓
#25: Verify ALL units of chosen scope (∀ units: match)
  ↓
Report: "X of Y units match (Z%)"
```

**Failure mode**: Applying #25 (universal verification) to the wrong scope (not clarified via #28).

### Related

- **Principle #12 (OWL Analysis)**: Use relationship types to clarify "sameness"
  - Is it part-whole sameness? (component similarity)
  - Is it substitution sameness? (interchangeable)
  - Is it composition sameness? (made of same parts)
- **Principle #25 (Universal Property Verification)**: After clarifying scope, verify ALL units

---

## Quick Checklist

Stuck debugging:
- [ ] Identify current loop type (retrying? branching?)
- [ ] After 2 retries, switch to research
- [ ] Use `/reflect` to assess progress
- [ ] Use `/trace` for root cause

Concept comparison:
- [ ] Apply 4 relationship types
- [ ] Provide concrete examples
- [ ] Avoid "it depends" without framework

Semantic disambiguation:
- [ ] Identify if term has multiple scopes
- [ ] List narrow/medium/broad interpretations
- [ ] Clarify with user before executing
- [ ] Default to broader scope for external references

Universal verification:
- [ ] Recognize universal claims (∀ implicit in "same", "all", "complete")
- [ ] Decompose entity into ALL units (not just prominent)
- [ ] Verify EACH unit systematically
- [ ] Report coverage percentage explicitly
- [ ] Avoid Prominent Sample Bias (testing visible part only)
- [ ] Avoid Structural Proxy Bias (structural ≠ perceptual)
- [ ] Avoid Spatial Relationship Blindness (elements exist ≠ same arrangement)

Visual sameness verification (THREE layers required):
- [ ] Layer 1 (Elements): Verify what components exist
- [ ] Layer 2 (Appearance): Verify how each element looks (styling, colors, typography)
- [ ] Layer 3 (Spatial): Verify how elements relate spatially (above, below, inside, overlapping)
- [ ] Use visual comparison (screenshots) not just code inspection
- [ ] Explicitly describe spatial relationships ("X above Y", "X inside Y", "X overlapping Y")

---

*Cluster: meta-principles*
