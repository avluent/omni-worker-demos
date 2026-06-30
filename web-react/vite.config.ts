import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { UserConfig } from 'vite';
import { omniWorkerVite } from '@anonaddy/omni-worker/vite';

const config: UserConfig = {
  plugins: [react(), omniWorkerVite()],
  server: {
    port: 3001,
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
