import { readFile } from "../utils/file-reader.js";
import { resolveAssetPath } from "../utils/file-reader.js";

export async function getClaudeMd(projectDir: string) {
  const filePath = await resolveAssetPath(projectDir, "CLAUDE.md");
  const content = await readFile(filePath);
  return {
    content: [{ type: "text", text: content }],
  };
}
