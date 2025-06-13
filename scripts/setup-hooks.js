#!/usr/bin/env bun

import { execSync } from 'node:child_process';
import { existsSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const HOOKS_DIR = '.git/hooks';
const LEFTHOOK_HOOKS = ['pre-commit', 'commit-msg', 'pre-push'];

function isGitRepository() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function areHooksInstalled() {
  if (!existsSync(HOOKS_DIR)) {
    return false;
  }

  // Check if at least one lefthook hook exists and is executable
  for (const hook of LEFTHOOK_HOOKS) {
    const hookPath = join(HOOKS_DIR, hook);
    if (existsSync(hookPath)) {
      try {
        const stats = statSync(hookPath);
        if (stats.isFile() && (stats.mode & 0o111)) {
          // Check if it's a lefthook hook by looking for lefthook in the content
          const content = readFileSync(hookPath, 'utf8');
          if (content.includes('lefthook')) {
            return true;
          }
        }
      } catch {
        // Ignore errors and continue checking
      }
    }
  }

  return false;
}

function installHooks() {
  console.log('🔧 Installing git hooks with lefthook...');
  try {
    execSync('bunx lefthook install', { stdio: 'inherit' });
    console.log('✅ Git hooks installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install git hooks:', error.message);
    process.exit(1);
  }
}

function main() {
  // Skip if not in a git repository
  if (!isGitRepository()) {
    console.log('ℹ️  Not in a git repository, skipping hook installation');
    return;
  }

  // Skip if hooks are already installed
  if (areHooksInstalled()) {
    console.log('✅ Git hooks are already installed');
    return;
  }

  // Install hooks
  installHooks();
}

main(); 
