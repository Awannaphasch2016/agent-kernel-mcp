import * as fs from "fs/promises";
import * as path from "path";

export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error: any) {
    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listFiles(dirPath: string, extension?: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);

    if (extension) {
      return files.filter((file) => file.endsWith(extension));
    }

    return files;
  } catch (error: any) {
    throw new Error(`Failed to list files in ${dirPath}: ${error.message}`);
  }
}

export async function listDirectories(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error: any) {
    throw new Error(`Failed to list directories in ${dirPath}: ${error.message}`);
  }
}
