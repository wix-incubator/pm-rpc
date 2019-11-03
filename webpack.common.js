'use strict'
const path = require('path')
module.exports = {
  entry: {
    app: './src/pm-rpc/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'umd',
    library: 'pmrpc',
    globalObject: 'this'
  },
  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: ['env']
      }
    }]
  }
}