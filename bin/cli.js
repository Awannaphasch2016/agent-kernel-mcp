#!/usr/bin/env node
/**
 * CLI entry point for agent-kernel-mcp
 *
 * Usage:
 *   npx @agent-kernel/mcp          # Run MCP server (default)
 *   npx @agent-kernel/mcp --help   # Show help
 *   npx @agent-kernel/mcp --info   # Show bundled resources info
 */

import { spawn } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..');

function showHelp() {
  console.log(`
Agent Kernel MCP Server v2.1.0

Usage:
  npx @agent-kernel/mcp [options]

Options:
  --help    Show this help message
  --info    Show bundled resources information
  --version Show version number

Environment Variables:
  CLAUDE_PROJECT_DIR    Project directory for project-specific overrides
                        (optional - bundled resources used as fallback)

MCP Configuration (.mcp.json):
  {
    "mcpServers": {
      "agent-kernel": {
        "command": "npx",
        "args": ["-y", "@agent-kernel/mcp@latest"]
      }
    }
  }

For more information, visit: https://github.com/anthropics/agent-kernel-mcp
`);
}

function showInfo() {
  const resourcesDir = join(PACKAGE_ROOT, 'resources');

  console.log('\nAgent Kernel MCP - Bundled Resources\n');
  console.log('=' .repeat(50));

  if (!existsSync(resourcesDir)) {
    console.log('\n[WARNING] No bundled resources found!');
    console.log('Run "npm run bundle" to bundle resources.\n');
    return;
  }

  const dirs = ['principles', 'commands', 'skills', 'kernel', 'agents'];

  for (const dir of dirs) {
    const dirPath = join(resourcesDir, dir);
    if (existsSync(dirPath)) {
      const count = countFiles(dirPath);
      console.log(`  ${dir.padEnd(12)} ${count} files`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`Resources location: ${resourcesDir}\n`);
}

function countFiles(dir) {
  let count = 0;
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) count++;
      else if (entry.isDirectory()) count += countFiles(join(dir, entry.name));
    }
  } catch (e) {
    // Ignore errors
  }
  return count;
}

function showVersion() {
  console.log('2.1.0');
}

function runServer() {
  const serverPath = join(PACKAGE_ROOT, 'build', 'index.js');

  if (!existsSync(serverPath)) {
    console.error('[ERROR] Server not built. Run "npm run build" first.');
    process.exit(1);
  }

  // Spawn the server, inheriting stdio for MCP communication
  const child = spawn('node', [serverPath], {
    stdio: 'inherit',
    env: process.env
  });

  child.on('error', (err) => {
    console.error('[ERROR] Failed to start server:', err.message);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// Parse arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
} else if (args.includes('--info')) {
  showInfo();
} else if (args.includes('--version') || args.includes('-v')) {
  showVersion();
} else {
  runServer();
}
