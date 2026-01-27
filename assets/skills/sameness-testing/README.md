# Sameness Testing Skill

Playwright-based instrumentation for **Layer 4 (Behavior)** verification in sameness claims.

## Overview

When claiming two websites are "the same", we must verify FOUR layers:

| Layer | What to Verify | How |
|-------|----------------|-----|
| 1. Elements | DOM structure matches | DOM diff |
| 2. Appearance | Visual styling matches | Screenshot comparison |
| 3. Spatial | Layout positions match | Bounding box comparison |
| 4. Behavior | Interactions match | **This skill** |

This skill provides tools to capture and compare **Layer 4 (Behavior)**:
- Event listeners (scroll, hover, click handlers)
- Scroll animations and timelines
- CSS animations and keyframes
- DOM mutations during interaction

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAMENESS TESTING FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. INSTRUMENT                                                   │
│     └── Inject instrumentation.js BEFORE page load               │
│                                                                  │
│  2. RUN SCENARIO                                                 │
│     └── Execute scroll/hover/click patterns                      │
│                                                                  │
│  3. COLLECT TRACES                                               │
│     └── Extract event registry, scroll timeline, animations      │
│                                                                  │
│  4. COMPARE                                                      │
│     └── Diff traces from original vs clone                       │
│                                                                  │
│  5. REPORT                                                       │
│     └── Score (0-100%) + specific diffs                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| `instrumentation.js` | JavaScript injected before page load |
| `scenarios.py` | Scenario definitions (scroll, hover, click) |
| `comparison.py` | Trace comparison engine |
| `screenshot-protocol.md` | **Animation-aware screenshot capture** |
| `_manifest.yml` | Skill metadata |

## Critical: Animation-Aware Screenshot Capture

**Problem**: Full-page screenshots capture DOM state, not visual state. Elements using `IntersectionObserver` remain at `opacity: 0` until scrolled into view.

**Solution**: Use the **Scroll-Wait-Capture Protocol** documented in [`screenshot-protocol.md`](./screenshot-protocol.md):

```javascript
// WRONG: Fast scroll (leaves elements invisible)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.screenshot({ path: 'bad.png', fullPage: true });

// CORRECT: Step through page, wait at each step
for (let y = 0; y < scrollHeight; y += viewportHeight * 0.7) {
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
  await page.waitForTimeout(600); // Wait for IntersectionObserver + animation
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.screenshot({ path: 'good.png', fullPage: true });
```

**Symptoms of Bad Capture**:
- Large empty areas with gradient backgrounds
- Only hero and footer visible
- Screenshot file size smaller than expected
- "Ghost" outlines where content should be

See [screenshot-protocol.md](./screenshot-protocol.md) for full documentation.

## Usage

### Via Commands

```bash
# Full sameness test
/sameness "https://original.com" "https://clone.com"

# Discover hidden behaviors
/squeeze "https://site.com"

# Compare specific behavior
/compare-behavior "scroll animation on .hero"
```

### Via Python

```python
from playwright.sync_api import sync_playwright
from pathlib import Path

# Load instrumentation script
instrumentation_js = Path(".claude/skills/sameness-testing/instrumentation.js").read_text()

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    # Inject BEFORE page load
    page.add_init_script(instrumentation_js)

    # Navigate
    page.goto("https://example.com")

    # Run scenario (scroll to bottom)
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

    # Collect trace
    trace = page.evaluate("window.__collectTrace()")

    # Save trace
    import json
    Path("/tmp/trace.json").write_text(json.dumps(trace, indent=2))
```

## Scenarios

| Scenario | Description | Captures |
|----------|-------------|----------|
| `full_scroll_desktop` | Scroll entire page at 1920x1080 | scroll_timeline, animations |
| `full_scroll_mobile` | Scroll at 390x844 | scroll_timeline |
| `hover_all_buttons` | Hover every interactive element | event_registry, dom_mutations |
| `click_all_ctas` | Click all CTA buttons | event_registry, navigation |
| `resize_during_scroll` | Test responsive behavior | layout_shifts |
| `random_walk` | Fuzzing with random interactions | all |

## Trace Format

```json
{
  "timestamp": "2026-01-17T...",
  "url": "https://example.com",
  "viewport": { "width": 1920, "height": 1080 },
  "pageHeight": 5000,
  "events": {
    "registry": [...],
    "registryByType": { "scroll": 15, "click": 8 }
  },
  "scroll": {
    "timeline": [{ "t": 0, "y": 0 }, { "t": 100, "y": 500 }],
    "maxY": 4000,
    "duration": 3000
  },
  "animations": {
    "running": [{ "name": "fadeIn", "duration": 300 }],
    "keyframes": [{ "name": "fadeIn" }]
  },
  "domMutations": { "added": 50, "removed": 10 }
}
```

## Comparison Output

```markdown
# Sameness Report

**Overall Score**: 87%

## Layer Scores

| Layer | Score |
|-------|-------|
| Elements | 98% ✅ |
| Appearance | 92% ✅ |
| Spatial | 95% ✅ |
| Behavior | 63% ⚠️ |

## Differences

### 🟠 Major (2)

- **animation:fadeIn**: Animation duration differs: 300ms vs 500ms
- **event:scroll**: Event count mismatch: 15 → 8

### 🟡 Minor (1)

- **scroll:maxDepth**: Scroll depth differs: 4000px vs 4200px
```

## Integration with Agent Kernel

This skill extends **Principle #25 (Universal Property Verification)** by adding Layer 4 verification:

```markdown
**For SAMENESS claims specifically**, decompose into FOUR layers:

Layer 1 (Elements): What components exist
Layer 2 (Appearance): How each element looks
Layer 3 (Spatial): How elements relate spatially
Layer 4 (Behavior): How elements respond ← THIS SKILL
```

## Related Commands

- `/sameness` - Full sameness test
- `/squeeze` - Behavior discovery via fuzzing
- `/compare-behavior` - Compare specific behavior
- `/invariant` - Identify what must hold
- `/reconcile` - Fix violations

## See Also

- [CLAUDE.md - Principle #25](../../CLAUDE.md)
- [behavior-invariants.md](../../invariants/behavior-invariants.md)
- [meta-principles.md](../../principles/meta-principles.md)
