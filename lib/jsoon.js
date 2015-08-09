/**
 * https://github.com/keik/jsoon
 * @license MIT
 */

/* eslint strict: [0], no-loop-func: [0] */

var DEV = true;

var str = JSON.stringify;
var parse = JSON.parse;

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
  this._paths = [];

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
    console.log('[#root] from', this._paths);
    this._paths = [];
    return this;
  },

  /**
   * Get the parents of current item.
   * @return {jsoon} myself
   */
  parent: function parent() {
    console.log('[#parent] of', str(this._paths));
    var current = this._paths;
    for (var i = 0, len = current.length; i < len; i++) {
      current[i].pop();
    }

    this._paths = _uniq(this._paths);
    return this;
  },

  /**
   * Get the parents of current item.
   * @param {string} key property name which used to filter
   * @return {jsoon} myself
   */
  children: function children(key) {
    console.log('[#children] of', str(this._paths), 'filtered by', key);
    var found = [];
    for (var i = 0, len = this._paths.length; i < len; i++) {

      // clone to preserve original
      var v = _resolve(this._paths[i], this);
      if (typeof v === 'object') {
        for (var k in v) {
          if (v.hasOwnProperty(k)) {
            var path = this._paths[i].join('@') + '@';
            // when `key` specified, filter property
            if (typeof key === 'string') {
              if (k === key) {
                // clone to preserve original
                path += k;
                found.push(path.split('@'));
              }
            } else {
              // clone to preserve original
              path += k;
              found.push(path.split('@'));
            }
            path += '@';
          }
        }
      }
    }
    this._paths = _uniq(found);
    return this;
  },

  /**
   * @return {jsoon} myself
   */
  siblings: function siblings() {
    console.log('[#siblings] of', str(this._paths));
    // TODO
    return null;
  },

  /**
   * Get the value of matched property at specified `key` recursively.
   * @param {string} key property name
   * @return {jsoon} myself
   */
  find: function find(key) {
    console.log('[#find] for', key, str(this._paths));
    var _self = this,
        currentPaths = parse(str(this._paths)),
        keys = key.split(/,/);

    this._paths = [];

    var _loop = function (i, len) {
      var key = keys[i].trim();

      _each(currentPaths, function (path) {
        console.log('   ', ' [#find] _each', 'path:', str(path));

        var obj = _resolve(path, _self),
            currentPath = parse(str(path));

        _traverse(obj, function (k, v, acc) {
          console.log('   ', ' [#_find] traversing', str(k), ':', str(v));

          // clone to preserve original
          acc = parse(str(acc));
          acc.push(k);
          if (k === key) {
            console.log('   ', '  [#_find] push', str(acc), 'to', str(_self._paths));
            _self._paths.push(acc);
          }
          return acc;
        }, currentPath);
      });
    };

    for (var i = 0, len = keys.length; i < len; i++) {
      _loop(i, len);
    }

    this._paths = _uniq(this._paths);
    // console.log('[#_find] $$$ paths', this._paths.reduce(function (acc, p) { return acc += '    ' + str(p) + '\n'; }, '\n'));

    return this;
  },

  /**
   * Filter children expect for specified index.
   * @param {number} i index
   * @return {jsoon} myself
   */
  eq: function eq(i) {
    console.log('[#eq]', i, 'of', str(this._paths));
    this._paths = [this._paths[i]];
    return this;
  },

  /**
   * Alias of `.eq(0)`.
   * @return {jsoon} myself
   */
  first: function first() {
    console.log('[#first]');
    return this.eq(0);
  },

  /**
   * Alias of `.eq(<last-child>)`.
   * @return {jsoon} myself
   */
  last: function last() {
    console.log('[#lst]');
    return this.eq(this._paths.length - 1);
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

var _loop2 = function (key) {
  if (chainableFns.hasOwnProperty(key)) {
    jsoon.fn[key] = function () {

      // Chainable methods must not have side effect to myself
      // so create a new clone and return one.
      var cloned = jsoon();
      cloned._root = this._root;
      cloned._paths = this._paths;

      return chainableFns[key].apply(cloned, arguments);
    };
  }
};

for (var key in chainableFns) {
  _loop2(key);
}

function _each(paths, fn) {
  console.log('   ', '(#_each)', 'for', str(paths));
  var len = paths.length;
  if (!len) {
    return fn(paths);
  }

  var ret = [];
  for (var i = 0; i < len; i++) {
    fn(paths[i]);
  }
  return ret;
}

/**
 * @private
 * @param {object} obj start point object to traverse
 * @param {function} fn callback
 * @param {*} acc accumulator
 * @return {undefined} no retruns
 */
function _traverse(obj, fn, acc) {
  console.log('   ', '(#_traverse)', 'to', str(obj), 'with', str(acc));
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      var v = obj[k];
      var ret = fn(k, v, acc);
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
  console.log('   ', '(#_resolve)', str(path));
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
  console.log('   ', '(#_resolveAll)', str(paths));
  var len = paths.length;
  if (!len) return ctx._root;

  var ret = [];
  for (var i = 0, _len = paths.length; i < _len; i++) {
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
  console.log('   ', '(#_uniq)', 'with', str(array));
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

if (DEV) {
  jsoon._resolve = _resolve;
  jsoon._resolveAll = _resolveAll;
  jsoon._uniq = _uniq;
}