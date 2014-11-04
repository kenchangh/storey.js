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
 * Goes through settings and make changes to module.
 *
 * @api private
 */
(function parseSettings() {
  // Bail if it doesn't work, no fallback
  if (!storage.works) { storage = undefined; }

  // Asynchronous settings
  if (storage.async) {
    Function.prototype.async = function() {
      setTimeout(this, 0, arguments);
    };
  }
  // Module's function is async be default
  // This masks 'async' as a normal function call
  else {
    Function.prototype.async = function() {
      this.apply(this, arguments);
    };
  }
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
    return false;
  }
}

/*
 * Attempt to stringify JSON.
 *
 * @return {String} if serializable
 * @return {Boolean} false, if JSON.stringify fails
 * @api private
 */
function stringifyIfPossible(obj) {
  try {
    return JSON.stringify(obj);
  }
  catch(e) {
    return false;
  }
}

storage.set = function (key, value) {
  var stringifiedValue = stringifyIfPossible(value);
  value = stringifiedValue ? stringifiedValue : value;
  defaultStorage.set.async(key, value);
};

storage.get = function (key, value) {
  var parsedValue = parseIfPossible(value);
  value = parsedValue ? parsedValue : value;
  defaultStorage.set.async(key, value);
};
