'use strict'
const merge = require('lodash/merge')

module.exports = function (options) {
  return merge({
    browsers: [process.env.TRAVIS ? 'chrome_travis_ci': 'ChromeHeadless'],
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
    reporters: ['progress', 'coverage'],
    webpackMiddleware: {
      noInfo: true
    },
    colors: true,
    coverageReporter: {
      type: 'json'
    },
    customLaunchers: {
      chrome_travis_ci: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  }, options)
}
