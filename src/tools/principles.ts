import * as path from "path";
import { readFile, listFiles } from "../utils/file-reader.js";
import { resolveAssetDir } from "../utils/file-reader.js";

export async function getPrinciple(projectDir: string, name: string) {
  const principlesDir = await resolveAssetDir(projectDir, "principles");
  const files = await listFiles(principlesDir, ".md");

  for (const file of files) {
    const filePath = path.join(principlesDir, file);
    const content = await readFile(filePath);

    if (content.toLowerCase().includes(name.toLowerCase())) {
      return {
        content: [{ type: "text", text: content }],
      };
    }
  }

  throw new Error(`Principle '${name}' not found`);
}

export async function listPrinciples(projectDir: string, tier?: number) {
  const principlesDir = await resolveAssetDir(projectDir, "principles");
  const files = await listFiles(principlesDir, ".md");

  if (tier !== undefined) {
    if (tier === 0) {
      const tier0Principles = [
        "defensive-programming",
        "progressive-evidence",
        "logging-discipline",
        "execution-boundary",
        "configuration-variation",
        "universal-property-verification",
        "thinking-tuple-protocol",
        "commands-as-strategy-modes",
        "dslp-framework-integration",
        "unified-ontological-framework",
        "semantic-inheritance",
        "execution-modes",
      ];
      return {
        content: [{ type: "text", text: JSON.stringify(tier0Principles, null, 2) }],
      };
    } else {
      const principles = files.map((file) => file.replace(".md", ""));
      return {
        content: [{ type: "text", text: JSON.stringify(principles, null, 2) }],
      };
    }
  }

  const principles = files.map((file) => file.replace(".md", ""));
  return {
    content: [{ type: "text", text: JSON.stringify(principles, null, 2) }],
  };
}

export async function searchPrinciples(projectDir: string, keyword: string) {
  const principlesDir = await resolveAssetDir(projectDir, "principles");
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
    content: [{ type: "text", text: JSON.stringify(matches, null, 2) }],
  };
}
