import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import { omniWorkerVite } from '@anonaddy/omni-worker/vite';

const config: UserConfig = {
  plugins: [omniWorkerVite()],
  server: {
    port: 3000,
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
