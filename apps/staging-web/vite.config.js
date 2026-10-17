import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudflare } from '@cloudflare/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(appDir, '../..');

export default defineConfig({
  optimizeDeps: { noDiscovery: true, include: [] },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart({
      router: {
        generatedRouteTree: './routeTree.gen.ts',
        disableTypes: false,
      },
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.join(repoDir, 'src'),
      'framer-motion': path.join(appDir, 'node_modules/framer-motion/dist/es/index.mjs'),
      'lucide-react': path.join(appDir, 'node_modules/lucide-react/dist/esm/lucide-react.js'),
      '@radix-ui/react-slot': path.join(appDir, 'node_modules/@radix-ui/react-slot/dist/index.mjs'),
      'class-variance-authority': path.join(appDir, 'node_modules/class-variance-authority/dist/index.mjs'),
      clsx: path.join(appDir, 'node_modules/clsx/dist/clsx.mjs'),
      'tailwind-merge': path.join(appDir, 'node_modules/tailwind-merge/dist/bundle-mjs.mjs'),
    },
  },
  server: { port: 4174, strictPort: true },
});
