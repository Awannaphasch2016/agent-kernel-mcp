---
name: sameness
description: Run full sameness test between original and clone websites using Layer 4 (Behavior) instrumentation
accepts_args: true
arg_schema:
  - name: original_url
    required: true
    description: "URL of the original/reference site"
  - name: clone_url
    required: true
    description: "URL of the clone site to verify"
composition:
  - skill: sameness-testing

# Agent Kernel Protocol (Principle #29)
domain: ui_comparison
tuple_binding:
  slot: Check
  effect: verify_behavioral
local_check: "Sameness report with 4-layer scores and Delta calculation"
entities:
  - trace
  - layer
  - difference
  - score
relations:
  - compares
  - instruments
  - measures
  - reports
---

# Sameness Command

**Purpose**: Run full sameness test between original and clone websites using Layer 4 (Behavior) instrumentation

**Core Principle**: "Same" requires verification across ALL four layers - Elements, Appearance, Spatial, AND Behavior.

**When to use**:
- After visual clone is complete, verify behavior matches
- Before claiming "done" on replication task
- To discover hidden behavior differences

---

## Quick Reference

```bash
# Compare two sites
/sameness "https://original.com" "https://clone.com"

# Compare with specific scenario
/sameness "https://original.com" "https://clone.com" --scenario full_scroll_desktop

# Compare at mobile viewport
/sameness "https://original.com" "https://clone.com" --scenario full_scroll_mobile
```

---

## Execution Flow

### Step 1: Open Original with Instrumentation

```python
# Inject instrumentation.js BEFORE page load
page.add_init_script(INSTRUMENTATION_JS)
page.goto(original_url)
```

### Step 2: Run Scenario on Original

```python
# Default: full_scroll_desktop
scenario = get_scenario("full_scroll_desktop")
run_scenario(page, scenario)
```

### Step 3: Collect Original Trace

```python
original_trace = page.evaluate("window.__collectTrace()")
save_trace(original_trace, "/tmp/traces/original/")
```

### Step 4: Repeat for Clone

```python
page.add_init_script(INSTRUMENTATION_JS)
page.goto(clone_url)
run_scenario(page, scenario)
clone_trace = page.evaluate("window.__collectTrace()")
```

### Step 5: Compare Traces

```python
from comparison import compare_traces, format_report

report = compare_traces(original_trace, clone_trace)
print(format_report(report))
```

### Step 6: Output Report

```markdown
# Sameness Report

**Original**: https://original.com
**Clone**: https://clone.com
**Scenario**: full_scroll_desktop

**Overall Score**: 87%

## Layer Scores

| Layer | Score |
|-------|-------|
| Elements | 98% ✅ |
| Appearance | 92% ✅ |
| Spatial | 95% ✅ |
| Behavior | 63% ⚠️ |

## Differences

### 🟠 Major
- **animation:fadeIn**: Duration differs (300ms vs 500ms)

### 🟡 Minor
- **event:scroll**: Count mismatch (15 vs 8)
```

---

## Available Scenarios

| Scenario | Viewport | Description |
|----------|----------|-------------|
| `full_scroll_desktop` | 1920x1080 | Scroll entire page at desktop |
| `full_scroll_mobile` | 390x844 | Scroll at mobile viewport |
| `hover_all_buttons` | 1920x1080 | Hover every interactive element |
| `click_all_ctas` | 1920x1080 | Click all CTA buttons |
| `resize_during_scroll` | Variable | Test responsive behavior |

---

## Output Files

```
/tmp/traces/{session_id}/
├── original/
│   ├── trace.json
│   └── screenshots/
└── clone/
    ├── trace.json
    └── screenshots/
```

---

## Integration

Completes Layer 4 verification for `/invariant` sameness claims:

```bash
/invariant "make clone same as original"
# → Identifies violations across 4 layers

/sameness "https://original.com" "https://clone.com"
# → Specifically tests Layer 4 (Behavior)

/reconcile
# → Generates fixes for behavior mismatches
```

---

## See Also

- [sameness-testing skill](../skills/sameness-testing/)
- `/squeeze` - Discover hidden behaviors
- `/compare-behavior` - Compare specific behavior
- [Principle #25](../CLAUDE.md) - Universal Property Verification
