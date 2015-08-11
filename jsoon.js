(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jsoon = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * https://github.com/keik/jsoon
 * @license MIT
 */

/* eslint strict: [0], no-loop-func: [0] */

var str = JSON.stringify,
    parse = JSON.parse;

var debug = require('debug')('jsoon');

this.module = this.module || {}; // DEV
exports = module.exports = jsoon;

/**
 * Return `jsoon` object which has several methods to query / manipulate / traverse.
 * @param {object|string} json target object to play with
 * @return {jsoon} `jsoon` object which has several methods
 */
function jsoon(json) {
  if (!(this instanceof jsoon)) {

    /* eslint new-cap: [0] */
    return new jsoon(json);
  }

  this._root = json;
  this._paths = [[]];

  // to be array-like
  this.length = 0;
  this.push = this._paths.push;
  this.pop = this._paths.pop;
  this.sort = this._paths.sort;
  this.splice = this._paths.splice;

  var ret = _resolveAll(this._paths, this),
      len = ret.length;

  this.length = len;

  for (var i = 0; i < len; i++) {
    this[i] = ret[i];
  }

  return this;
}

jsoon.fn = jsoon.prototype;

/**
 * Unchainable functions, which is not able to chain methods.
 */
var unchainableFns = {

  /**
   * Return value matched by the jsoon object.
   * @return {*} value
   */
  val: function val() {
    return _resolveAll(this._paths, this);
  }

};

// Merge unchainable prototype functions.
for (var key in unchainableFns) {
  if (unchainableFns.hasOwnProperty(key)) {
    jsoon.fn[key] = unchainableFns[key];
  }
}

/**
 * Chainable functions, which is able to chain methods by returning myself.
 */
var chainableFns = {

  /**
   * Get the root object.
   * @return {jsoon} myself
   */
  root: function root() {
    debug('[#root] from', this._paths);
    return [[]];
  },

  /**
   * Get the parents of current item.
   * @return {jsoon} myself
   */
  parent: function parent() {
    debug('[#parent] of', str(this._paths));

    // clone paths to preserve original
    var ret = parse(str(this._paths));

    for (var i = 0, len = ret.length; i < len; i++) {
      ret[i].pop();
    }

    return ret;
  },

  /**
   * Get the parents of current item.
   * @param {string} key property name which used to filter
   * @return {jsoon} myself
   */
  children: function children() {
    var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var acc = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    debug('[#children] of', str(this._paths), 'filtered by', key);

    var keys = undefined,
        kobj = undefined;

    switch (typeof key) {
      case 'object':
        kobj = key;
        break;
      default:
        key = String(key);
        key = key.trim();
        keys = key.split(',');
        break;
    }

    var ret = acc,
        _self = this,
        currentPaths = parse(str(this._paths));

    if (kobj || keys.length === 1) {

      _each(currentPaths, function (path) {
        var v = _resolve(path, _self);

        if (typeof v === 'object') {
          for (var k in v) {
            if (v.hasOwnProperty(k)) {
              // clone to preserve original
              var currentPath = parse(str(path));

              // when `key` specified, filter property
              if (key.length > 0 && k === key || key.length === 0) {
                // add retrieve path
                currentPath.push(k);
                // add results
                ret.push(currentPath);
              }
            }
          }
        }
      });
    } else {
      for (var i = 0, len = keys.length; i < len; i++) {
        this.find(keys[i], acc);
      }
    }

    return ret;
  },

  /**
   * @return {jsoon} myself
   */
  siblings: function siblings() {
    debug('[#siblings] of', str(this._paths));
    // TODO
    return null;
  },

  /**
   * Get the value of matched property at specified `key` recursively.
   * @param {string|object} key property name, or object
   * @return {jsoon} myself
   */
  find: function find() {
    var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var acc = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

    debug('[#find] for', key, str(this._paths));

    var keys = undefined,
        kobj = undefined;

    switch (typeof key) {
      case 'object':
        kobj = key;
        break;
      default:
        key = String(key);
        key = key.trim();
        keys = key.split(',');
        break;
    }

    var ret = acc,
        _self = this,
        currentPaths = parse(str(this._paths));

    if (kobj || keys.length === 1) {

      _each(currentPaths, function (path) {
        var v = _resolve(path, _self),
            currentPath = parse(str(path));

        _traverse(v, function (k, v, acc) {
          // clone to preserve original
          acc = parse(str(acc));
          // add retrieve path
          acc.push(k);

          if (v === kobj || k === key) {
            // add results
            ret.push(acc);
          }
          return acc;
        }, currentPath);
      });
    } else {
      for (var i = 0, len = keys.length; i < len; i++) {
        this.find(keys[i], acc);
      }
    }

    return ret;
  },

  /**
   * Filter children expect for specified index.
   * @param {number} i index
   * @return {jsoon} myself
   */
  eq: function eq(i) {
    debug('[#eq]', i, 'of', str(this._paths));
    return [this._paths[i]];
  },

  /**
   * Alias of `.eq(0)`.
   * @return {jsoon} myself
   */
  first: function first() {
    debug('[#first]');
    return [this._paths[0]];
  },

  /**
   * Alias of `.eq(<last-child>)`.
   * @return {jsoon} myself
   */
  last: function last() {
    debug('[#lst]');
    return [this._paths[this._paths.length - 1]];
  },

  /**
   * @return {jsoon} myself
   */
  keys: function keys() {
    // TODO
    return null;
  }

};

// Merge chainable prototype functions.

var _loop = function (key) {
  if (chainableFns.hasOwnProperty(key)) {
    jsoon.fn[key] = function () {

      var paths = _uniq(chainableFns[key].apply(this, arguments)),
          resolved = _resolveAll(paths, this),
          len = resolved.length;

      // Chainable methods must not have side effect to myself
      // so create a new clone and return one.
      var ret = jsoon(this._root);
      ret._paths = paths;
      ret.length = len;

      for (var i = 0; i < len; i++) {
        ret[i] = resolved[i];
      }

      return ret;
    };
  }
};

for (var key in chainableFns) {
  _loop(key);
}

function _each(paths, fn) {
  debug('   ', '(#_each)', 'for', str(paths));

  for (var i = 0, len = paths.length; i < len; i++) {
    fn(paths[i]);
  }
}

/**
 * @private
 * @param {object} obj start point object to traverse
 * @param {function} fn callback
 * @param {*} acc accumulator
 * @return {undefined} no retruns
 */
function _traverse(obj, fn, acc) {
  debug('   ', '(#_traverse)', 'to', str(obj), 'with', str(acc));
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      var v = obj[k],
          ret = fn(k, v, acc);

      if (typeof v === 'object') {
        _traverse(v, fn, ret);
      }
    }
  }
}

