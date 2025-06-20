#!/usr/bin/env node

import * as esbuild from 'esbuild';

const mainConfig: esbuild.BuildOptions = {
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  platform: 'node',
  bundle: true,
  keepNames: false,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  sourcemap: false,
  sourcesContent: true,
};

esbuild.build(mainConfig).catch((e) => {
  console.error(e);
  process.exit(1);
});
