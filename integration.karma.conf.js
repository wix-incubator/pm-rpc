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
  browsers: [process.env.TRAVIS ? 'chrome_travis_ci' : 'ChromeHeadless', 'Firefox'],
  concurrency: 1
})

module.exports = function (config) {
  config.set(options)
}
