import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as path from "path";
import { fileURLToPath } from "url";

// Knowledge retrieval tools
import { getPrinciple, listPrinciples, searchPrinciples } from "./tools/principles.js";
import { getCommand, listCommands } from "./tools/commands.js";
import { loadSkill } from "./tools/skills.js";
import { getDslpPattern, listDslpDomains } from "./tools/dslp.js";
import { getAgent } from "./tools/agents.js";
import { getClaudeMd } from "./tools/claude-md.js";

// Protocol orchestration tools
import {
  tupleInit,
  tupleGet,
  tupleUpdate,
  routeCommand,
  evaluateGradient,
  formatPrompt,
} from "./tools/orchestration.js";

import { existsSync } from "fs";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Package root (where resources/ is located)
const PACKAGE_ROOT = path.resolve(__dirname, "..");

// Bundled resources location (shipped with the package)
const BUNDLED_RESOURCES = path.join(PACKAGE_ROOT, "resources");

// Project-specific resources (optional override)
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const PROJECT_RESOURCES = path.join(PROJECT_DIR, ".claude");

/**
 * Resource resolution with fallback:
 * 1. Project-specific: CLAUDE_PROJECT_DIR/.claude/{resource}
 * 2. Bundled: package/resources/{resource}
 *
 * This allows projects to override bundled resources while ensuring
 * the MCP works out-of-box with bundled defaults.
 */
function resolveResourceDir(resourceType: string): string {
  // Check project-specific first
  const projectPath = path.join(PROJECT_RESOURCES, resourceType);
  if (existsSync(projectPath)) {
    return PROJECT_RESOURCES;  // Return .claude dir, not the resource subdir
  }

  // Fall back to bundled resources
  if (existsSync(BUNDLED_RESOURCES)) {
    return BUNDLED_RESOURCES;
  }

  // Legacy fallback: use project dir anyway (will fail gracefully)
  return PROJECT_RESOURCES;
}

// For backward compatibility, CLAUDE_DIR is still used by tool functions
// But now it resolves to bundled resources when project doesn't have them
const CLAUDE_DIR = resolveResourceDir("principles");

