const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: {
    collectEvent: './src/handlers/collectEvent.js',
    getAnalytics: './src/handlers/getAnalytics.js',
    getSiteStats: './src/handlers/getSiteStats.js',
    registerSite: './src/handlers/registerSite.js',
    getSites: './src/handlers/getSites.js',
    analyticsScript: './src/handlers/analyticsScript.js'
  },
  target: 'node',
  mode: 'production',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  }
};
