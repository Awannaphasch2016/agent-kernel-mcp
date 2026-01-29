import * as path from "path";
import { readFile, fileExists } from "../utils/file-reader.js";

export async function getAgent(claudeDir: string, agentName: string) {
  const agentPath = path.join(claudeDir, ".claude", "agents", `${agentName}.md`);

  if (!(await fileExists(agentPath))) {
    throw new Error(`Agent '${agentName}' not found`);
  }

  const content = await readFile(agentPath);

  return {
    content: [
      {
        type: "text",
        text: content,
      },
    ],
  };
}
