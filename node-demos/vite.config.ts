import { defineConfig } from 'vite';
import { omniWorkerVite } from '@anonaddy/omni-worker/vite';

export default defineConfig({
  plugins: [omniWorkerVite()],
});
