import typescript from '@rollup/plugin-typescript';
import { uglify } from 'rollup-plugin-uglify';
import pkg from './package.json';
import merge from 'deepmerge';
import { createBasicConfig } from '@open-wc/building-rollup';

const baseConfig = createBasicConfig();

export default merge (baseConfig ,{
  input: 'src/index.ts',
  plugins: [typescript(), uglify()],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
  ],
  external: ['react', 'react-dom'],
})
