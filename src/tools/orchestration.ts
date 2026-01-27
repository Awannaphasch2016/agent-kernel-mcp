/**
 * Orchestration Tools - Protocol-level operations for the Agent Kernel
 *
 * These tools move the MCP server from knowledge retrieval to protocol orchestration.
 * Any reasoning model can use these to execute the Thinking Tuple protocol
 * without implementing the logic itself.
 */

import * as path from "path";
import * as fs from "fs/promises";
import { readFile, fileExists, listFiles } from "../utils/file-reader.js";
import { resolveAssetPath, resolveAssetDir } from "../utils/file-reader.js";
import { parseYamlFile } from "../utils/yaml-parser.js";

// =============================================================================
// TYPES
// =============================================================================

interface TupleState {
  id: string;
  task: string;
  constraints: string[];
  invariant: string[];
  principles: string[];
  strategy: string[];
  check: string[];
  iteration: number;
  status: "running" | "converged" | "stuck" | "success" | "limit_reached";
  gradient_history: GradientEntry[];
  created_at: string;
  updated_at: string;
}

interface GradientEntry {
  iteration: number;
  knowledge: boolean;
  invariant: boolean;
  evidence: boolean;
  confidence: boolean;
  overall: "significant" | "insignificant";
  action?: string;
  notes?: string;
}

interface RouteResult {
  primitive: string;
  slot: string;
  mode: string;
  description: string;
  local_check: string;
  execution_hints: Record<string, any>;
  rationale: string;
}

// In-memory tuple store (persisted to disk on save)
const tupleStore: Map<string, TupleState> = new Map();

// =============================================================================
// TUPLE STATE MANAGEMENT
// =============================================================================

export async function tupleInit(
  claudeDir: string,
  task: string,
  constraints?: string[],
  invariant?: string[]
) {
  const id = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const tuple: TupleState = {
    id,
    task,
    constraints: constraints || [],
    invariant: invariant || [],
    principles: [],
    strategy: [],
    check: [],
    iteration: 0,
    status: "running",
    gradient_history: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  tupleStore.set(id, tuple);

  // Persist to disk (project-local)
  await saveTuple(claudeDir, tuple);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            id: tuple.id,
            task: tuple.task,
            status: tuple.status,
            iteration: tuple.iteration,
            message: "Thinking Tuple initialized. Use tuple_update to modify slots, route_command to decide next action, evaluate_gradient after each step.",
          },
          null,
          2
        ),
      },
    ],
  };
}

export async function tupleGet(claudeDir: string, id: string) {
  let tuple = tupleStore.get(id);

  if (!tuple) {
    // Try loading from disk
    tuple = await loadTuple(claudeDir, id);
    if (tuple) {
      tupleStore.set(id, tuple);
    }
  }

  if (!tuple) {
    throw new Error(`Tuple '${id}' not found. Use tuple_init to create one.`);
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(tuple, null, 2),
      },
    ],
  };
}

export async function tupleUpdate(
  claudeDir: string,
  id: string,
  slot: string,
  action: "append" | "replace" | "clear",
  content: string | string[]
) {
  let tuple = tupleStore.get(id);
  if (!tuple) {
    tuple = await loadTuple(claudeDir, id);
    if (tuple) tupleStore.set(id, tuple);
  }
  if (!tuple) {
    throw new Error(`Tuple '${id}' not found.`);
  }

  const validSlots = ["constraints", "invariant", "principles", "strategy", "check"];
  if (!validSlots.includes(slot)) {
    throw new Error(`Invalid slot '${slot}'. Must be one of: ${validSlots.join(", ")}`);
  }

  const items = Array.isArray(content) ? content : [content];
  const slotKey = slot as keyof Pick<TupleState, "constraints" | "invariant" | "principles" | "strategy" | "check">;

  switch (action) {
    case "append":
      tuple[slotKey] = [...tuple[slotKey], ...items];
      break;
    case "replace":
      tuple[slotKey] = items;
      break;
    case "clear":
      tuple[slotKey] = [];
      break;
  }

  tuple.updated_at = new Date().toISOString();
  await saveTuple(claudeDir, tuple);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            id: tuple.id,
            slot,
            action,
            current_value: tuple[slotKey],
            iteration: tuple.iteration,
          },
          null,
          2
        ),
      },
    ],
  };
}

// =============================================================================
// COMMAND ROUTING
// =============================================================================

