import { defineConfig } from 'tsdown';

import pkg from './package.json' with { type: 'json' };

const { devDependencies } = pkg;

export default defineConfig({
  entry: 'src/index.ts',
  dts: true,
  deps: {
    neverBundle: [...Object.keys(devDependencies).filter((dep) => dep.startsWith('@ai-sdk/'))],
  },
});
