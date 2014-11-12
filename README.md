storey.js
=========

**This project is still under development. storey.js is developed to be used in [cargo.js](https://github.com/mavenave/cargo.js).**

storey.js is a bunch of wrapper functions that make DOM / Web Storage **safer** and **better** to use.

Some of the key features of storey.js:
 - Asynchronous wrappers over Storage transactions
 - Serializes / deserializes to string (less shit work for you)
 - Minimal, no dependencies and fallbacks (most browsers support Web Storage already)

API Reference
-------------

**storey.set(key, value, [callback])**

Asynchronously sets a `key` to `value` in storage. `key` must be a string. The `callback` is optional, without parameters.

**storey.setSync(key, value)**

Synchronously sets a `value` with `key` in storage.

**storey.setMulti(keyValue, [callback])**

Asynchronously sets an Object `keyValue`. `keyValue` is defined below in the example. `callback` is optional, without parameters.

```javascript
var keyValue = {
  'hello': 'world',
  'buh': 'bye'
}
storage.setMulti(keyValue, function() {
  // optional callback, do something here
});
```

**storey.get(key, callback)**

Asynchronously gets a `key`. `callback` is filled with `value` parameter.
```javascript
storey.get('key', function(value) {
  console.log(value); // do something with value
});
```

**storey.getSync(key)**

Synchronously gets the value of `key`.

**storey.getMulti(keys, callback)**

Asynchronously gets an Array of values by using a `keys` Array.
`callback` has Array `values` as parameter.

```javascript
var keys = ['hello', 'foo'];
storage.getMulti(keys, function(values) {
  // do something with Array of values
});
```

**storey.remove(key, [callback])**

Asynchronously removes the `key` from storage. `callback` is optional.

**storey.removeSync(key)**

Synchronously removes the `key` from storage.

**storey.removeMulti(keys, [callback])**

Asynchronously removes an Array of `keys` from storage. `callback` is optional.

**storey.clear()**

Caution! Approaching danger! Asynchronously clears up Web Storage.

**storey.has(key, callback)**

Purely a syntactic sugar for checking presence of `key`. Equivalent to `storage.get`.

**storey.has()**

Checks how much space is used by keys and values in storage.

**storey.left()**

Checks how much space is left in storage. 500 MB - `storey.has()`.

License
-------
The MIT License. Look [here](https://github.com/mavenave/storey.js/blob/master/README.md) for it.

Contact
-------
Like what you see here? I'm more than willing to receive Pull Requests. :smile: I'm reachable at [@mavenave](https://twitter.com/mavenave) and guanhao3797@gmail.com.
