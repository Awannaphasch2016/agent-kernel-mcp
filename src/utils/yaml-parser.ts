import YAML from "yaml";
import { readFile } from "./file-reader.js";

export async function parseYamlFile(filePath: string): Promise<any> {
  const content = await readFile(filePath);
  try {
    return YAML.parse(content);
  } catch (error: any) {
    throw new Error(`Failed to parse YAML file ${filePath}: ${error.message}`);
  }
}
