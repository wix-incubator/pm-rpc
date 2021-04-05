'use strict'
const merge = require('webpack-merge')
const common = require('./webpack.common')
module.exports = merge(common, {
  output: {
    filename: 'pm-rpc.js'
  },
  mode: 'development'
})
