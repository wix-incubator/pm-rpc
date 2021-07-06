'use strict'
const options = require('./make-karma-config')({
  preprocessors: {
    'integration/**/*.js': ['webpack', 'sourcemap']
  },
  files: [
    {pattern: 'integration/content/**/*', included: false},
    'integration/*.spec.js'
  ],
  coverageReporter: {
    dir: 'coverage/integration'
  },
  useIframe: false,
  browsers: ['ChromeHeadless', 'FirefoxHeadless'],
  concurrency: 1
})

module.exports = function (config) {
  config.set(options)
}
