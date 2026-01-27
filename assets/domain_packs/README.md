# DSLP Domain Packs

Domain packs contain **declarative knowledge** for the DSLP (DSL-driven Semantic Layer Protocol) framework.

## Overview

A domain pack defines:
- **L1 Semantic Schema** - Structure for representing domain-specific meaning
- **L2 Pattern Library** - Curated reusable solutions
- **L3 Backend Mappings** - Technology-specific implementations
- **L4 Generators** - Code generation scripts

Domain packs are **domain-specific knowledge repositories** used by the domain-agnostic DSLP Core skill.

## Available Domain Packs

### web-motion (v1.0.0)

**Purpose**: Web animation and motion design patterns

**Contents**:
- `schema.yaml` - Animation semantic structure (scene_type, driver, easing, triggers, tracks)
- `patterns.yaml` - 5 core patterns (scroll_reveal, parallax, stagger, hover_lift, number_counter)
- `backends.yaml` - 5 backends (React+CSS, GSAP, Framer Motion, WAAPI, CSS-only)
- `generators/` - Code generation scripts (Python)

**Usage**: `/animate "<description>"`

**Documentation**: [Web Motion Patterns](../../docs/patterns/web-motion-patterns.md)

**Example Patterns**:
- Scroll reveal (fade + slide on viewport entry)
- Parallax (depth-based scroll effects)
- Stagger animation (sequential reveals)
- Hover lift (interactive feedback)
- Number counter (animated stats)

## Directory Structure

```
.claude/domain_packs/{domain}/
├── schema.yaml         # L1: Semantic specification structure
├── patterns.yaml       # L2: Pattern library (reusable solutions)
├── backends.yaml       # L3: Technology mappings
├── generators/         # L4: Code generation scripts
│   ├── {backend}_{pattern}.py
│   └── ...
└── README.md          # Domain-specific documentation
```

## Creating a New Domain Pack

See [DSLP Architecture Guide](../../docs/dslp-architecture.md#extending-dslp-to-new-domains) for detailed instructions.

**Quick Steps**:

1. **Create directory**:
   ```bash
   mkdir -p .claude/domain_packs/{domain}/generators
   ```

2. **Define semantic schema** (`schema.yaml`):
   - What concepts exist in domain?
   - What properties vary?
   - What constraints apply?

3. **Curate patterns** (`patterns.yaml`):
   - What are common solutions?
   - What parameters make them reusable?
   - What natural language triggers match?

4. **Map backends** (`backends.yaml`):
   - What technologies implement patterns?
   - What are their capabilities/limitations?
   - How do patterns map to backends?

5. **Create generators** (`generators/*.py`):
   - Write code generation scripts
   - Interface: `generate(semantic_spec, pattern, parameters) → code_string`

6. **Create domain skill**: `.claude/skills/domain-{domain}/`

7. **Create slash command**: `.claude/commands/{domain}.md`

8. **Document domain**: `docs/patterns/{domain}-patterns.md`

## Integration

Domain packs integrate with:
- **DSLP Core Skill** (`.claude/skills/dslp-core/`) - Universal L0→L4 pipeline
- **Domain Skills** (`.claude/skills/domain-{domain}/`) - Implementation expertise
- **Slash Commands** (`.claude/commands/`) - Convenience wrappers
- **Thinking Tuple** - Dynamic skill composition

## Future Domain Packs

Planned additions:
- `aws_architecture` - Cloud infrastructure patterns (Kinesis, Lambda, S3, etc.)
- `data_visualization` - Chart/graph patterns (line, bar, scatter, heatmap)
- `api_design` - REST/GraphQL API patterns
- `architecture_space` - Physical space design patterns

## References

- [DSLP Architecture Guide](../../docs/dslp-architecture.md)
- [DSLP Core Skill](../skills/dslp-core/)
- [CLAUDE.md Principle #28](../CLAUDE.md#28-dslp-framework-integration-pattern-based-reasoning)
