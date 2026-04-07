const path = require('path');
const fs = require('fs');

const PREFIX = process.env.CRM_PREFIX || 'crm_';

const EXCLUDED_ROOT_FOLDERS = new Set(['common', 'types', 'models']);

const ENTRY_FILE_SUFFIXES = ['.form.ts', '.ribbon.ts', '.dialog.ts', '.command.ts'];

function isEntryFile(fileName) {
  return ENTRY_FILE_SUFFIXES.some((suffix) => fileName.endsWith(suffix));
}

function getEntryFiles() {
  const srcRoot = path.resolve(__dirname, 'src');
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
        const relativeDir = path.relative(srcRoot, fullPath);
        const rootFolder = relativeDir.split(path.sep)[0];

        if (EXCLUDED_ROOT_FOLDERS.has(rootFolder)) {
          continue;
        }

        scan(fullPath);
        continue;
      }

      if (!isEntryFile(item)) {
        continue;
      }

      const relativePath = path.relative(srcRoot, fullPath);
      const outputName = relativePath.replace(/\.ts$/i, '');

      entries[outputName] = fullPath;
    }
  }

  scan(srcRoot);

  return entries;
}

module.exports = {
  mode: 'production',
  entry: getEntryFiles(),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      const chunkName = pathData.chunk.name;
      const parts = chunkName.split('/');

      const fileName = parts.pop();
      const folderPath = parts.join('/');

      return `${folderPath}/${PREFIX}${fileName}.js`;
    },
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
