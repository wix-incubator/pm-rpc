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
})

module.exports = function (config) {
  config.set(options)
}
