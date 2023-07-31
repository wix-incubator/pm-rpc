'use strict'
const path = require('path')
module.exports = {
  target: 'web',
  entry: {
    app: './src/pm-rpc/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'umd',
    library: 'pmrpc',
    globalObject: '(typeof self !== "undefined" ? self : (typeof global !== "undefined" ? global : this))'
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
  },
  externals: {
    worker_threads: 'worker_threads'
  }
}