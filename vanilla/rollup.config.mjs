import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import fg from 'fast-glob';

export default [
  {
    input: 'src/index.ts',  // Entry point for your TypeScript code
    output: {
      dir: 'dist',  // Output directory
      format: 'esm',  // Output format (ES modules)
      entryFileNames: '[name].js',  // Keep the name of the entry files
      chunkFileNames: '[name].js',  // For dynamic imports
      preserveModules: true,  // Preserve the module structure
      preserveModulesRoot: 'src',  // Optional: this will preserve the structure from the `src` directory
      name: 'vanilla-web-omni-worker'
    },
    treeshake: {
      moduleSideEffects: true
    },
    plugins: [
      nodeResolve(),
      typescript(),
      del({ targets: "dist/*" }),
    ]
  },
  {
    input: fg.sync('src/workers/**/*.ts'),  // Entry point for your TypeScript code
    output: {
      dir: 'dist/workers',
      format: 'esm',
      preserveModules: false,
      entryFileNames: '[name].js',
    },
    plugins: [
      nodeResolve(),
      typescript(),
    ]
  }
];