'use strict'
const merge = require('webpack-merge')
const webpack = require('webpack')
const TARGET = process.env.npm_lifecycle_event
process.env.BABEL_ENV = TARGET


module.exports = function (options) {
const common = {
  entry: {
    app: './src/pm-rpc/index.js'
  },
  output: {
    path: `${__dirname}/build`,
    filename: 'pm-rpc.min.js',
    publicPath: '',
    library: 'pmrpc',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loaders: ['babel-loader?presets[]=es2015'],
        exclude: /node_modules/
      }
    ]
  }
}
return merge(common, options)
}