# Agent Kernel MCP

Metacognitive protocol server for AI-assisted development. Ships with opinionated Agent Kernel assets (principles, commands, skills, agents, kernel schema, domain packs).

## What It Does

Provides 16 MCP tools organized in two layers:

### Knowledge Retrieval (10 tools)
- `get_principle` / `list_principles` / `search_principles` — Access development principles
- `get_command` / `list_commands` — Access slash command definitions
- `load_skill` — Load skill checklists
- `get_dslp_pattern` / `list_dslp_domains` — Access DSLP domain packs
- `get_agent` — Access agent definitions
- `get_claude_md` — Get full CLAUDE.md protocol

### Protocol Orchestration (6 tools)
- `tuple_init` / `tuple_get` / `tuple_update` — Thinking Tuple state management
- `route_command` — Intent-to-primitive routing
- `evaluate_gradient` — Gradient-based termination for `/run` loops
- `format_prompt` — Cognitive prompt generation for sub-agents

## Install

```bash
# Clone and build
git clone https://github.com/Awannaphasch2016/agent-kernel-mcp.git
cd agent-kernel-mcp
npm install
npm run build
```

## Configure

Add to your `.mcp.json` (Claude Code) or MCP client config:

```json
{
  "mcpServers": {
    "agent-kernel": {
      "command": "node",
      "args": ["/absolute/path/to/agent-kernel-mcp/build/index.js"]
    }
  }
}
```

## Asset Resolution

Tools resolve assets in priority order:
1. **Project-local** `.claude/` directory (your customizations)
2. **Bundled** `assets/` directory (opinionated defaults)

This means you can override any bundled asset by placing your version in `.claude/` within your project.

## License

MIT
