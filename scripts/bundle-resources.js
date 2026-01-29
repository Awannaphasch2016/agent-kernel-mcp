#!/usr/bin/env node
/**
 * Bundle resources from ss-automation/.claude/ into the agent-kernel-mcp package.
 * This makes the MCP self-contained and independent of the source repo at runtime.
 */

import { cpSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const PACKAGE_ROOT = join(__dirname, '..');
const SS_AUTOMATION_ROOT = join(PACKAGE_ROOT, '..', '..', '..');  // Up to ss-automation
const CLAUDE_DIR = join(SS_AUTOMATION_ROOT, '.claude');
const RESOURCES_DIR = join(PACKAGE_ROOT, 'resources');

// What to bundle
const BUNDLE_DIRS = [
  'principles',
  'commands',
  'kernel',
  'agents/core',      // Core agents only for minimal bundle
  'agents/registry.yaml',
];

// Skills to bundle (curated list - not all 90+ skills)
const BUNDLE_SKILLS = [
  'code-review',
  'error-investigation',
  'testing-workflow',
  'research',
  'refacter',
  'deployment',
  'mcp-integration',
  'mcp-development',  // MCP server development patterns
];

function copyDir(src, dest) {
  if (!existsSync(src)) {
    console.log(`  [SKIP] ${src} does not exist`);
    return;
  }

  const stat = statSync(src);
  if (stat.isFile()) {
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest);
    console.log(`  [COPY] ${src} -> ${dest}`);
    return;
  }

  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });

  // Count files
  const count = countFiles(dest);
  console.log(`  [COPY] ${src} -> ${dest} (${count} files)`);
}

function countFiles(dir) {
  let count = 0;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) count++;
    else if (entry.isDirectory()) count += countFiles(join(dir, entry.name));
  }
  return count;
}

function main() {
  console.log('='.repeat(60));
  console.log('Agent Kernel MCP - Resource Bundler');
  console.log('='.repeat(60));
  console.log(`Source: ${CLAUDE_DIR}`);
  console.log(`Target: ${RESOURCES_DIR}`);
  console.log('');

  // Clean existing resources
  if (existsSync(RESOURCES_DIR)) {
    console.log('[CLEAN] Removing existing resources/');
    rmSync(RESOURCES_DIR, { recursive: true });
  }
  mkdirSync(RESOURCES_DIR, { recursive: true });

  // Bundle directories
  console.log('\n[BUNDLE] Core directories:');
  for (const dir of BUNDLE_DIRS) {
    const src = join(CLAUDE_DIR, dir);
    const dest = join(RESOURCES_DIR, dir);
    copyDir(src, dest);
  }

  // Bundle curated skills
  console.log('\n[BUNDLE] Curated skills:');
  const skillsDir = join(RESOURCES_DIR, 'skills');
  mkdirSync(skillsDir, { recursive: true });

  for (const skill of BUNDLE_SKILLS) {
    const src = join(CLAUDE_DIR, 'skills', skill);
    const dest = join(skillsDir, skill);
    copyDir(src, dest);
  }

  // Copy skills README
  const skillsReadme = join(CLAUDE_DIR, 'skills', 'README.md');
  if (existsSync(skillsReadme)) {
    cpSync(skillsReadme, join(skillsDir, 'README.md'));
  }

  console.log('\n' + '='.repeat(60));
  console.log('[DONE] Resources bundled successfully!');
  console.log('='.repeat(60));
}

main();
