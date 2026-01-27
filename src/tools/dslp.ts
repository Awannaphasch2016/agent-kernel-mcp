import * as path from "path";
import { fileExists } from "../utils/file-reader.js";
import { resolveAssetPath, resolveAssetDir } from "../utils/file-reader.js";
import { listDirectories } from "../utils/file-reader.js";
import { parseYamlFile } from "../utils/yaml-parser.js";

export async function getDslpPattern(
  projectDir: string,
  domain: string,
  patternName: string
) {
  const patternsPath = await resolveAssetPath(
    projectDir,
    `domain_packs/${domain}/patterns.yaml`
  );

  const patterns = await parseYamlFile(patternsPath);

  if (!patterns[patternName]) {
    throw new Error(`Pattern '${patternName}' not found in domain '${domain}'`);
  }

  return {
    content: [{ type: "text", text: JSON.stringify(patterns[patternName], null, 2) }],
  };
}

export async function listDslpDomains(projectDir: string) {
  try {
    const domainPacksDir = await resolveAssetDir(projectDir, "domain_packs");
    const domains = await listDirectories(domainPacksDir);
    return {
      content: [{ type: "text", text: JSON.stringify(domains, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify([], null, 2) }],
    };
  }
}
