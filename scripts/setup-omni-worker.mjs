/**
 * Post-install setup for @anonaddy/omni-worker.
 *
 * The omni-worker package is installed via git+ but its dist/ directory is
 * gitignored. This script checks if dist/ exists and, if not, clones the
 * repo, builds it, and replaces the node_modules copy.
 */
import { execSync } from 'node:child_process';
import { existsSync, cpSync, rmSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');
const vendorDir = join(root, 'vendor', 'omni-worker');
const nodeModulesPath = join(root, 'node_modules', '@anonaddy', 'omni-worker');

function log(msg) {
  console.log(`[omni-worker] ${msg}`);
}

// Check if dist/ already exists (may be from a previous install)
if (existsSync(join(nodeModulesPath, 'dist', 'esm', 'index.js'))) {
  log('dist/ already present — skipping build.');
  process.exit(0);
}

// Check if vendor copy exists and is built
if (existsSync(join(vendorDir, 'dist', 'esm', 'index.js'))) {
  log('vendor/omni-worker already built — copying to node_modules.');
  cpSync(vendorDir, nodeModulesPath, { recursive: true, force: true });
  log('done.');
  process.exit(0);
}

// Clone if needed
if (!existsSync(vendorDir)) {
  log('Cloning omni-worker...');
  execSync('git clone --depth 1 https://github.com/avluent/omni-worker.git vendor/omni-worker', {
    cwd: root,
    stdio: 'inherit',
  });
}

// Build
log('Installing devDependencies & building...');
execSync('npm install --include=dev', { cwd: vendorDir, stdio: 'inherit' });
execSync('npm run build', { cwd: vendorDir, stdio: 'inherit' });

// Copy to node_modules
log('Copying built package to node_modules...');
cpSync(vendorDir, nodeModulesPath, { recursive: true, force: true });

log('Setup complete!');
