# Principle Routing Index

**Purpose**: Quick lookup to find which principle cluster to load based on current task.

**Project**: ss-automation (Meta Ads → Google Sheets Automation)

---

## Routing Table

| If you're doing... | Load this cluster | Principles | Applicable |
|--------------------|-------------------|------------|------------|
| **Deploying** to any environment | [deployment-principles.md](deployment-principles.md) | #6, #11, #15, #19, #21 | Future |
| **Writing tests** or fixing test failures | [testing-principles.md](testing-principles.md) | #10, #19 | Yes |
| **Timezone**, data processing | [data-principles.md](data-principles.md) | #16 | Yes |
| **Secrets**, env vars, credentials | [configuration-principles.md](configuration-principles.md) | #13, #24 | Yes |
| **API integration** (Meta, Sheets) | [integration-principles.md](integration-principles.md) | #4, #7, #8 | Yes |
| **Debugging loops**, concept analysis, **semantic clarification** | [meta-principles.md](meta-principles.md) | #9, #12, #28 | Yes |
| **External services** (Vercel, GitHub) | [service-integration-principles.md](service-integration-principles.md) | Hub-spoke | Yes |
| **n8n workflows** (build, debug, deploy) | [n8n-workflow-principles.md](n8n-workflow-principles.md) | #N1-N8 | Yes |
| **MCP integration** (adoption, config) | [mcp-adoption-principles.md](mcp-adoption-principles.md) | #34 | Yes |

**Not applicable to ss-automation**:
- Database principles (#3, #5, #14) - no database
- LLM observability (#22) - no LLM
- Shared venv (#17) - standalone project

---

## Keyword Triggers

### Configuration Cluster (Most Used)
**Keywords**: secret, env var, credential, Meta API, Google Sheets, service account, token

**Load**: `configuration-principles.md`

### Integration Cluster (Most Used)
**Keywords**: API, type, JSON, serialize, error, exception, Meta Ads, gspread

**Load**: `integration-principles.md`

### Testing Cluster
**Keywords**: test, pytest, mock, fixture, assertion

**Load**: `testing-principles.md`

### Data Cluster
**Keywords**: timezone, date, datetime, format

**Load**: `data-principles.md`

### Meta Cluster
**Keywords**: debug, stuck, loop, retry, feedback, analysis, sameness, completeness, universal, scope, clarify

**Load**: `meta-principles.md`

### n8n Workflow Cluster
**Keywords**: n8n, workflow, webhook, node, automation, pipeline, trigger, execution, merge, sub-workflow, executeWorkflow, typeVersion, expression, Code node

**Load**: `n8n-workflow-principles.md`

### Occam's Razor / MCP Cluster
**Keywords**: MCP, mcp.json, hook, adoption, minimal, escalation, occam, configuration, tool recognition

**Load**: `mcp-adoption-principles.md` (Principle #34) + [MCP Integration Skill](../skills/mcp-integration/SKILL.md)

### Deployment Cluster (Future)
**Keywords**: deploy, CI/CD, release, Lambda, GitHub Actions

**Load**: `deployment-principles.md`

---

## Multi-Cluster Scenarios (ss-automation specific)

| Task | Clusters Needed |
|------|-----------------|
| Set up Meta API credentials | configuration + integration |
| Set up Google Sheets access | configuration + integration |
| Debug API integration issues | integration + meta |
| Add date range filtering | data + integration |
| Write tests for parser | testing + integration |
| Build n8n workflow chain | n8n-workflow + integration |
| Debug n8n webhook errors | n8n-workflow + meta |
| Debug n8n sub-workflow output | n8n-workflow (N6, N7, N8) |
| Deploy n8n to cloud | n8n-workflow (N3) + configuration |

---

## Core Principles (Always Loaded)

See [core-principles.md](core-principles.md) for the complete Tier-0 principles.

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

---

## Quick Reference

```bash
# Core Agent Kernel principles (Tier-0)?
Read: .claude/principles/core-principles.md

# Setting up credentials?
Read: .claude/principles/configuration-principles.md

# Integrating APIs?
Read: .claude/principles/integration-principles.md

# Writing tests?
Read: .claude/principles/testing-principles.md

# Date/timezone issues?
Read: .claude/principles/data-principles.md

# Stuck/debugging?
Read: .claude/principles/meta-principles.md

# Deploying? (future)
Read: .claude/principles/deployment-principles.md

# External services (Vercel, GitHub, etc.)?
Read: .claude/principles/service-integration-principles.md
```

---

## See Also

- **Agent Kernel**: [.claude/AGENT-KERNEL.md](../AGENT-KERNEL.md) - Complete system architecture
- **Skills Index**: [.claude/skills/README.md](../skills/README.md) - Domain expertise modules
- **Commands Index**: [.claude/commands/README.md](../commands/README.md) - Slash commands
