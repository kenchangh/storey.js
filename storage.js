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
    var callback = args.splice(args.length-1, 1);
    console.log(callback.toString());
    asyncFunc.status = PENDING;
    // Pushes it to background with 0ms delay
    setTimeout(function() {
      try {
        var result = func.apply(this, args);
        asyncFunc.status = SUCCESS;
        asyncFunc.result = result;
      } catch(e) {
        asyncFunc.status = FAIL;
        asyncFunc.error = e;
      }
    }, 0);
    // Runs continuously checking for status of asyncFunc
    // Runs after-task attached at asyncFunc.done
    var asyncFuncChecker = setInterval(function() {
      var status = asyncFunc.status;
      if (status === SUCCESS || s === -1) {
        clearInterval(asyncFuncChecker);
        console.log('cleared');
        asyncFunc = asyncFunc.result;
        callback();
      }
    }, 0);
    // Attached to returned asyncFunc.done
    return asyncFunc;
  };
  return asyncFunc;
}
function runCmd(cmd, args, callBack ) {
  var spawn = require('child_process').spawn;
  var child = spawn(cmd, args);
  var resp = "";
  child.stdout.on('data', function (buffer) { resp += buffer.toString(); });
  child.stdout.on('end', function() { callBack(resp); });
}

function curlMultiple() {
  var site = 'https://github.com/';
  function print(text) { console.log(text); }
  for (var i = 0; i < 100; i++) {
    runCmd('curl ' + site, [], print);
  }
}

/*
 * My playground
 */
function add(x, y) {
  setTimeout(function() {
    console.log('result: ' + (x+y));
  }, 3000);
}

function print(text) { console.log(text); }

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
  var s = async(setItem).run(key, value, function(){
    callback();
  });
};

storage.setSync = function(key, value) {
  defaultStorage.setItem(key, stringifyIfPossible(value));
};

storage.setMulti = function(keyValue, callback) {
  var totalResults = 0;
  function checkResult(key) {
    var setFinished;
    var resultChecker = setInterval(function() {
      setFinished = localStorage[key];
      if (setFinished) {
        clearInterval(resultChecker);
        totalResults++;
      }
    });
  }

  var keys = Object.keys(keyValue),
    i = 0,
    end = keys.length,
    size = objectSize(keyValue),
    emptyFunc = (function() {});
  for(keys, i, end; i < end; i++) {
    var key = keys[i], value = keyValue[key];
    storage.set(key, value, emptyFunc);
    checkResult(key);
  }

  var allResultChecker = setInterval(function() {
    if (totalResults === keys.length-1) {
      clearInterval(allResultChecker);
      callback();
    }
  });
};

storage.get = function(key, callback) {
  var value;
  function _getItem(key) {
    value = getItem(key);
  }
  parseIfPossible(async(_getItem)(key));
  var resultChecker = setInterval(function() {
    if (value) {
      clearInterval(resultChecker);
      callback(value);
    }
  });
};

storage.getMulti = function(keys, callback) {
  var emptyFunc = (function(){});
  for (var i = 0; i < keys.length; i++) {
    
  }
};

storage.getSync = function(key) {
  return parseIfPossible(defaultStorage.getItem(key));
};
