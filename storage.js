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
var getItem = defaultStorage.getItem.bind(udefaultStorage);

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
  var result;
  setTimeout(function() {
    console.log('async task done');
    result = x + y;
  }, 3000);
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
      console.log(func_finished);
      clearInterval(resultChecker);
      callback();
    }
  });
};

storage.setSync = function(key, value) {
  defaultStorage.setItem(key, stringifyIfPossible(value));
};

storage.setMulti = function(keyValue) {
  for (var key in keyValue) {
    var value = keyValue[key];
    storage.set(key, value);
  }
};

storage.get = function(key, callback) {
  var value = parseIfPossible(async(getItem)(key));
  callback(value);
};

storage.getSync = function(key) {
  return parseIfPossible(defaultStorage.getItem(key));
};
