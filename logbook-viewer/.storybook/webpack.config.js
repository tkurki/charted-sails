const path = require('path');
const TSDocgenPlugin = require('react-docgen-typescript-webpack-plugin');

module.exports = (baseConfig, env, defaultConfig) => {
  defaultConfig.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('awesome-typescript-loader')
  });
  defaultConfig.plugins.push(new TSDocgenPlugin());
  defaultConfig.resolve.extensions.push('.ts', '.tsx');

  // Stolen from create-react-app webpack configuration (with the comment):
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  defaultConfig.node = {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  }

  return defaultConfig;
};

