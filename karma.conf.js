'use strict'
const options = require('./make-karma-config')({
  preprocessors: {
    '**/__tests__/*Spec.js': ['webpack', 'sourcemap']
  },
  coverageReporter: {
    dir: 'coverage/unit'
  },
  files: [
    'node_modules/es6-collections/es6-collections.js',
    {pattern: 'src/pm-rpc/**/__tests__/*Spec.js', watched: false}
  ]
})
module.exports = function (config) {
  config.set(options)
}