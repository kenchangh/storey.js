/*
 * Some monkey patching and utility functions.
 */
function objectSize(obj) {
  var size = 0, key;
  for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}

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
       .run('hello', 'world')
       .done(function() { console.log('Item set!') });
 * > var result = async(localStorage.getItem)
 *     .run('hello').result;
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

storage.set = function setStorage(key, value, callback) {
  value = stringifyIfPossible(value);
  async(setItem).run(key, value, function(){
    callback();
  });
};

storage.setSync = function(key, value) {
  defaultStorage.setItem(key, stringifyIfPossible(value));
};

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

storage.get = function getStorage(key, callback) {
  async(getItem).run(key, function(value) {
    callback(parseIfPossible(value));
  });
};

storage.getSync = function(key) {
  return parseIfPossible(defaultStorage.getItem(key));
};

storage.getMulti = function getMultiStorage(keys, callback) {
  var values = [];
  function rememberValue(value) {
    values.push(value);
  }
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    storage.get(key, rememberValue);
  }
  var counterChecker = setInterval(function() {
    if (values.length === keys.length) {
      clearInterval(counterChecker);
      callback(values);
    }
  }, 0);
};
