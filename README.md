[![Maintenance Status][status-image]][status-url] [![NPM version][npm-image]][npm-url] [![Dependencies][deps-image]][deps-url] [![Build Status][build-image]][build-url]

# RPC calls via PostMessage (pm-rpc)
This project allows defining and using a promise-based API between different browser frames or workers.

## Usage

RPC calls are defined between a **callee** and one or several **callers**

### API definition
The **callee** must first `set` an API for consumption.
This makes the API available for any callers requesting for an API with that ID.


The API sent should be A flat object (functions directly under the root). The functions can be either synchronous or return promises.
e.g.:
```javascript
const api = {
  syncFunc(...args) {
    return someComputation(...args)
  },
  asyncFunc(...args) {
    return performSomeAjaxRequest(args)
  }
}
rpc.api.set(appId, api);
```

#### Removing a set API
The **callee** may remove an API, and stop listening for requests to it.
This makes the API no longer available, and rejects any other requests for the API with an error message.
e.g.:
```javascript
rpc.api.unset(appId)
```

#### Using `onApiCall`
When setting an API, you can also pass an options parameter with an `onApiCall` option.
This callback will be called whenever any API method is invoked from any caller, with the following object:
* **appId** - The ID of the app passed
* **call** - The name of the function to invoke
* **args** - An array of arguments passed

e.g.:
```javascript
const api = {
  syncFunc(...args) {
    return someComputation(...args);
  },
  asyncFunc(...args) {
    return performSomeAjaxRequest(args)
  }
}
rpc.api.set(appId, api, {onApiCall: function (data) {
  console.log(data); // {appId: 'someAppId', call: 'theMethodCalled', args:['argument1', 'argument2']} 
}});
```

### API usage:
To use an API, the caller must **request** it from the callee.
The API is then returned in a promise, and all API calls return promises.

e.g.:

```javascript
import rpc from 'pm-rpc';
rpc.api.request(
  appId, 
  {
    target //The callee window, usually parent
  }
)
.then(api => api.syncFunc(...someArgs))
.then(result => {
    // Do something with the results
});
```

### Using with `initiator`
Instead of requesting an API from a `target`, you can pass the ID of an `iframe` as `initiator`

e.g.:

```javascript
import rpc from 'pm-rpc';
rpc.api.request(
  appId,
  {
    initiator: 'id-of-iframe'
  }
)
    .then(/* ... Use the API somehow*/)
```
[npm-url]: https://npmjs.org/package/pm-rpc
[npm-image]: http://img.shields.io/npm/v/pm-rpc.svg?style=flat-square

[status-url]: https://github.com/wix/pm-rpc/pulse
[status-image]: http://img.shields.io/badge/status-maintained-brightgreen.svg?style=flat-square

[deps-url]: https://david-dm.org/wix/pm-rpc
[deps-image]: https://img.shields.io/david/dev/wix/pm-rpc.svg?style=flat-square

[build-image]: https://travis-ci.org/wix/pm-rpc.svg?branch=master
[build-url]: https://travis-ci.org/wix/pm-rpc