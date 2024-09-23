//@ts-check
const fs = require('fs');

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

module.exports = {
  plugins: [
    // nativeNodeModulesPlugin,
    // ignorePlugin,
    // customEntryPointPlugin,
    rawLoaderPlugin,
  ],
};
