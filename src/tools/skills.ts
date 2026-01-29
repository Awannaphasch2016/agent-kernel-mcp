import * as path from "path";
import { readFile, fileExists, listFiles } from "../utils/file-reader.js";

export async function loadSkill(claudeDir: string, skillName: string) {
  const skillDir = path.join(claudeDir, ".claude", "skills", skillName);

  // Try to read the skill's main file or checklist
  const possibleFiles = ["README.md", "checklist.md", `${skillName}.md`];

  for (const file of possibleFiles) {
    const filePath = path.join(skillDir, file);
    if (await fileExists(filePath)) {
      const content = await readFile(filePath);
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

  throw new Error(`Skill '${skillName}' not found`);
}
