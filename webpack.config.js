'use strict'

const merge = require('lodash/merge')
const webpack = require('webpack')

module.exports = require('./make-webpack-config.js')({
  output: {
    filename: 'pm-rpc.min.js'
  },
  plugins: [new webpack.optimize.UglifyJsPlugin({ minimize: true,  output: {comments: false}, sourceMap: true })]
})