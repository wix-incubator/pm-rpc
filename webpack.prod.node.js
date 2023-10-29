'use strict'

const merge = require('webpack-merge')
const common = require('./webpack.common')
const webpack = require('webpack')

module.exports = merge(common, {
  output: {
    filename: 'pm-rpc.node.js'
  },
  target: 'node',
  mode: 'production',
  optimization: {
    minimize: false
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({minimize: false, output: {comments: false}, sourceMap: true}),
    new webpack.DefinePlugin({
      MessageChannel: "(require('worker_threads')).MessageChannel",
      Worker: "(require('worker_threads')).Worker",
      MessagePort: "(require('worker_threads')).MessagePort"
    })
  ]
})