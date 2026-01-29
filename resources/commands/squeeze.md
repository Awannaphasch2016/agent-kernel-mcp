---
name: squeeze
description: Discover hidden behaviors through systematic fuzzing - find behaviors not obvious from static analysis
accepts_args: true
arg_schema:
  - name: url
    required: true
    description: "URL of site to discover hidden behaviors"
composition:
  - skill: sameness-testing

# Agent Kernel Protocol (Principle #29)
domain: behavioral_fuzzing
tuple_binding:
  slot: Constraints
  effect: discover
local_check: "BehaviorSpec[] extracted with replication checklist"
entities:
  - candidate
  - behavior
  - trigger
  - effect
  - behavior_spec
relations:
  - fuzzes
  - discovers
  - extracts
  - documents
---

# Squeeze Command

**Purpose**: Discover hidden behaviors through systematic fuzzing - find behaviors that aren't obvious from static analysis

**Core Principle**: "Hidden behavior squeezing" - systematically pull out behavior that isn't visible through static inspection.

**When to use**:
- Before replicating a site, discover what behaviors need replication
- After visual clone, find behavior differences you missed
- To understand complex interactive sites

---

## Quick Reference

```bash
# Discover all hidden behaviors
/squeeze "https://site.com"

# Focus on specific interaction type
/squeeze "https://site.com" --focus hover
/squeeze "https://site.com" --focus scroll
/squeeze "https://site.com" --focus click
```

---

## Behavior Squeezing Protocol

### Phase 1: Baseline Capture

```python
# Run default scenario (full scroll, no interactions)
run_scenario(page, "full_scroll_desktop")
baseline_trace = collect_trace()
```

### Phase 2: Fuzz Interactions

```python
# Find all interactive candidates
candidates = find_interactive_elements()
# - Links, buttons
# - Elements with role="button"
# - Elements with cursor: pointer

for element in candidates:
    scroll_to(element)
    hover(element)
    click(element)
    scroll_a_bit()
    fuzz_trace = collect_trace()
```

### Phase 3: Detect New Behaviors

```python
for fuzz_trace in fuzz_traces:
    new_events = fuzz_trace.events - baseline_trace.events
    new_dom = fuzz_trace.dom - baseline_trace.dom
    new_animations = fuzz_trace.animations - baseline_trace.animations

    if new_events or new_dom or new_animations:
        mark_as_interesting(element, new_behaviors)
```

### Phase 4: Drill Down

```python
for interesting_element in interesting_elements:
    run_focused_scenario(element)
    behavior_spec = extract_behavior_spec()
```

---

## Output: BehaviorSpec

```yaml
behaviors:
  - element: ".hero-cta"
    trigger: "hover"
    effects:
      - type: animation
        name: "scale"
        duration: "200ms"
      - type: dom
        change: "append .tooltip"

  - element: ".stats-section"
    trigger: "scroll:800px"
    effects:
      - type: animation
        name: "staggerFadeIn"
        duration: "500ms"

  - element: ".faq-item"
    trigger: "click"
    effects:
      - type: dom
        change: "toggle .expanded"
      - type: animation
        name: "slideDown"
        duration: "300ms"
```

---

## Execution Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BEHAVIOR SQUEEZING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1: BASELINE                                              │
│  ─────────────────                                              │
│  run_scenario(full_scroll)                                      │
│  baseline = collect_trace()                                     │
│                                                                  │
│  PHASE 2: FUZZ                                                  │
│  ────────────────                                               │
│  candidates = find_interactive_elements()                       │
│  for each: scroll → hover → click → collect_trace()            │
│                                                                  │
│  PHASE 3: DETECT                                                │
│  ───────────────                                                │
│  for each fuzz_trace:                                           │
│    diff = fuzz_trace - baseline                                 │
│    if diff: mark_interesting()                                  │
│                                                                  │
│  PHASE 4: DRILL DOWN                                            │
│  ──────────────────                                             │
│  for each interesting:                                          │
│    focused_scenario()                                           │
│    extract_behavior_spec()                                      │
│                                                                  │
│  OUTPUT: BehaviorSpec[]                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Interactive Element Detection

The fuzzer finds candidates by:

```javascript
// CSS selectors for interactive elements
const selectors = [
  'a[href]',
  'button',
  '[role="button"]',
  '[onclick]',
  '[onmouseover]',
  '[data-cta]',
  '.btn',
  '.cta'
];

// Plus elements with interactive cursor
const withPointer = document.querySelectorAll('*');
for (const el of withPointer) {
  const style = getComputedStyle(el);
  if (style.cursor === 'pointer') {
    candidates.push(el);
  }
}
```

---

## Example Output

```markdown
# Behavior Discovery Report

**Site**: https://www.leadflow-marketing.de/
**Candidates Found**: 47 interactive elements
**New Behaviors Discovered**: 12

---

## Discovered Behaviors

### Scroll-Triggered Animations

1. **`.hero-stats`** (scroll: 200px)
   - Animation: `fadeInUp` (400ms)
   - Stagger: 100ms between children

2. **`.process-timeline`** (scroll: 1500px)
   - Animation: `drawLine` (1000ms)
   - Children animate sequentially

### Hover Effects

3. **`.testimonial-card`** (hover)
   - Border color change
   - Shadow increase
   - Scale: 1.02

4. **`.cta-button`** (hover)
   - Background gradient shift
   - Arrow icon animate right

### Click Behaviors

5. **`.faq-item`** (click)
   - Toggle `.expanded` class
   - Height animation (300ms)
   - Icon rotation (180deg)

---

## Replication Checklist

- [ ] Implement scroll observer for `.hero-stats` fadeIn
- [ ] Add hover effects to `.testimonial-card`
- [ ] Implement FAQ accordion with animation
- [ ] Add CTA button hover animation
```

---

## Integration

Use `/squeeze` before `/sameness` to know what to test:

```bash
# 1. Discover what behaviors exist
/squeeze "https://original.com"
# → Returns BehaviorSpec[]

# 2. Implement behaviors in clone
# ... code ...

# 3. Verify behaviors match
/sameness "https://original.com" "https://clone.com"
```

---

## See Also

- [sameness-testing skill](../skills/sameness-testing/)
- `/sameness` - Full sameness test
- `/compare-behavior` - Compare specific behavior
- [Principle #25](../CLAUDE.md) - Layer 4 (Behavior)
