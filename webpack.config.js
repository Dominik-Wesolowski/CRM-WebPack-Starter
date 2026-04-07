const path = require('path');
const fs = require('fs');

// 🔧 tutaj sterujesz prefixem
const PREFIX = process.env.CRM_PREFIX || 'crm_';

function getEntryFiles() {
  const srcRoot = path.resolve(__dirname, 'src');
  const entryRoots = [path.join(srcRoot, 'forms'), path.join(srcRoot, 'ribbons')];

  const entries = {};

  function scan(dir) {
    if (!fs.existsSync(dir)) {
      return;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scan(fullPath);
        continue;
      }

      if (!item.endsWith('.ts')) {
        continue;
      }

      const relativePath = path.relative(srcRoot, fullPath);

      const normalized = relativePath.replace(/\.ts$/i, '').replace(/[\\/]/g, '_');

      const outputName = `${PREFIX}${normalized}`;

      entries[outputName] = fullPath;
    }
  }

  for (const root of entryRoots) {
    scan(root);
  }

  return entries;
}

module.exports = {
  mode: 'production',
  entry: getEntryFiles(),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  devtool: 'source-map',
};
