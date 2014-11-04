/*
 * Module's settings and public API.
 */
var storage = {
  storageType: 'localStorage',
  async: true,
  works: storageSupported()
};
var storageTypes = {
  'localStorage': localStorage,
  'sessionStorage': sessionStorage
};
var defaultStorage = storageTypes[storageType];

/*
 * Module's settings and public API.
 */
Function.prototype.async = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  setTimeout(this, 0, args);
};

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
 * Browser support for localStorage
 *
 * @return {Boolean} support for storage
 * @api private
 */
function storageSupported() {
  try {
    var storageType = storage.storageType;
    return storageType in window && window[storageType] !== null;
  }
  catch(e) {
    return false;
  }
}

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
  }
  catch(e) {
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
  }
  catch(e) {
    return obj;
  }
}

storage.set = function (key, value) {
  defaultStorage.setItem.async(key, stringifyIfPossible(value));
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

storage.get = function (key) {
  return parseIfPossible(defaultStorage.getItem.async(key));
};

storage.getSync = function (key) {
  return parseIfPossible(defaultStorage.getItem(key));
};
