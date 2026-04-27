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
  external: ['fsevents', 'react-devtools-core'],
});

console.log('✓ dist/council.js');
