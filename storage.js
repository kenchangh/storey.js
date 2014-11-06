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
function async(func) {
  return (function() {
    var args = Array.prototype.slice.call(arguments);
    setTimeout(function(){
      return func.apply(this, args);
    }, 0);
  });
}
  
/*
 * My playground
 */
function add(x, y, callback) {
  function longFunction(callback) {
    setTimeout(function() {
      console.log('long task done');
    }, 3000);
  }
  var resultChecker = setInterval(function() {
    if (result) {
      clearInterval(resultChecker);
      callback('Result is ' + result);
    }
  });
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


storage.set = function(key, value, callback) {
  value = stringifyIfPossible(value);
  async(setItem)(key, value);
  var func_finished;
  var resultChecker = setInterval(function() {
    func_finished = localStorage[key];
    if (func_finished) {
      clearInterval(resultChecker);
      if (callback) callback();
    }
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
    empty_func = (function() {});
  for(keys, i, end; i < end; i++) {
    var key = keys[i], value = keyValue[key];
    storage.set(key, value, empty_func);
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

storage.getSync = function(key) {
  return parseIfPossible(defaultStorage.getItem(key));
};
