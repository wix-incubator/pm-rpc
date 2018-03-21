'use strict'
const merge = require('lodash/merge')

module.exports = function (options) {
  return merge({
    browsers: [process.env.TRAVIS ? 'chrome_travis_ci' : 'ChromeHeadless'],
    singleRun: true,
    frameworks: ['jasmine'],
    webpack: {
      devtool: 'inline-source-map',
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.js/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  targets:
                    {
                      browsers: 'last 2 Chrome versions'
                    }
                }]
              ]
            }
          }
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
