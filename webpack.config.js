const path = require('node:path');
const { getWebResources, sourceRoot } = require('./scripts/web-resources.cjs');

module.exports = (_, argv = {}) => ({
  mode: 'production',
  entry: () => {
    const resources = getWebResources();
    const handlers = new Set();

    return Object.fromEntries(resources.map(({ file, name, outputFile, handlerPath }) => {
      // Webpack uses this namespace to expose exported handlers to Dataverse.
      const handler = handlerPath.join('.');
      if (handlers.has(handler)) {
        throw new Error(`Duplicate CRM handler namespace: ${handler}`);
      }
      handlers.add(handler);

      return [name, {
        import: file,
        filename: outputFile,
        library: { type: 'window', name: handlerPath },
      }];
    }));
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    enabledLibraryTypes: ['window'],
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    parser: {
      javascript: {
        dynamicImportMode: 'eager',
      },
    },
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  plugins: [{
    apply(compiler) {
      compiler.hooks.afterCompile.tap('WatchWebResourceEntries', (compilation) => {
        compilation.contextDependencies.add(sourceRoot);
      });
    },
  }],
  devtool: argv.mode === 'development' ? 'inline-source-map' : false,
});
