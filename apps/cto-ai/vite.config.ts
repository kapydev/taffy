/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import checker from 'vite-plugin-checker';
import * as path from 'path';
import { fileURLToPath } from 'url';

const CUR_DIR = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => {
  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/cto-ai',

    server: {
      port: 4200,
      host: 'localhost',
    },

    preview: {
      port: 4300,
      host: 'localhost',
    },

    plugins: [
      react(),
      nxViteTsPaths(),
      command === 'serve' &&
        checker({
          overlay: {
            position: 'tr',
            panelStyle: `
            left: 1rem;
            bottom: 1rem;
            width: calc(100vw - 2rem);
            max-height: 90vh;
            height: auto;
            border-radius: 10px;
            background: #450a0a55;
            backdrop-filter: blur(8px);
          }`,
          },
          root: CUR_DIR,
          typescript: {
            tsconfigPath: './tsconfig.json',
          },
        }),
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    build: {
      outDir: '../../dist/apps/cto-ai',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
