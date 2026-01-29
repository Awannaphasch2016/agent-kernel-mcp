---
name: animate
description: Web animation implementation using DSLP pattern-based reasoning
accepts_args: true
arg_schema:
  - name: description_or_url
    required: true
    description: "Natural language animation description OR URL to extract animations from"
composition:
  - skill: dslp-core
  - skill: domain-web-animation

# Agent Kernel Protocol (Principle #29)
domain: web_motion
tuple_binding:
  slot: Strategy
  effect: implement
local_check: "Artifacts generated with Delta ≤ 0.03 (97% match)"
entities:
  - animation
  - pattern
  - semantic_spec
  - artifact
relations:
  - parses
  - matches
  - generates
  - verifies
---

# /animate - Web Animation Implementation Command

## Overview

The `/animate` command is a convenience wrapper that composes DSLP Core pipeline, web-motion domain pack, and domain-web-animation skill to generate web animations from natural language descriptions.

**Command Type**: Static skill composition wrapper
**Domain**: web_motion
**Framework**: DSLP (DSL-driven Semantic Layer Protocol)

## Usage

```
/animate "<natural language description>"
/animate extract "<URL>"
/animate match "<URL>" to "<description>"
```

## Modes

### Mode 1: Generate from Description

**Syntax**: `/animate "<description>"`

**Example**:
```
/animate "cards fade and slide up when they enter viewport, stagger by 100ms"
```

**Process**:
1. Parse natural language intent (L0→L1)
2. Match to animation patterns (L1→L2)
3. Select appropriate backend (L2→L3)
4. Generate code artifacts (L3→L4)
5. Integrate into current project

**Output**:
- Generated component files (.tsx, .css)
- Integration instructions
- Usage example

### Mode 2: Extract from Existing Site

**Syntax**: `/animate extract "<URL>"`

**Example**:
```
/animate extract "https://gigradar.io/"
```

**Process**:
1. Launch Playwright to analyze site
2. Identify animated elements
3. Extract animation properties (timing, easing, triggers)
4. Reverse-engineer semantic specification (L1)
5. Match to known patterns (L2)
6. Generate equivalent implementation (L3→L4)

**Output**:
- Semantic specification (YAML)
- Matched patterns
- Generated code to replicate animations
- Delta report (behavioral match percentage)

### Mode 3: Match Reference Animation

**Syntax**: `/animate match "<reference_URL>" to "<target_description>"`

**Example**:
```
/animate match "https://gigradar.io/#stats" to "stats section with number counters"
```

**Process**:
1. Extract semantic spec from reference URL
2. Parse target description
3. Generate implementation for target
4. Run convergence loop until Delta ≤ 0.03
5. Verify with Playwright

**Output**:
- Implementation matching reference
- Delta convergence report
- Behavioral verification results

## Thinking Tuple Composition

When you invoke `/animate`, it instantiates this Thinking Tuple:

```markdown
## Constraints
- User intent: [natural language description]
- Domain: web_motion
- Project stack: [detected from package.json]
- Domain pack: .claude/domain_packs/web-motion/

## Invariant
- Artifacts match user intent (semantic correctness)
- Code is syntactically valid
- Implementation follows project conventions
- Performance optimized (60fps, GPU-accelerated)
- Accessibility supported (prefers-reduced-motion)

## Principles
- #2 Progressive Evidence (verify through 4 layers)
- #25 Universal Property Verification (behavioral match)
- Pattern-based reasoning (not micro-implementation)

## Strategy
[
  {skill: "dslp-core", stage: "parse_intent", domain: "web_motion"},
  {skill: "dslp-core", stage: "match_patterns", domain: "web_motion"},
  {skill: "dslp-core", stage: "select_backend", domain: "web_motion"},
  {skill: "domain-web-animation", stage: "generate_code"},
  {skill: "domain-web-animation", stage: "optimize_performance"},
  {skill: "dslp-core", stage: "integrate_artifacts"}
]

## Check
- Layer 1 (Syntax): Code compiles without errors
- Layer 2 (Semantic): Generated animation matches intent
- Layer 3 (Visual): Playwright screenshot comparison
- Layer 4 (Behavioral): Animation timing/easing verified
```

## Examples

### Example 1: Simple Scroll Reveal

**Command**:
```
/animate "fade and slide cards up when they enter viewport"
```

**Pipeline Execution**:

**L0 (Intent)**: "fade and slide cards up when they enter viewport"

**L1 (Semantic Spec)**:
```yaml
scene_type: element_enter
driver: {type: time, duration_ms: 600}
easing: easeOutQuad
trigger: {type: on_enter_viewport, threshold: 0.5}
target_elements:
  - selector: ".card"
    tracks:
      y: {from: 40, to: 0}
      opacity: {from: 0, to: 1}
constraints:
  play_once: true
  prefer_css: true
```

**L2 (Pattern Plan)**:
```yaml
patterns:
  - id: scroll_reveal
    parameters: {slide_distance: 40, duration_ms: 600, threshold: 0.5}
```

**L3 (Implementation Plan)**:
```yaml
backend: react_css
files:
  - Card.tsx (React component with IntersectionObserver)
  - Card.css (CSS keyframes)
```

**L4 (Artifacts)**:

**File: Card.tsx**
```typescript
import { useEffect, useRef, useState } from "react";
import "./Card.css";

export const Card = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`card ${isVisible ? "card--visible" : ""}`}>
      {children}
    </div>
  );
};
```

