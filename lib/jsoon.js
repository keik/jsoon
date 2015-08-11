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