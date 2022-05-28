import typescript from 'rollup-plugin-typescript2'
export default [
  {
    input: './src/gismeteo.ts',
    output: {
      file: './lib/gismeteo.esm.js',
      format: 'esm',
    },
    plugins: [typescript()],
    external: ['moment', 'axios', 'cheerio', 'user-agents', 'is-number'],
  },
  {
    input: './src/gismeteo.ts',
    output: {
      file: './lib/gismeteo.js',
      format: 'cjs',
    },
    plugins: [typescript()],
    external: ['moment', 'axios', 'cheerio', 'user-agents', 'is-number'],
  },
]
