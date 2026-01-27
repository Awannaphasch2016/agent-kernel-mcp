import * as path from "path";
import { readFile, fileExists } from "../utils/file-reader.js";
import { resolveAssetDir } from "../utils/file-reader.js";

export async function loadSkill(projectDir: string, skillName: string) {
  const skillDir = await resolveAssetDir(projectDir, `skills/${skillName}`);

  const possibleFiles = ["SKILL.md", "README.md", "checklist.md", `${skillName}.md`];

  for (const file of possibleFiles) {
    const filePath = path.join(skillDir, file);
    if (await fileExists(filePath)) {
      const content = await readFile(filePath);
      return {
        content: [{ type: "text", text: content }],
      };
    }
  }

  throw new Error(`Skill '${skillName}' not found`);
}
