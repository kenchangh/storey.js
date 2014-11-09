/*
 * Module's settings and public API.
 */
var storage = {
  storageType: 'localStorage',
  async: true,
};
storage.works = storageSupported(storage.storageType);
var storageTypes = {
  'localStorage': localStorage,
  'sessionStorage': sessionStorage
};
var defaultStorage = storageTypes[storage.storageType];
var setItem = defaultStorage.setItem.bind(defaultStorage);
var getItem = defaultStorage.getItem.bind(defaultStorage);
var removeItem = defaultStorage.removeItem.bind(defaultStorage);

/*
 * Check browser support for storage
 *
 * @param {String} storageType
 * @return {Boolean} support for storage
 * @api private
 */
function storageSupported(storageType) {
  try {
    return storageType in window && window[storageType] !== null;
  } catch(e) {
    return false;
  }
}

/*
 * Module's settings and public API.
 */

/*
 * Runs function asynchronously.
 * 
 * Usage:
 * > async(localStorage.setItem)
       .run('hello', 'world', function() {})
 * > var result = async(localStorage.getItem)
 *     .run('hello', function(value){console.log(result)});
 *
 * @param {Function} synchronous function
 * @return {Object} asyncFunc
 * @api private
 */
function async(func) {
  var NOTSTARTED = 0, PENDING = 1, SUCCESS = 2, FAIL = -1;
  var asyncFunc = {};
  asyncFunc.status = NOTSTARTED;
  asyncFunc.run = function doAsyncFunc() {
    var args = Array.prototype.slice.call(arguments);
    var callback = args.pop();
    asyncFunc.status = PENDING;
    // Pushes it to background with 0ms delay
    var funcToBackground = setTimeout(function() {
      try {
        var result = func.apply(this, args);
        asyncFunc.status = SUCCESS;
        asyncFunc.result = result;
      } catch(e) {
        asyncFunc.status = FAIL;
        asyncFunc.result = e;
      }
    }, 0);
    // Runs continuously checking for status of asyncFunc
    // Runs after-task attached at asyncFunc.done
    var asyncFuncChecker = setInterval(function() {
      var status = asyncFunc.status;
      if (status === SUCCESS || status === FAIL) {
        clearInterval(asyncFuncChecker);
        console.log('cleared');
        callback(asyncFunc.result);
      }
    }, 0);
    // Attached to returned asyncFunc.done
    return asyncFunc;
  };
  return asyncFunc;
}

/*
 * Goes through settings and make changes to module.
 *
 * @api private
 */
(function parseSettings() {
  // Bail if it doesn't work, no fallback
  if (!storage.works) { storage = undefined; }
})();

/*
 * For JSON serialization
 */
function isArray(obj) {
  return toString.call(obj) === '[object Array]';
}
function isObject(obj) {
  return toString.call(obj) === '[object Object]';
}

/*
 * Attempt to parse string for JSON.
 *
 * @return {Object || Array} if JSON
 * @return {Boolean} false, if JSON.parse fails
 * @api private
 */
function parseIfPossible(obj) {
  try {
    return JSON.parse(obj);
  } catch(e) {
    return obj;
  }
}

/*
 * Attempt to stringify JSON.
 *
 * @return {String} if serializable
 * @return {Object || Array} false, if JSON.stringify fails
 * @api private
 */
function stringifyIfPossible(obj) {
  try {
    return JSON.stringify(obj);
  } catch(e) {
    return obj;
  }
}

/*
 * Wrapper function for localStorage.setItem
 * which is asynchronous and deserializes to string.
 * Callback accepts no parameters.
 *
 * @param {String} key
 * @param {Object} value
 * @param {Function} clean up callback function
 * @return {Object} asyncFunc instance
 * @api public
 */
storage.set = function setStorage(key, value, callback) {
  value = stringifyIfPossible(value);
  async(setItem).run(key, value, function(){
    callback();
  });
};

/*
 * Wrapper function for localStorage.setItem
 * which just deserializes to string.
 *
 * @param {String} key
 * @param {Object} value
 * @api public
 */
storage.setSync = function(key, value) {
  defaultStorage.setItem(key, stringifyIfPossible(value));
};

/*
 * Iterates through keyValue Object and does storage.set.
 * Callback accepts no parameters.
 *
 * @param {Object} keyValue
 * @param {Function} clean up callback function
 * @api public
 */
storage.setMulti = function(keyValue, callback) {
  var keys = Object.keys(keyValue);
  var counter = 0;
  function incrementCounter() { counter++; }
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = keyValue[key];
    storage.set(key, value, incrementCounter);
  }
  var counterChecker = setInterval(function() {
    if (counter === keys.length) {
      clearInterval(counterChecker);
      callback();
    }
  }, 0);
};

/*
 * Wrapper function for localStorage.getItem
 * which is asynchronous and serializes to JSON.
 * Callback accepts value as parameter.
 *
 * @param {String} key
 * @param {Function} callback with value passed
 * @return {Object} asyncFunc instance
 * @api public
 */
storage.get = function getStorage(key, callback) {
  async(getItem).run(key, function(value) {
    callback(parseIfPossible(value));
  });
};

/*
 * Wrapper function for localStorage.setItem
 * which just deserializes to string.
 *
 * @param {String} key
 * @param {Object} value
 * @api public
 */
storage.getSync = function(key) {
  return parseIfPossible(defaultStorage.getItem(key));
};

/*
 * Iterates through keys and does storage.get.
 * Callback accepts array of values as parameter.
 *
 * @param {Array} keys
 * @param {Function} callback passed with array of values
 * @api public
 */
storage.getMulti = function getMultiStorage(keys, callback) {
  var values = [];
  function rememberValue(value) {
    values.push(value);
  }
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    storage.get(key, rememberValue);
  }
  // Continuously check for function completion
  var counterChecker = setInterval(function() {
    if (values.length === keys.length) {
      clearInterval(counterChecker);
      callback(values);
    }
  }, 0);
};

/*
 * Wrapper function for localStorage.removeItem
 * which is asynchronous.
 * Callback takes no parameters.
 *
 * @param {String} key
 * @param {Function} callback
 * @api public
 */
storage.remove = function removeStorage(key, callback) {
  async(removeItem).run(key, function() {
    callback();
  });
};

/*
 * Wrapper function for localStorage.removeItem
 * which is behaves exactly the same.
 *
 * @param {String} key
 * @api public
 */
storage.removeSync = function removeSyncStorage(key) {
  defaultStorage.removeItem(key);
};

/*
 * Iterates through keys and does storage.remove.
 * Callback accepts array of values as parameter.
 *
 * @param {Array} keys
 * @param {Function} callback
 * @api public
 */
storage.removeMulti = function removeMultiStorage(keys, callback) {
  var counter = 0;
  function incrementCounter() { counter++; }
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    storage.remove(key, incrementCounter);
  }
  var counterChecker = setInterval(function() {
    if (counter === keys.length) {
      clearInterval(counterChecker);
      callback();
    }
  });
};
