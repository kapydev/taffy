/// <reference types='vitest' />
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, Plugin, UserConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import requireTransform from 'vite-plugin-require-transform';
import { viteSingleFile } from 'vite-plugin-singlefile';

const CUR_DIR = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4200;

const indexHtmlSpoofPlugin = (): Plugin => {
  let config: UserConfig;
  const getOutDirPath = (config: UserConfig, pathName: string) => {
    const relativeOutDir = config.build?.outDir;
    const rootDir = config.root;
    if (!rootDir) {
      throw new Error('MISSING_ROOT_DIR');
    }
    if (!relativeOutDir) {
      throw new Error('MISSING_OUTPUT_DIR');
    }
    const outDir = path.resolve(rootDir, relativeOutDir);
    const indexOutputPath = path.resolve(outDir, pathName);
    return { outDir, indexOutputPath };
  };

  const writeFile = async (
    path: string,
    contents: string,
    config: UserConfig
  ) => {
    const { outDir, indexOutputPath } = getOutDirPath(config, path);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(indexOutputPath, contents);
  };

  return {
    name: 'index-html-spoof-plugin',
    configResolved: async (resolvedConfig) => {
      config = resolvedConfig as unknown as UserConfig;
      // const nonNullOriginSpoof = `<script>
      //     window.location.href = "http://localhost:${PORT}"
      //   </script>
      //   `;
      // await writeFile('index-spoof.html', nonNullOriginSpoof, config);
    },
    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        const htmlWithBaseHref = html.replace(
          '<head>',
          `<head>\n<base href="http://localhost:${PORT}">`
        );
        await writeFile('index.html', htmlWithBaseHref, config);
        return html;
      },
    },
    buildStart: () => {
      const attemptFetch = () => {
        //We need to try this fetch to do the inital file population
        fetch(`http://localhost:${PORT}`)
          .then((response) => {
            if (!response.ok) {
              setTimeout(attemptFetch, 200);
            }
          })
          .catch((error) => {
            setTimeout(attemptFetch, 200);
          });
      };

      attemptFetch();
    },
  };
};

const IGNORE_PACKAGES = ['vsc-ext'];
const IGNORE_GLOBS = IGNORE_PACKAGES.map((pkg) => `**/${pkg}/**`);

// FIXME: for some reason just setting IGNORE_GLOBS on watch.ignored is not working
const unwatchNonPluginFiles = (): Plugin => {
  return {
    name: 'unwatch-non-plugin-files',
    configureServer(server) {
      // Ensure that the watcher unwatch the specific files or directories
      server.watcher.unwatch(IGNORE_GLOBS);
    },
  };
};

// const DEFINED_PROCESS_ENVS = Object.fromEntries(
//   Object.entries({ ...getEnv() })
//     .filter(([key, _]) => key.startsWith('NX'))
//     .flatMap(([key, val]) => {
//       return [[`process.env.${key}`, JSON.stringify(val)]];
//     })
// );

const finalConfig = defineConfig(({ command }) => {
  return {
    // define: { ...DEFINED_PROCESS_ENVS },
    root: CUR_DIR,
    base: process.env.VITE_PLUGIN_URL,
    server: {
      port: PORT,
      host: 'localhost',
      watch: {
        ignored: IGNORE_GLOBS,
      },
    },

    plugins: [
      nodePolyfills({
        include: ['path', 'buffer', 'crypto', 'vm', 'os', 'assert', 'util'],
      }),
      react(),
      nxViteTsPaths(),
      requireTransform(),
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
      command === 'serve' && indexHtmlSpoofPlugin(),
      viteSingleFile(),
      unwatchNonPluginFiles(),
    ],

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },
    build: {
      outDir: '../../dist/apps/taffy/static',
      minify: false,
      reportCompressedSize: true,
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});

export default finalConfig;
