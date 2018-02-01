'use strict'
const path = require('path')
const options = require('./make-karma-config')({
  preprocessors: {
    'integration/**/*.js': ['webpack', 'sourcemap']
  },
  files: [
    {pattern: 'integration/**/*', included: false},
    {pattern: 'src/pm-rpc/**/*', included: false},
    {pattern: 'integration/**/*.spec.js', watched: false}
  ],
  coverageReporter: {
    dir: 'coverage/integration'
  },
  browsers: [process.env.TRAVIS ? 'chrome_travis_ci': 'ChromeHeadless', 'Firefox'],
})

module.exports = function (config) {
  config.set(options)
}
