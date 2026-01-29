import * as path from "path";
import { readFile, fileExists } from "../utils/file-reader.js";

export async function getClaudeMd(claudeDir: string) {
  const claudeMdPath = path.join(claudeDir, ".claude", "CLAUDE.md");

  if (!(await fileExists(claudeMdPath))) {
    throw new Error("CLAUDE.md not found");
  }

  const content = await readFile(claudeMdPath);

  return {
    content: [
      {
        type: "text",
        text: content,
      },
    ],
  };
}