**File: Card.css**
```css
.card {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
              transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.card--visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none;
    opacity: 1;
    transform: none;
  }
}
```

### Example 2: Extract from GigRadar.io

**Command**:
```
/animate extract "https://gigradar.io/"
```

**Output**:
```
🔍 Analyzing https://gigradar.io/ for animations...

Found 15 animated elements:

1. Hero Section (fade-slide sequence)
   - Semantic Spec: fade_slide_sequence
   - Trigger: on_page_load (delay: 300ms)
   - Pattern: fade_slide_sequence

2. Stats Cards (scroll reveal + stagger)
   - Semantic Spec: element_enter + stagger
   - Trigger: on_enter_viewport (threshold: 0.5)
   - Pattern: scroll_reveal + stagger_animation

3. Timeline Steps (scroll reveal)
   - Semantic Spec: element_enter
   - Trigger: on_enter_viewport (threshold: 0.5)
   - Pattern: scroll_reveal

4. Number Counters (animated counting)
   - Semantic Spec: timed_sequence
   - Trigger: on_enter_viewport (threshold: 0.8)
   - Pattern: number_counter

[... full analysis ...]

Generated files in /tmp/gigradar-animations/:
- HeroSection.tsx
- StatsCards.tsx
- TimelineStep.tsx
- NumberCounter.tsx
- animations.css

Delta Report:
- Layer 1 (Elements): 100% match
- Layer 2 (Appearance): 98% match (minor font rendering diff)
- Layer 3 (Spatial): 100% match
- Layer 4 (Behavior): 96% match (threshold adjusted 0.2→0.5)

Overall Delta: 0.02 (98% behavioral match)
```

### Example 3: Convergence to Delta = 0

**Command**:
```
/animate match "https://gigradar.io/#stats" to "stats section in my app"
```

**Process**:
```
Iteration 1: Generate initial implementation
  → Delta = 0.18 (82% match)
  → Mismatches: threshold (0.2 vs 0.5), duration (400ms vs 600ms)

Iteration 2: Adjust threshold to 0.5
  → Delta = 0.10 (90% match)
  → Mismatches: duration, easing curve

Iteration 3: Adjust duration to 600ms, easing to easeOutQuad
  → Delta = 0.04 (96% match)
  → Mismatches: minor timing offset

Iteration 4: Fine-tune animation-delay
  → Delta = 0.02 (98% match)

✅ Converged to Delta ≤ 0.03
```

## Backend Selection

The `/animate` command automatically selects the best backend based on:

1. **Project Stack Detection**:
   - Checks package.json for React, Vue, etc.
   - Detects installed animation libraries (GSAP, Framer Motion)

2. **Pattern Complexity**:
   - Simple patterns → CSS-only or react_css
   - Complex patterns → GSAP or Framer Motion

3. **User Preferences**:
   - Can override with: `/animate "..." --backend gsap`

**Selection Priority**:
```
If React detected:
  If Framer Motion installed → Use Framer Motion
  Else if pattern simple → Use react_css
  Else → Recommend installing Framer Motion or GSAP

If no framework:
  If pattern simple → Use css_only
  Else if pattern complex → Use GSAP
  Else → Use WAAPI (Web Animations API)
```

## Verification Protocol

After generation, `/animate` verifies artifacts using **Progressive Evidence** (Principle #2):

**Layer 1 (Syntax)**: TypeScript/CSS compilation check
**Layer 2 (Semantic)**: Generated spec matches user intent
**Layer 3 (Visual)**: Playwright screenshot comparison
**Layer 4 (Behavioral)**: Animation timing/easing verification

**Delta Calculation** (if reference provided):
```
Delta = 0.1 × Δ_elements + 0.3 × Δ_appearance + 0.2 × Δ_spatial + 0.4 × Δ_behavior
```

**Acceptance**: Delta ≤ 0.03 (97% match or higher)

## Integration with Existing Components

`/animate` can augment existing components:

**Command**:
```
/animate add "scroll reveal" to "src/components/Card.tsx"
```

**Process**:
1. Read existing Card.tsx
2. Parse component structure
3. Generate animation logic
4. Merge with existing code (preserving functionality)
5. Update CSS/styles

## Performance Optimization

`/animate` automatically applies performance best practices:

- Use GPU-accelerated properties (transform, opacity)
- Add `will-change` hint for complex animations
- Batch DOM reads/writes
- Respect `prefers-reduced-motion`
- Debounce scroll listeners
- Clean up observers on unmount

## Accessibility

All generated animations include:

- `@media (prefers-reduced-motion: reduce)` fallback
- Focus visibility maintained during animations
- No flashing/strobing content
- Skip animation option (optional)

## Related Commands

- `/sameness` - Compare behavioral similarity between sites
- `/squeeze` - Discover hidden animation behaviors through fuzzing
- `/compare-behavior` - Compare specific behavior between implementations

## Notes

- `/animate` is a static wrapper - predictable composition
- For dynamic composition, use Thinking Tuple directly
- Domain knowledge documented in: `.claude/domain_packs/web-motion/`
- Pattern catalog documented in: `docs/patterns/web-motion-patterns.md`
- Implementation expertise in: `.claude/skills/domain-web-animation/`

## Future Enhancements

- Support for other domains (data-viz, 3D motion)
- Multi-site pattern extraction
- Animation performance profiling
- Pattern recommendation based on usage analytics
