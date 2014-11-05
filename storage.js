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
Function.prototype.async = function () {
  var args = Array.prototype.slice.call(arguments);
  var func = this;  // to preserve the instance
  setTimeout(function(){ func.apply(this, args); }, 0);
};

function add(x, y, callback) {
  setTimeout(function () {
    console.log('result: ' + (x+y));
    callback('in timeout');
  }, 2000);
  callback('out of timeout');
}

function print(text) { console.log(text); }

for (var i = 0; i < 5; i++) {
  add.async(5, 6, print);
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

storage.set = function (key, value) {
  defaultStorage.setItem.async(key, stringifyIfPossible(value));
  //callback();
};

storage.setSync = function (key, value) {
  defaultStorage.setItem(key, stringifyIfPossible(value));
};

storage.setMulti = function (keyValue) {
  for (var key in keyValue) {
    var value = keyValue[key];
    storage.set(key, value);
  }
};

storage.get = function (key, callback) {
  var value = parseIfPossible(defaultStorage.getItem.async(key));
  callback(value);
};

storage.getSync = function (key) {
  return parseIfPossible(defaultStorage.getItem(key));
};
