'use strict'

const merge = require('webpack-merge')
const common = require('./webpack.common')
const webpack = require('webpack')

module.exports = merge(common, {
  output: {
    filename: 'pm-rpc.node.min.js'
  },
  target: 'node',
  mode: 'production',
  plugins: [
    new webpack.LoaderOptionsPlugin({minimize: true, output: {comments: false}, sourceMap: true}),
    new webpack.DefinePlugin({
      MessageChannel: "(require('worker_threads')).MessageChannel",
      Worker: "(require('worker_threads')).Worker",
      MessagePort: "(require('worker_threads')).MessagePort"
    })
  ]
})