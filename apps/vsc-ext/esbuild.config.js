//@ts-check
const fs = require('fs');
const dotenv = require('dotenv');
const { polyfillNode } = require('esbuild-plugin-polyfill-node');

// Custom plugin for loading raw files
/**
 * @type {import('esbuild').Plugin}
 */
const rawLoaderPlugin = {
  name: 'raw-loader',
  setup(build) {
    build.onResolve({ filter: /\?raw$/ }, (args) => {
      return {
        path: require.resolve(args.path.replace('?raw', ''), {
          paths: [args.resolveDir],
        }),
        namespace: 'raw-loader',
      };
    });
    build.onLoad({ filter: /.*/, namespace: 'raw-loader' }, async (args) => {
      const rawPath = args.path.replace(/\?raw$/, '');
      const contents = await fs.promises.readFile(rawPath, 'utf8');
      return {
        contents,
        loader: 'text',
      };
    });
  },
};

dotenv.config();

module.exports = {
  plugins: [rawLoaderPlugin],
  bundle: true,
  external: ['fs', 'path', 'vscode'],
  sourcemap: true,
  define: {
    // 'process.env.VITE_SUPABASE_URL': JSON.stringify(
    //   process.env.VITE_SUPABASE_URL
    // ),
    // 'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
    //   process.env.VITE_SUPABASE_ANON_KEY
    // ),
  },
};
