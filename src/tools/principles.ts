import * as path from "path";
import { readFile, listFiles } from "../utils/file-reader.js";

export async function getPrinciple(claudeDir: string, name: string) {
  // Try to find principle in principles directory
  const principlesDir = path.join(claudeDir, ".claude", "principles");
  const files = await listFiles(principlesDir, ".md");

  // Search for principle in files
  for (const file of files) {
    const filePath = path.join(principlesDir, file);
    const content = await readFile(filePath);

    // Check if this file contains the principle (simple search for now)
    if (content.toLowerCase().includes(name.toLowerCase())) {
      return {
        content: [
          {
            type: "text",
            text: content,
          },
        ],
      };
    }
  }

  throw new Error(`Principle '${name}' not found`);
}

export async function listPrinciples(claudeDir: string, tier?: number) {
  const principlesDir = path.join(claudeDir, ".claude", "principles");
  const files = await listFiles(principlesDir, ".md");

  // Tier filtering logic
  if (tier !== undefined) {
    if (tier === 0) {
      // Tier-0 principles are documented in CLAUDE.md and index.md
      // Based on .claude/principles/index.md "Core Principles (Always Loaded)"
      const tier0Principles = [
        "defensive-programming",        // #1
        "progressive-evidence",         // #2
        "logging-discipline",           // #18
        "execution-boundary",           // #20
        "configuration-variation",      // #23
        "universal-property-verification", // #25
        "thinking-tuple-protocol",      // #26
        "commands-as-strategy-modes",   // #27
        "dslp-framework-integration",   // #28
        "unified-ontological-framework", // #29
        "semantic-inheritance",         // #30
        "execution-modes",              // #31
      ];
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tier0Principles, null, 2),
          },
        ],
      };
    } else {
      // For tier 1/2/3: principle files in .claude/principles/ contain mixed tiers
      // Return cluster files that contain principles of those tiers
      // Note: Individual principle files don't have tier metadata, so we return all clusters
      // This is a known limitation - see TEST_RESULTS.md
      const principles = files.map((file) => file.replace(".md", ""));
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(principles, null, 2),
          },
        ],
      };
    }
  }

  // Return all principles if no tier specified
  const principles = files.map((file) => file.replace(".md", ""));

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(principles, null, 2),
      },
    ],
  };
}

export async function searchPrinciples(claudeDir: string, keyword: string) {
  const principlesDir = path.join(claudeDir, ".claude", "principles");
  const files = await listFiles(principlesDir, ".md");

  const matches: string[] = [];

  for (const file of files) {
    const filePath = path.join(principlesDir, file);
    const content = await readFile(filePath);

    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      matches.push(file.replace(".md", ""));
    }
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(matches, null, 2),
      },
    ],
  };
}
