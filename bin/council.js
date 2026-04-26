#!/usr/bin/env node
import { fileURLToPath } from 'url';
import path from 'path';

// Resolve package root before any imports so lifecycle.js can find gateway/
// Works correctly whether running from src/ (dev) or dist/ (installed bundle)
process.env.COUNCIL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const arg = process.argv[2];

if (arg === 'setup') {
  const { runSetup } = await import('../scripts/setup.js');
  await runSetup();
} else {
  const { boot } = await import('../src/index.js');
  await boot();
}