export async function routeCommand(claudeDir: string, intent: string, tupleId?: string) {
  // Load command metadata (with embedded fallback for fresh projects)
  let metadataPath: string;
  let primitives: Record<string, any> = {};

  try {
    metadataPath = await resolveAssetPath(claudeDir, "commands/metadata.yaml");
    const metadata = await parseYamlFile(metadataPath);
    primitives = metadata.primitives || {};
  } catch {
    // Embedded fallback primitive definitions for fresh projects (no .claude/ directory)
    primitives = {
      explore: { slot: "Constraints", mode: "divergent_exploration", description: "Systematically explore solution space", local_check: "New options or insights discovered", execution_hints: { parallelizable: true, max_agents: 5, model_preference: "haiku" } },
      understand: { slot: "Invariant", mode: "mental_model_building", description: "Build understanding of concepts", local_check: "Mental model articulated clearly", execution_hints: { parallelizable: false } },
      decompose: { slot: "Invariant", mode: "structural_breakdown", description: "Break problem into sub-components", local_check: "Components identified with dependencies", execution_hints: { parallelizable: false } },
      "what-if": { slot: "Strategy", mode: "comparative_analysis", description: "Compare alternatives and tradeoffs", local_check: "Alternatives ranked with rationale", execution_hints: { parallelizable: true, max_agents: 3 } },
      validate: { slot: "Check", mode: "verification", description: "Verify claims with evidence", local_check: "Evidence level documented (Layer 1-4)", execution_hints: { parallelizable: true, max_agents: 3 } },
      observe: { slot: "Constraints", mode: "observation", description: "Capture observations without interpretation", local_check: "Observations recorded factually", execution_hints: { parallelizable: false } },
      trace: { slot: "Constraints", mode: "causal_analysis", description: "Follow causal chains forward or backward", local_check: "Causal chain documented", execution_hints: { parallelizable: false } },
      hypothesis: { slot: "Constraints", mode: "hypothesis_generation", description: "Generate testable explanations", local_check: "Hypotheses are testable and falsifiable", execution_hints: { parallelizable: true, max_agents: 3 } },
      consolidate: { slot: "Constraints", mode: "knowledge_synthesis", description: "Synthesize scattered knowledge", local_check: "Knowledge organized and accessible", execution_hints: { parallelizable: false } },
      specify: { slot: "Invariant", mode: "formal_specification", description: "Create formal specification", local_check: "Spec is precise and testable", execution_hints: { parallelizable: false } },
      design: { slot: "Strategy", mode: "solution_design", description: "Design a solution approach", local_check: "Design addresses constraints and invariant", execution_hints: { parallelizable: false } },
      invariant: { slot: "Check", mode: "invariant_identification", description: "Identify behavioral invariants", local_check: "Invariants are verifiable", execution_hints: { parallelizable: false } },
      reconcile: { slot: "Check", mode: "convergence", description: "Converge violations back to compliance", local_check: "Delta reduced toward zero", execution_hints: { parallelizable: false } },
      reflect: { slot: "Check", mode: "metacognitive_analysis", description: "Analyze reasoning progress", local_check: "Stuck patterns identified or progress confirmed", execution_hints: { parallelizable: false } },
      implement: { slot: "Constraints", mode: "artifact_creation", description: "Write code or create artifacts", local_check: "Artifacts created and functional", execution_hints: { parallelizable: false } },
    };
  }

  // Intent-to-primitive routing rules
  // These encode the Tuple Router from Principle #26
  const routingRules: Array<{
    patterns: RegExp[];
    primitive: string;
    rationale: string;
  }> = [
    {
      patterns: [/explor|search|find|discover|option|alternative/i],
      primitive: "explore",
      rationale: "Task requires divergent exploration of solution space",
    },
    {
      patterns: [/understand|explain|how|what is|mental model|learn/i],
      primitive: "understand",
      rationale: "Task requires building understanding before acting",
    },
    {
      patterns: [/decompos|break down|split|component|subtask/i],
      primitive: "decompose",
      rationale: "Task requires breaking into smaller parts",
    },
    {
      patterns: [/compar|tradeoff|vs|versus|which|what.if|evaluat/i],
      primitive: "what-if",
      rationale: "Task requires comparing alternatives",
    },
    {
      patterns: [/validat|verify|check|test|correct|prove/i],
      primitive: "validate",
      rationale: "Task requires verification of claims",
    },
    {
      patterns: [/observ|record|capture|log|what happened/i],
      primitive: "observe",
      rationale: "Task requires capturing observations without interpretation",
    },
    {
      patterns: [/trac|why|cause|because|root cause|debug/i],
      primitive: "trace",
      rationale: "Task requires following causal chains",
    },
    {
      patterns: [/hypothes|theory|might be|could be|suspect/i],
      primitive: "hypothesis",
      rationale: "Task requires generating testable explanations",
    },
    {
      patterns: [/consolidat|synthesiz|summariz|gather/i],
      primitive: "consolidate",
      rationale: "Task requires synthesizing scattered knowledge",
    },
    {
      patterns: [/specif|define|contract|requirement|formal/i],
      primitive: "specify",
      rationale: "Task requires creating formal specification",
    },
    {
      patterns: [/design|architect|plan|structur/i],
      primitive: "design",
      rationale: "Task requires designing a solution approach",
    },
    {
      patterns: [/invariant|must be true|constraint|rule/i],
      primitive: "invariant",
      rationale: "Task requires identifying behavioral invariants",
    },
    {
      patterns: [/reconcil|fix|converge|align|drift/i],
      primitive: "reconcile",
      rationale: "Task requires converging violations back to compliance",
    },
    {
      patterns: [/reflect|meta|stuck|pattern|approach/i],
      primitive: "reflect",
      rationale: "Task requires metacognitive analysis of progress",
    },
    {
      patterns: [/implement|build|create|write|code|add/i],
      primitive: "implement",
      rationale: "Task requires writing code or creating artifacts",
    },
  ];

  // Find best matching primitive
  let bestMatch: { primitive: string; rationale: string } | null = null;

  for (const rule of routingRules) {
    for (const pattern of rule.patterns) {
      if (pattern.test(intent)) {
        bestMatch = { primitive: rule.primitive, rationale: rule.rationale };
        break;
      }
    }
    if (bestMatch) break;
  }

  // Default to explore if no match
  if (!bestMatch) {
    bestMatch = {
      primitive: "explore",
      rationale: "No specific intent detected; defaulting to exploration",
    };
  }

  // Get primitive metadata
  const primitiveDef = primitives[bestMatch.primitive] || {};

  // Also check tuple state for context-aware routing
  let contextNote = "";
  if (tupleId) {
    const tuple = tupleStore.get(tupleId);
    if (tuple) {
      if (tuple.check.length > 0 && tuple.check.some((c) => c.includes("PASS"))) {
        contextNote = "Tuple check has PASS entries - consider if invariant is satisfied.";
      }
      if (tuple.constraints.length === 0) {
        contextNote = "Tuple constraints empty - exploration recommended first.";
      }
      if (tuple.invariant.length === 0 && bestMatch.primitive !== "understand") {
        contextNote =
          "No invariant defined yet - consider using 'understand' or 'decompose' first.";
      }
    }
  }

  const result: RouteResult = {
    primitive: bestMatch.primitive,
    slot: primitiveDef.slot || "Constraints",
    mode: primitiveDef.mode || "unknown",
    description: primitiveDef.description || "",
    local_check: primitiveDef.local_check || "",
    execution_hints: primitiveDef.execution_hints || {},
    rationale: bestMatch.rationale + (contextNote ? ` Note: ${contextNote}` : ""),
  };

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}

