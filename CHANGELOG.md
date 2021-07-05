# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0]

### Breaking changes:

- fixed not used target in web workers: 
  ```javascript
  pmrpc.api.request('appId', {target: customTarget})
  ```
  Previously it ignored target in WebWorker and target was always`self`. 
  After this fix target will be honoured for messages

## [2.0.2]

Not published 

## [2.0.0, 2.0.1]

- Update webpack
- Change global object for module definition
- Decrease bundle size 


