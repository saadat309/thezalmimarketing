import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const viteCli = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const localConfigHome = fileURLToPath(new URL('../.wrangler-local-config/', import.meta.url));
const child = spawn(process.execPath, [viteCli, ...process.argv.slice(2)], {
  env: { ...process.env, XDG_CONFIG_HOME: localConfigHome },
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(`Could not start local Vite: ${error.message}`);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Local Vite exited after signal ${signal}.`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 1;
});
