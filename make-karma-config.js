'use strict'
const path = require('path')
const merge = require('lodash/merge')

module.exports = function (options) {
  return merge({
    browsers: ['Chrome'],
    singleRun: true,
    frameworks: ['jasmine'],
    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {test: /\.js/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
      }
    },
    reporters: process.env.IS_BUILD_AGENT ? ['teamcity'] : ['progress', 'coverage'],
    webpackMiddleware: {
      noInfo: true
    },
    colors: true,
    coverageReporter: {
      type: 'json'
    }
  }, options)
}
