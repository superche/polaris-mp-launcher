// rollup.config.js
import merge from 'deepmerge';
import { createBasicConfig } from '@open-wc/building-rollup';
import typescript from '@rollup/plugin-typescript';

const baseConfig = createBasicConfig();

export default merge(baseConfig, {
  input: './dist/es/src/index.js',
  output: {
    dir: 'dist',
  },
});
