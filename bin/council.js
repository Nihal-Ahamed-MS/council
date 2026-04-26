#!/usr/bin/env tsx
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const arg = process.argv[2];

if (arg === 'setup') {
  const { runSetup } = await import('../scripts/setup.js');
  await runSetup();
} else {
  const { boot } = await import('../src/index.js');
  await boot();
}
