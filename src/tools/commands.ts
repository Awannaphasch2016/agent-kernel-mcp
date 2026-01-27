import * as path from "path";
import { readFile, listFiles, fileExists } from "../utils/file-reader.js";
import { resolveAssetPath, resolveAssetDir } from "../utils/file-reader.js";
import { parseYamlFile } from "../utils/yaml-parser.js";

export async function getCommand(projectDir: string, name: string) {
  const filePath = await resolveAssetPath(projectDir, `commands/${name}.md`);
  const content = await readFile(filePath);
  return {
    content: [{ type: "text", text: content }],
  };
}

export async function listCommands(projectDir: string, category?: string) {
  const commandsDir = await resolveAssetDir(projectDir, "commands");
  const files = await listFiles(commandsDir, ".md");

  const commands = files
    .filter((file) => file !== "README.md")
    .map((file) => file.replace(".md", ""));

  const metadataPath = path.join(commandsDir, "metadata.yaml");
  if (await fileExists(metadataPath)) {
    try {
      const metadata = await parseYamlFile(metadataPath);
      if (category && category !== "all") {
        const filtered = Object.entries(metadata.commands || {})
          .filter(([_, cmd]: [string, any]) => cmd.type === category)
          .map(([name]) => name);
        return {
          content: [{ type: "text", text: JSON.stringify(filtered, null, 2) }],
        };
      }
    } catch (error) {
      // If metadata parsing fails, return all commands
    }
  }

  return {
    content: [{ type: "text", text: JSON.stringify(commands, null, 2) }],
  };
}
