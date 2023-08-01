'use strict'
const merge = require('webpack-merge')
const webpack = require('webpack')
const common = require('./webpack.common')
module.exports = merge(common, {
  output: {
    filename: 'pm-rpc.js'
  },
  mode: 'development',
  plugins: [
    new webpack.IgnorePlugin(/^worker_threads$/)
  ]
})