// =============================================================================
// GRADIENT EVALUATION
// =============================================================================

export async function evaluateGradient(
  claudeDir: string,
  tupleId: string,
  knowledge: boolean,
  invariant: boolean,
  evidence: boolean,
  confidence: boolean,
  action?: string,
  notes?: string
) {
  let tuple = tupleStore.get(tupleId);
  if (!tuple) {
    tuple = await loadTuple(claudeDir, tupleId);
    if (tuple) tupleStore.set(tupleId, tuple);
  }
  if (!tuple) {
    throw new Error(`Tuple '${tupleId}' not found.`);
  }

  const overall =
    knowledge || invariant || evidence || confidence ? "significant" : "insignificant";

  const entry: GradientEntry = {
    iteration: tuple.iteration,
    knowledge,
    invariant,
    evidence,
    confidence,
    overall,
    action,
    notes,
  };

  tuple.gradient_history.push(entry);
  tuple.iteration++;

  // Check termination conditions
  let recommendation: string;
  let newStatus = tuple.status;

  if (overall === "insignificant") {
    // Check for zero gradient (2+ consecutive insignificant)
    const history = tuple.gradient_history;
    const lastTwo = history.slice(-2);
    if (
      lastTwo.length >= 2 &&
      lastTwo.every((g) => g.overall === "insignificant")
    ) {
      recommendation = "TERMINATE - Zero gradient detected (2+ consecutive insignificant). Converged or stuck.";
      newStatus = "stuck";
    } else {
      recommendation = "TERMINATE - Gradient insignificant. Task appears converged.";
      newStatus = "converged";
    }
  } else {
    recommendation = `CONTINUE - Gradient significant (${[
      knowledge && "knowledge",
      invariant && "invariant",
      evidence && "evidence",
      confidence && "confidence",
    ]
      .filter(Boolean)
      .join(", ")}). More progress possible.`;
    newStatus = "running";
  }

  // Check if invariant is satisfied (check slot has PASS entries)
  if (
    tuple.check.length > 0 &&
    tuple.check.some((c) => c.toUpperCase().includes("PASS"))
  ) {
    recommendation = "TERMINATE - Invariant satisfied (check slot contains PASS).";
    newStatus = "success";
  }

  // Safety limit
  if (tuple.iteration >= 20) {
    recommendation = "TERMINATE - Max iterations (20) reached. Safety limit.";
    newStatus = "limit_reached";
  }

  tuple.status = newStatus;
  tuple.updated_at = new Date().toISOString();
  await saveTuple(claudeDir, tuple);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            iteration: tuple.iteration,
            gradient: entry,
            recommendation,
            status: tuple.status,
            total_iterations: tuple.iteration,
            significant_count: tuple.gradient_history.filter(
              (g) => g.overall === "significant"
            ).length,
          },
          null,
          2
        ),
      },
    ],
  };
}

