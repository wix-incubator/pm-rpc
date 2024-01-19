[![Maintenance Status][status-image]][status-url] [![NPM version][npm-image]][npm-url] [![Dependencies][deps-image]][deps-url] [![Build Status][build-image]][build-url]

# RPC calls via PostMessage (pm-rpc)
This project allows defining and using a promise-based API between different browser frames or workers.

## Usage

RPC calls are defined between a **callee** and one or several **callers**

### API definition
The **callee** must first `set` an API for consumption.
This makes the API available for any callers requesting for an API with that ID.


The API can be any object containing functions and/or namespaces, and namespaces can be functions as well.  
e.g.:
```javascript
const api = {
  syncFunc(...args) {
    return someComputation(...args)
  },
  asyncFunc(...args) {
    return performSomeAjaxRequest(...args)
  },
  
  someNamespace: {
    namespacedFunction(...args) {
      doSomething(...args)
    }
  },
  
  add(a, b) { 
    return a + b
  }
};

api.add.one = a => 1 + a; //api.add is both a function and a namespace!
rpc.api.set(appId, api);
```

### Let's look at a real example: 
Let the callee expose a 'maxOdd' function that recives as arguments a getNumbers and a filterOdd functions, and as a result return the max number.

Please note that the callee expose it's API by calling <b>pmrpc.api.set</b>
<br/>
```javascript
const api = {
  maxOdd(getNumbers, getOdd) {
    return getNumbers()
      .then(getOdd)
      .then(odds => Math.max(...odds))
  }
}
pmrpc.api.set('functions', api)
```

The caller code will look as follow:

```javascript
pmrpc.api.request('functions', {target: iframe.contentWindow})
  .then(api => {
    const filterOdd = arr => arr.filter(x => x % 2)
    const getNumbers = () => [1, 2, 3, 4, 5, 6]

    api.maxOdd(getNumbers, filterOdd)
      .then(result => {
        //result is 5 try it!
    })
})
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

#### Using `onApiSettled`
When setting an API, you can also pass an options parameter with an `onApiSettled` option.
This callback will be called whenever any API method is invoked from any caller after the api has settled, with the following object:
* **appId** - The ID of the app passed
* **call** - The name of the function to invoke
* **args** - An array of arguments passed
* **onApiCallResult** - The result from the `onApiCall` callback

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
rpc.api.set(appId, api, {
    onApiCall:() => performance.now(),
    onApiSettled: message => {
      console.log(`Method: ${message.call} was executed in ${performance.now() - message.onApiCallResult} ms`)
    }
});
```

#### Using with WebWorker 

When setting an API, you can specify workers that may consume requested API. Inside worker, you can request 

```javascript
const api = {
  asyncFunc(...args) {
    return performSomeAjaxRequest(args)
  }
}

const worker = new Worker('dowork.js')

rpc.api.set('appId', api, {workers: [worker]});
```

Inside web worker: 

```javascript
rpc.api.request('appId')
  .then(api => api.asyncFunc())
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

[npm-url]: https://npmjs.org/package/pm-rpc
[npm-image]: http://img.shields.io/npm/v/pm-rpc.svg?style=flat-square

[status-url]: https://github.com/wix/pm-rpc/pulse
[status-image]: http://img.shields.io/badge/status-maintained-brightgreen.svg?style=flat-square

[deps-url]: https://david-dm.org/wix/pm-rpc
[deps-image]: https://img.shields.io/david/dev/wix/pm-rpc.svg?style=flat-square

[build-image]: https://github.com/wix/pm-rpc/actions/workflows/node.js.yml/badge.svg
[build-url]: https://github.com/wix/pm-rpc/actions/workflows/node.js.yml
