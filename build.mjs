import * as esbuild from 'esbuild';
import { mkdir } from 'fs/promises';

await mkdir('dist', { recursive: true });

await esbuild.build({
  entryPoints: ['bin/council.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/council.js',
  jsx: 'transform',
  // fsevents is macOS-only native module; react-devtools-core is an optional ink dep
  external: ['fsevents', 'react-devtools-core'],
  banner: {
    js: '#!/usr/bin/env node',
  },
});

console.log('✓ dist/council.js');