// =============================================================================
// COGNITIVE PROMPT FORMATTING
// =============================================================================

export async function formatPrompt(
  claudeDir: string,
  agentType: string,
  task: string,
  tupleId?: string,
  additionalPrinciples?: string[]
) {
  // Load agent profile from registry
  let registryPath: string;
  let agentProfile: any = null;

  try {
    registryPath = await resolveAssetPath(claudeDir, "agents/registry.yaml");
    const registry = await parseYamlFile(registryPath);
    agentProfile = registry.agents?.[agentType];
  } catch {}

  // Try loading agent definition file directly
  if (!agentProfile) {
    try {
      const agentPath = await resolveAssetPath(claudeDir, `agents/core/${agentType}.md`);
      const content = await readFile(agentPath);
      agentProfile = {
        description: content.split("\n").find((l: string) => l.startsWith("# "))?.replace("# ", "") || agentType,
        principles: [],
        skills: [],
      };
    } catch {}
  }

  if (!agentProfile) {
    // Fallback profiles for common agent types
    const defaults: Record<string, any> = {
      coder: {
        description: "Implementation specialist for writing clean, efficient code",
        principles: ["defensive-programming", "error-handling-duality"],
        skills: ["code-review"],
        focus: ["code generation", "refactoring", "optimization"],
      },
      researcher: {
        description: "Deep research and information gathering specialist",
        principles: ["progressive-evidence", "execution-boundary"],
        skills: ["research"],
        focus: ["code analysis", "pattern recognition", "documentation"],
      },
      reviewer: {
        description: "Code review and quality assurance specialist",
        principles: ["defensive-programming", "testing-anti-patterns"],
        skills: ["code-review"],
        focus: ["code review", "quality assurance", "best practices"],
      },
      tester: {
        description: "Comprehensive testing and quality assurance specialist",
        principles: ["testing-anti-patterns", "cross-boundary-testing"],
        skills: ["testing-workflow"],
        focus: ["test writing", "edge cases", "coverage analysis"],
      },
      planner: {
        description: "Strategic planning and task orchestration agent",
        principles: ["thinking-tuple"],
        skills: [],
        focus: ["task decomposition", "strategy planning", "coordination"],
      },
    };

    agentProfile = defaults[agentType];
    if (!agentProfile) {
      throw new Error(
        `Unknown agent type: '${agentType}'. Available in registry or defaults: coder, researcher, reviewer, tester, planner`
      );
    }
  }

  // Load principles content (gracefully handle missing directory for fresh projects)
  const principleNames = [
    ...(agentProfile.principles || []),
    ...(additionalPrinciples || []),
  ];
  let principlesContent = "";
  if (principleNames.length > 0) {
    try {
      const principlesDir = await resolveAssetDir(claudeDir, "principles");
      const files = await listFiles(principlesDir, ".md");
      for (const name of principleNames) {
        for (const file of files) {
          const filePath = path.join(principlesDir, file);
          const content = await readFile(filePath);
          if (content.toLowerCase().includes(name.toLowerCase())) {
            principlesContent += `\n### ${name}\n${content.slice(0, 500)}...\n`;
            break;
          }
        }
      }
    } catch {
      // Fresh project - no principles directory. Use embedded summaries.
      const embeddedPrinciples: Record<string, string> = {
        "defensive-programming": "Fail fast and visibly. Silent failures hide bugs. Validate at startup, not on first use.",
        "error-handling-duality": "Distinguish between operational errors (retry) and programmer errors (crash). Handle each appropriately.",
        "progressive-evidence": "Execution completion ≠ success. Verify through layers: status codes → payloads → logs → ground truth.",
        "execution-boundary": "Reading code ≠ verifying it works. Test at execution boundaries.",
        "testing-anti-patterns": "Avoid: testing implementation details, over-mocking, testing trivial code, brittle assertions.",
        "cross-boundary-testing": "Test across service boundaries with contract tests and integration tests.",
        "thinking-tuple": "Structure reasoning as (Constraints, Invariant, Principles, Strategy, Check).",
      };
      for (const name of principleNames) {
        const summary = embeddedPrinciples[name];
        if (summary) {
          principlesContent += `\n### ${name}\n${summary}\n`;
        }
      }
    }
  }

  // Load tuple context if provided
  let tupleContext = "";
  if (tupleId) {
    const tuple = tupleStore.get(tupleId);
    if (tuple) {
      tupleContext = `## Thinking Tuple Context

**Constraints** (what we know):
${tuple.constraints.length > 0 ? tuple.constraints.map((c) => `- ${c}`).join("\n") : "(none yet)"}

**Invariant** (what must be true at end):
${tuple.invariant.length > 0 ? tuple.invariant.map((i) => `- ${i}`).join("\n") : "(not defined yet)"}

**Check** (verification status):
${tuple.check.length > 0 ? tuple.check.map((c) => `- ${c}`).join("\n") : "(no checks yet)"}

**Iteration**: ${tuple.iteration} | **Status**: ${tuple.status}
`;
    }
  }

  // Build the formatted prompt
  const prompt = `## Cognitive Profile: ${agentType}

**Role**: ${agentProfile.description}
${agentProfile.focus ? `**Focus**: ${(agentProfile.focus || agentProfile.capabilities || []).join(", ")}` : ""}

${principlesContent ? `## Active Principles\n\nThese principles guide your reasoning:\n${principlesContent}` : ""}

${tupleContext}

## Output Format

Structure your response for Thinking Tuple integration:

\`\`\`yaml
findings:
  summary: "Brief summary of what you accomplished"
  details: []

tuple_updates:
  constraints_discovered: []
  invariant_progress: ""
  evidence_layer: 1-4

handoff:
  next_agent: ""
  context: ""
\`\`\`

## Task

${task}`;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            prompt,
            agent_type: agentType,
            principles_loaded: principleNames,
            tuple_id: tupleId || null,
            estimated_tokens: Math.ceil(prompt.length / 4),
          },
          null,
          2
        ),
      },
    ],
  };
}

// =============================================================================
// PERSISTENCE HELPERS
// =============================================================================

async function saveTuple(claudeDir: string, tuple: TupleState): Promise<void> {
  const runsDir = path.join(claudeDir, ".claude", "state", "runs");
  try {
    await fs.mkdir(runsDir, { recursive: true });
    const filePath = path.join(runsDir, `${tuple.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(tuple, null, 2), "utf-8");
  } catch {
    // Silently fail on persistence - in-memory is primary
  }
}

async function loadTuple(
  claudeDir: string,
  id: string
): Promise<TupleState | undefined> {
  const filePath = path.join(claudeDir, ".claude", "state", "runs", `${id}.json`);
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as TupleState;
  } catch {
    return undefined;
  }
}
