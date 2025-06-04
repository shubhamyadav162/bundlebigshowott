const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Customize the config before returning it.
  config.module.rules.push({
    test: /\.ttf$/,
    loader: 'url-loader',
    include: path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
  });

  // Add a fallback for the 'crypto' module, as some dependencies might expect it.
  // This was also mentioned as a potential issue in one of the search results.
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }
  config.resolve.fallback.crypto = false;


  return config;
}; 