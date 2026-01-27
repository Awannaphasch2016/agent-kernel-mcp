---
name: compare-behavior
description: Compare specific behavior between original and clone sites - targeted verification for a single element or interaction
accepts_args: true
arg_schema:
  - name: behavior_description
    required: true
    description: "Natural language description of behavior to compare (e.g., 'scroll animation on .hero', 'hover effect on .cta-button')"
composition:
  - skill: sameness-testing

# Agent Kernel Protocol (Principle #29)
domain: ui_comparison
tuple_binding:
  slot: Check
  effect: verify_targeted
local_check: "Behavior comparison with property diff and match percentage"
entities:
  - element
  - trigger
  - animation
  - property
  - diff
relations:
  - compares
  - triggers
  - captures
  - reports
---

# Compare-Behavior Command

**Purpose**: Compare specific behavior between original and clone sites - targeted verification for a single element or interaction

**Core Principle**: Sometimes you need to drill into ONE specific behavior rather than running full sameness test.

**When to use**:
- `/sameness` reported a specific behavior diff - drill in for details
- Testing a specific animation or interaction you just implemented
- Debugging why a particular element behaves differently

---

## Quick Reference

```bash
# Compare scroll animation on hero
/compare-behavior "scroll animation on .hero"

# Compare hover effect on buttons
/compare-behavior "hover effect on .cta-button"

# Compare click behavior on FAQ
/compare-behavior "click on .faq-item"
```

---

## Execution Flow

### Step 1: Parse Target

```python
# Parse natural language to element + trigger
target = parse_target("scroll animation on .hero")
# → { element: ".hero", trigger: "scroll", behavior: "animation" }
```

### Step 2: Find Element on Both Sites

```python
original_element = original_page.locator(target.element)
clone_element = clone_page.locator(target.element)

# Verify element exists on both
assert original_element.count() > 0, f"Element {target.element} not found on original"
assert clone_element.count() > 0, f"Element {target.element} not found on clone"
```

### Step 3: Trigger Behavior

```python
if target.trigger == "scroll":
    scroll_to_element(element)
    wait_for_animation()

elif target.trigger == "hover":
    element.hover()
    wait_for_animation()

elif target.trigger == "click":
    element.click()
    wait_for_animation()
```

### Step 4: Capture Animation Timeline

```python
# Get animation state immediately after trigger
original_animation = original_page.evaluate(f'''
    const el = document.querySelector("{target.element}");
    const anims = el.getAnimations();
    return anims.map(a => ({{
        name: a.animationName,
        duration: a.effect.getTiming().duration,
        delay: a.effect.getTiming().delay,
        easing: a.effect.getTiming().easing,
        currentTime: a.currentTime,
        playState: a.playState
    }}));
''')

clone_animation = clone_page.evaluate(/* same */)
```

### Step 5: Compare and Report

```markdown
# Behavior Comparison: scroll animation on .hero

**Element**: `.hero`
**Trigger**: scroll into view

## Original

| Property | Value |
|----------|-------|
| Animation | `fadeInUp` |
| Duration | 400ms |
| Delay | 0ms |
| Easing | `ease-out` |

## Clone

| Property | Value |
|----------|-------|
| Animation | `fadeIn` |
| Duration | 600ms |
| Delay | 100ms |
| Easing | `ease` |

## Differences

| Property | Original | Clone | Status |
|----------|----------|-------|--------|
| Animation Name | fadeInUp | fadeIn | ❌ Different |
| Duration | 400ms | 600ms | ❌ +200ms |
| Delay | 0ms | 100ms | ❌ +100ms |
| Easing | ease-out | ease | ⚠️ Different |

## Recommendation

Update clone `.hero` animation:
- Change animation name to `fadeInUp`
- Reduce duration to 400ms
- Remove 100ms delay
- Use `ease-out` easing
```

---

## Supported Behavior Types

| Trigger | What's Captured |
|---------|----------------|
| `scroll` | Scroll-triggered animations, intersection events |
| `hover` | Hover state changes, mouseenter animations |
| `click` | Click handlers, DOM mutations, animations |
| `focus` | Focus state changes, form animations |
| `resize` | Responsive breakpoint changes |

---

## Natural Language Parsing

The command understands various phrasings:

```bash
# All equivalent:
/compare-behavior "scroll animation on .hero"
/compare-behavior "animation when scrolling to .hero"
/compare-behavior ".hero scroll animation"
/compare-behavior "fadeIn on .hero during scroll"
```

Parsed to:
```yaml
element: ".hero"
trigger: "scroll"
behavior: "animation"
```

---

## Detailed Output Modes

### Default: Summary

```markdown
## Behavior Comparison: .hero scroll animation

| Aspect | Original | Clone | Match |
|--------|----------|-------|-------|
| Animation | fadeInUp | fadeIn | ❌ |
| Duration | 400ms | 600ms | ❌ |
| Timing | ease-out | ease | ⚠️ |

**Score**: 40% match
```

### Verbose: Full Timeline

```bash
/compare-behavior "scroll animation on .hero" --verbose
```

```markdown
## Animation Timeline

### Original
- t=0ms: Element enters viewport
- t=0ms: `fadeInUp` starts
- t=200ms: 50% complete
- t=400ms: Animation ends

### Clone
- t=0ms: Element enters viewport
- t=100ms: `fadeIn` starts (100ms delay!)
- t=400ms: 50% complete
- t=700ms: Animation ends

### Visual Diff
[Screenshot at t=200ms showing difference]
```

---

## Integration

```bash
# Full workflow:

# 1. Run full sameness test
/sameness "https://original.com" "https://clone.com"
# → Reports: "animation:hero differs"

# 2. Drill into specific behavior
/compare-behavior "scroll animation on .hero"
# → Shows exact differences

# 3. Fix and re-test
# ... update animation code ...
/compare-behavior "scroll animation on .hero"
# → Verify fix
```

---

## See Also

- [sameness-testing skill](../skills/sameness-testing/)
- `/sameness` - Full sameness test
- `/squeeze` - Discover hidden behaviors
- [Principle #25](../CLAUDE.md) - Layer 4 (Behavior)