/**
 * Return value in `obj`, which resolved through `path`.
 * @private
 * @param {array.<string>} path path to access to value
 * @param {jsoon} ctx context jsoon object
 * @return {object} resolved value
 */
function _resolve(path, ctx) {
  debug('   ', '(#_resolve)', str(path));
  var ret = ctx._root;

  for (var i = 0, len = path.length; i < len; i++) {
    ret = ret[path[i]];
  }
  return ret;
}

/**
 * Shim for `paths.map(_resolve)`.
 * @private
 * @param {array.<string>} paths collection of paths
 * @param {jsoon} ctx context jsoon object
 * @return {object} no retruns
 */
function _resolveAll(paths, ctx) {
  debug('   ', '(#_resolveAll)', str(paths));

  var len = paths.length,
      ret = [];

  for (var i = 0; i < len; i++) {
    ret.push(_resolve(paths[i], ctx));
  }
  return ret;
}

/**
 * Return duplicate-free array with deeply comparison.
 * (different objects which has same properties are dealt with same object)
 * @private
 * @param {array} array array of paths
 * @returns {array} duplicate-freed array
 */
function _uniq(array) {
  debug('   ', '(#_uniq)', 'with', str(array));
  var ret = [];

  for (var i = 0, I = array.length; i < I; i++) {
    var exist = false;
    var item = array[i];

    var sitem = str(item);
    for (var j = 0, J = ret.length; j < J; j++) {
      if (sitem === str(ret[j])) {
        exist = true;
        break;
      }
    }
    if (!exist) ret.push(item);
  }

  return ret;
}

// export internal function for debug (will be removed in the future)
jsoon._resolve = _resolve;
jsoon._resolveAll = _resolveAll;
jsoon._uniq = _uniq;
},{"debug":2}],2:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":3}],3:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":4}],4:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}]},{},[1])(1)
});