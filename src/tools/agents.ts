import { readFile } from "../utils/file-reader.js";
import { resolveAssetPath } from "../utils/file-reader.js";

export async function getAgent(projectDir: string, agentName: string) {
  // Try core/ subdirectory first, then top-level agents/
  let filePath: string;
  try {
    filePath = await resolveAssetPath(projectDir, `agents/core/${agentName}.md`);
  } catch {
    filePath = await resolveAssetPath(projectDir, `agents/${agentName}.md`);
  }

  const content = await readFile(filePath);
  return {
    content: [{ type: "text", text: content }],
  };
}
