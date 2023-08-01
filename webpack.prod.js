'use strict'

const merge = require('webpack-merge')
const common = require('./webpack.common')
const webpack = require('webpack')

module.exports = merge(common, {
  output: {
    filename: 'pm-rpc.min.js'
  },
  mode: 'production',
  plugins: [
    new webpack.LoaderOptionsPlugin({minimize: true, output: {comments: false}, sourceMap: true}),
    new webpack.IgnorePlugin(/^worker_threads$/)
  ]
})