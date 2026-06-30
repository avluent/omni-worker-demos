import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import type { UserConfig } from 'vite';
import { omniWorkerVite } from '@anonaddy/omni-worker/vite';

const config: UserConfig = {
  plugins: [svelte(), omniWorkerVite()],
  server: {
    port: 3002,
    open: true,
  },
  build: {
    target: 'es2018',
    rollupOptions: {
      external: ['worker_threads'],
      output: {
        globals: {
          worker_threads: 'worker_threads',
        },
      },
    },
  },
};

export default config;
