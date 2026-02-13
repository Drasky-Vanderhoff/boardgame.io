import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const entries = {
  main: resolve(__dirname, 'packages/main.js'),
  client: resolve(__dirname, 'packages/client.ts'),
  core: resolve(__dirname, 'packages/core.ts'),
  react: resolve(__dirname, 'packages/react.ts'),
  ai: resolve(__dirname, 'packages/ai.ts'),
  plugins: resolve(__dirname, 'packages/plugins.ts'),
  testing: resolve(__dirname, 'packages/testing.ts'),
};

const external = ['react', 'react-dom'];

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2018',
    sourcemap: false,
    lib: {
      entry: entries,
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${format === 'es' ? 'esm' : 'cjs'}/${entryName}.js`,
    },
    rollupOptions: {
      external,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'src/client/client.test.ts',
      'src/client/react.test.tsx',
      'src/client/transport/transport.test.ts',
      'src/core/core-smoke.test.ts',
      'src/ai/ai-smoke.test.ts',
    ],
  },
});
