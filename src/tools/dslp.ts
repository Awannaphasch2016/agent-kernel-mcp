import * as path from "path";
import { listDirectories, fileExists } from "../utils/file-reader.js";
import { parseYamlFile } from "../utils/yaml-parser.js";

export async function getDslpPattern(
  claudeDir: string,
  domain: string,
  patternName: string
) {
  const patternsPath = path.join(
    claudeDir,
    ".claude",
    "domain_packs",
    domain,
    "patterns.yaml"
  );

  if (!(await fileExists(patternsPath))) {
    throw new Error(`DSLP domain '${domain}' not found`);
  }

  const patterns = await parseYamlFile(patternsPath);

  if (!patterns[patternName]) {
    throw new Error(`Pattern '${patternName}' not found in domain '${domain}'`);
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(patterns[patternName], null, 2),
      },
    ],
  };
}

export async function listDslpDomains(claudeDir: string) {
  const domainPacksDir = path.join(claudeDir, ".claude", "domain_packs");

  try {
    const domains = await listDirectories(domainPacksDir);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(domains, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify([], null, 2),
        },
      ],
    };
  }
}
