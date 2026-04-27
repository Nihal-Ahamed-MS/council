import * as esbuild from 'esbuild';
import { mkdir } from 'fs/promises';

await mkdir('dist', { recursive: true });

const stubPlugin = {
  name: 'stub-missing',
  setup(build) {
    build.onResolve({ filter: /^react-devtools-core$/ }, () => ({
      path: 'react-devtools-core',
      namespace: 'stub',
    }));
    build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
      contents: 'export default {}',
      loader: 'js',
    }));
  },
};

await esbuild.build({
  entryPoints: ['bin/council.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/council.js',
  jsx: 'transform',
  external: ['fsevents'],
  plugins: [stubPlugin],
});

console.log('✓ dist/council.js');