const server = new Server(
  {
    name: "agent-kernel-mcp",
    version: "2.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // =====================================================================
      // KNOWLEDGE RETRIEVAL TOOLS (Layer 1 - existing)
      // =====================================================================
      {
        name: "get_principle",
        description: "Get principle content by name from .claude/principles/",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Principle name (e.g., 'defensive-programming')",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "list_principles",
        description: "List all available principles",
        inputSchema: {
          type: "object",
          properties: {
            tier: {
              type: "number",
              description: "Optional: filter by tier (0-3)",
            },
          },
        },
      },
      {
        name: "get_command",
        description: "Get command instructions from .claude/commands/",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Command name (e.g., 'explore', 'run')",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "list_commands",
        description: "List available commands",
        inputSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              description: "Filter: primitive, process, alias, all",
              enum: ["primitive", "process", "alias", "all"],
            },
          },
        },
      },
      {
        name: "load_skill",
        description: "Load skill checklist from .claude/skills/",
        inputSchema: {
          type: "object",
          properties: {
            skill_name: {
              type: "string",
              description: "Skill name (e.g., 'code-review')",
            },
          },
          required: ["skill_name"],
        },
      },
      {
        name: "get_dslp_pattern",
        description: "Get DSLP pattern definition from .claude/domain_packs/",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "Domain name (e.g., 'web_motion')",
            },
            pattern_name: {
              type: "string",
              description: "Pattern name (e.g., 'scroll_reveal')",
            },
          },
          required: ["domain", "pattern_name"],
        },
      },
      {
        name: "list_dslp_domains",
        description: "List available DSLP domains",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_claude_md",
        description: "Get complete CLAUDE.md content (full Agent Kernel protocol)",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_principles",
        description: "Search principles by keyword",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Keyword to search for",
            },
          },
          required: ["keyword"],
        },
      },
      {
        name: "get_agent",
        description: "Get agent definition from .claude/agents/",
        inputSchema: {
          type: "object",
          properties: {
            agent_name: {
              type: "string",
              description: "Agent name (e.g., 'explorer', 'verifier')",
            },
          },
          required: ["agent_name"],
        },
      },

      // =====================================================================
      // PROTOCOL ORCHESTRATION TOOLS (Layer 2 - new)
      // =====================================================================
      {
        name: "tuple_init",
        description:
          "Initialize a Thinking Tuple for a task. Returns a tuple ID for subsequent operations. This is the first step in the /run protocol.",
        inputSchema: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description: "The task to accomplish",
            },
            constraints: {
              type: "array",
              items: { type: "string" },
              description: "Initial constraints (what we know/have)",
            },
            invariant: {
              type: "array",
              items: { type: "string" },
              description: "Success criteria (what must be true at end)",
            },
          },
          required: ["task"],
        },
      },
      {
        name: "tuple_get",
        description:
          "Get the current state of a Thinking Tuple by ID. Returns all slots, iteration count, gradient history, and status.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Tuple ID from tuple_init",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "tuple_update",
        description:
          "Update a slot in the Thinking Tuple. Slots: constraints, invariant, principles, strategy, check. Actions: append, replace, clear.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Tuple ID",
            },
            slot: {
              type: "string",
              description: "Which tuple slot to update",
              enum: ["constraints", "invariant", "principles", "strategy", "check"],
            },
            action: {
              type: "string",
              description: "How to update: append (add items), replace (overwrite), clear (empty)",
              enum: ["append", "replace", "clear"],
            },
            content: {
              oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } },
              ],
              description: "Content to add/replace (string or array of strings)",
            },
          },
          required: ["id", "slot", "action", "content"],
        },
      },
      {
        name: "route_command",
        description:
          "Given a task intent, determine which primitive command to execute next. Uses metadata.yaml routing rules. Optionally considers current tuple state for context-aware routing.",
        inputSchema: {
          type: "object",
          properties: {
            intent: {
              type: "string",
              description:
                "What the model wants to do next (e.g., 'explore authentication options', 'verify the tests pass')",
            },
            tuple_id: {
              type: "string",
              description: "Optional: Tuple ID for context-aware routing",
            },
          },
          required: ["intent"],
        },
      },
      {
        name: "evaluate_gradient",
        description:
          "Evaluate the gradient (learning progress) after a /step iteration. Returns recommendation to CONTINUE or TERMINATE. The model reports which gradient components changed.",
        inputSchema: {
          type: "object",
          properties: {
            tuple_id: {
              type: "string",
              description: "Tuple ID",
            },
            knowledge: {
              type: "boolean",
              description: "Did we discover new knowledge? (entities, relations, insights)",
            },
            invariant: {
              type: "boolean",
              description: "Did we refine the invariant? (more precise or testable)",
            },
            evidence: {
              type: "boolean",
              description: "Did we strengthen evidence? (moved up evidence layers)",
            },
            confidence: {
              type: "boolean",
              description: "Did our certainty change? (hypotheses confirmed/refuted)",
            },
            action: {
              type: "string",
              description: "What action was taken this iteration (e.g., 'explore', 'implement', 'validate')",
            },
            notes: {
              type: "string",
              description: "Optional notes about what happened",
            },
          },
          required: ["tuple_id", "knowledge", "invariant", "evidence", "confidence"],
        },
      },
      {
        name: "format_prompt",
        description:
          "Generate a cognitive prompt for an agent, injecting principles, tuple context, and skills. Use this to create prompts for spawned sub-agents.",
        inputSchema: {
          type: "object",
          properties: {
            agent_type: {
              type: "string",
              description:
                "Agent type: coder, researcher, reviewer, tester, planner (or any agent in registry)",
            },
            task: {
              type: "string",
              description: "The task for the agent to perform",
            },
            tuple_id: {
              type: "string",
              description: "Optional: Tuple ID to inject tuple context into prompt",
            },
            additional_principles: {
              type: "array",
              items: { type: "string" },
              description: "Extra principles to load beyond agent defaults",
            },
          },
          required: ["agent_type", "task"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [
        {
          type: "text",
          text: "Error: Missing arguments for tool call",
        },
      ],
      isError: true,
    };
  }

  try {
    switch (name) {
      // Knowledge retrieval tools
      case "get_principle":
        return await getPrinciple(CLAUDE_DIR, args.name as string);
      case "list_principles":
        return await listPrinciples(CLAUDE_DIR, args.tier as number | undefined);
      case "get_command":
        return await getCommand(CLAUDE_DIR, args.name as string);
      case "list_commands":
        return await listCommands(CLAUDE_DIR, args.category as string | undefined);
      case "load_skill":
        return await loadSkill(CLAUDE_DIR, args.skill_name as string);
      case "get_dslp_pattern":
        return await getDslpPattern(
          CLAUDE_DIR,
          args.domain as string,
          args.pattern_name as string
        );
      case "list_dslp_domains":
        return await listDslpDomains(CLAUDE_DIR);
      case "get_claude_md":
        return await getClaudeMd(CLAUDE_DIR);
      case "search_principles":
        return await searchPrinciples(CLAUDE_DIR, args.keyword as string);
      case "get_agent":
        return await getAgent(CLAUDE_DIR, args.agent_name as string);

      // Protocol orchestration tools
      case "tuple_init":
        return await tupleInit(
          CLAUDE_DIR,
          args.task as string,
          args.constraints as string[] | undefined,
          args.invariant as string[] | undefined
        );
      case "tuple_get":
        return await tupleGet(CLAUDE_DIR, args.id as string);
      case "tuple_update":
        return await tupleUpdate(
          CLAUDE_DIR,
          args.id as string,
          args.slot as string,
          args.action as "append" | "replace" | "clear",
          args.content as string | string[]
        );
      case "route_command":
        return await routeCommand(
          CLAUDE_DIR,
          args.intent as string,
          args.tuple_id as string | undefined
        );
      case "evaluate_gradient":
        return await evaluateGradient(
          CLAUDE_DIR,
          args.tuple_id as string,
          args.knowledge as boolean,
          args.invariant as boolean,
          args.evidence as boolean,
          args.confidence as boolean,
          args.action as string | undefined,
          args.notes as string | undefined
        );
      case "format_prompt":
        return await formatPrompt(
          CLAUDE_DIR,
          args.agent_type as string,
          args.task as string,
          args.tuple_id as string | undefined,
          args.additional_principles as string[] | undefined
        );
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log startup info
  const usingBundled = existsSync(BUNDLED_RESOURCES);
  const hasProjectOverrides = existsSync(PROJECT_RESOURCES);

  console.error("Agent Kernel MCP server v2.1.0 running on stdio");
  console.error("  Knowledge tools: 10 | Orchestration tools: 6 | Total: 16");
  console.error(`  Resources: ${usingBundled ? "bundled" : "project"} (project overrides: ${hasProjectOverrides ? "yes" : "no"})`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
