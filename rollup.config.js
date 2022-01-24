import typescript from '@rollup/plugin-typescript';
import { uglify } from 'rollup-plugin-uglify';
import merge from 'deepmerge';
import { createBasicConfig } from '@open-wc/building-rollup';

const baseConfig = createBasicConfig();

export default merge (baseConfig ,{
  input: 'src/index.ts',
  plugins: [typescript({tsconfig: './tsconfig.json'}), uglify()],
  output: [
    {
      dir: './',
      format: 'cjs',
      exports: 'named',
    },
  ],
  external: ['react', 'react-dom', 'tslib'],
  preserveModules: true,
})
