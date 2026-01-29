import * as path from "path";
import { readFile, listFiles, fileExists } from "../utils/file-reader.js";
import { parseYamlFile } from "../utils/yaml-parser.js";

export async function getCommand(claudeDir: string, name: string) {
  const commandPath = path.join(claudeDir, ".claude", "commands", `${name}.md`);

  if (!(await fileExists(commandPath))) {
    throw new Error(`Command '${name}' not found`);
  }

  const content = await readFile(commandPath);

  return {
    content: [
      {
        type: "text",
        text: content,
      },
    ],
  };
}

export async function listCommands(claudeDir: string, category?: string) {
  const commandsDir = path.join(claudeDir, ".claude", "commands");
  const files = await listFiles(commandsDir, ".md");

  const commands = files
    .filter((file) => file !== "README.md")
    .map((file) => file.replace(".md", ""));

  // If metadata.yaml exists, use it for categorization
  const metadataPath = path.join(commandsDir, "metadata.yaml");
  if (await fileExists(metadataPath)) {
    try {
      const metadata = await parseYamlFile(metadataPath);

      if (category && category !== "all") {
        // Filter by category
        const filtered = Object.entries(metadata.commands || {})
          .filter(([_, cmd]: [string, any]) => cmd.type === category)
          .map(([name]) => name);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(filtered, null, 2),
            },
          ],
        };
      }
    } catch (error) {
      // If metadata parsing fails, return all commands
    }
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(commands, null, 2),
      },
    ],
  };
}
