import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundled assets directory (relative to build/utils/)
const BUNDLED_ASSETS_DIR = path.resolve(__dirname, "../../assets");

/**
 * Resolve an asset path, checking project-local first, then bundled assets.
 * @param projectDir - The project root directory (may have .claude/)
 * @param relativePath - Path relative to .claude/ or assets/ (e.g., "principles/index.md")
 */
export async function resolveAssetPath(
  projectDir: string,
  relativePath: string
): Promise<string> {
  // 1. Check project-local .claude/ directory
  const localPath = path.join(projectDir, ".claude", relativePath);
  if (await fileExists(localPath)) {
    return localPath;
  }

  // 2. Fall back to bundled assets
  const bundledPath = path.join(BUNDLED_ASSETS_DIR, relativePath);
  if (await fileExists(bundledPath)) {
    return bundledPath;
  }

  throw new Error(`Asset not found: ${relativePath} (checked project-local and bundled)`);
}

/**
 * Resolve a directory path, checking project-local first, then bundled assets.
 */
export async function resolveAssetDir(
  projectDir: string,
  relativePath: string
): Promise<string> {
  const localDir = path.join(projectDir, ".claude", relativePath);
  try {
    const stat = await fs.stat(localDir);
    if (stat.isDirectory()) return localDir;
  } catch {}

  const bundledDir = path.join(BUNDLED_ASSETS_DIR, relativePath);
  try {
    const stat = await fs.stat(bundledDir);
    if (stat.isDirectory()) return bundledDir;
  } catch {}

  throw new Error(`Asset directory not found: ${relativePath}`);
}

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
