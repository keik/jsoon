/**
 * https://github.com/keik/jsoon
 * @license MIT
 */

/* eslint strict: [0], no-loop-func: [0] */

const DEV = true;

let str = JSON.stringify;
let parse = JSON.parse;

exports = module.exports = jsoon;

/**
 * Return `jsoon` object which has several methods to query / manipulate / traverse.
 * @param {object|string} json target object to play with
 * @return {jsoon} `jsoon` object which has several methods
 */
function jsoon (json) {
  if (!(this instanceof jsoon)) {

    /* eslint new-cap: [0] */
    return new jsoon(json);
  }

  this._root = json;
  this._current = null;
  return this;
}

jsoon.fn = jsoon.prototype;

/**
 * Unchainable functions, which is not able to chain methods.
 */
let unchainableFns = {

  /**
   * Return value matched by the jsoon object.
   * @return {*} value
   */
  val: function () {
    if (this._current == null)
      return this._root;
    // console.log('  ', '#val', str(this._current));
    return _resolveAll.apply(this, [this._current]);
  }

};

// Merge unchainable prototype functions.
for (let key in unchainableFns) {
  if (unchainableFns.hasOwnProperty(key)) {
    jsoon.fn[key] = unchainableFns[key];
  }
}

/**
 * Chainable functions, which is able to chain methods by returning myself.
 */
let chainableFns = {

  /**
   * Get the root object.
   * @return {jsoon} myself
   */
  root: function () {
    this._current = null;
    return this;
  },

  /**
   * Get the parents of current item.
   * @return {jsoon} myself
   */
  parent: function () {
    let current = this._current;
    for (let i = 0, len = current.length; i < len; i++) {
      current[i].pop();
    }

    this._current = _uniqPaths(this._current);
    return this;
  },

  /**
   * Get the parents of current item.
   * @return {jsoon} myself
   */
  children: function () {
    // TODO
    return null;
  },

  /**
   * @return {jsoon} myself
   */
  siblings: function () {
    // TODO
    return null;
  },

  /**
   * Get the value of matched property at specified `key` recursively.
   * @param {String} key property name
   * @return {jsoon} myself
   */
  find: function (key) {
    let keys = key.split(/,/),
        paths = [];

    for (let i = 0, len = keys.length; i < len; i++)  {
      let key = keys[i].trim();

      _traverse(this._root/* tmp */, function (k, v, acc = []) {
        acc = parse(str(acc));
        if (typeof v === 'object') {
          acc.push(k);
        }
        if (k === key) {
          acc.push(k);
          paths.push(parse(str(acc)));
          acc = [];
        }
        return acc;
      });
    }
    this._current = _uniqPaths(paths);
    return this;
  },

  /**
   * Filter children expect for specified index.
   * @param {number} i index
   * @return {jsoon} myself
   */
  eq: function (i) {
    this._current = [this._current[i]];
    return this;
  },

  /**
   * Alias of `.eq(0)`.
   * @return {jsoon} myself
   */
  first: function () {
    return this.eq(0);
  },

  /**
   * Alias of `.eq(<last-child>)`.
   * @return {jsoon} myself
   */
  last: function () {
    return this.eq(this._current.length - 1);
  },

  /**
   * @return {jsoon} myself
   */
  keys: function () {
    // TODO
    return null;
  }

};

// Merge chainable prototype functions.
for (let key in chainableFns) {
  if (chainableFns.hasOwnProperty(key)) {
    jsoon.fn[key] = function () {

      // Chainable methods must not have side effect to myself
      // so create a new clone and return one.
      let cloned = jsoon();
      cloned._root = this._root;
      cloned._current = this._current;

      return chainableFns[key].apply(cloned, arguments);
    };
  }
}

/**
 * @private
 * @param {object} obj start point object to traverse
 * @param {function} fn callback
 * @param {*} acc accumulator
 * @return {undefined} no retruns
 */
function _traverse (obj, fn, acc) {
  console.log('  ', '#traverse', str(obj), str(acc));
  for (let k in obj) {
    if (obj.hasOwnProperty(k)) {
      let v = obj[k];
      let ret = fn(k, v, acc);
      if (typeof v === 'object') {
        _traverse(v, fn, ret);
      }
    }
  }
}

/**
 * Return value in `obj`, which resolved through `path`.
 * @private
 * @param {string} path path to access to value
 * @param {object} obj start point object to be accessed
 * @return {object} resolved value
 */
function _resolve (path, obj) {
  // console.log('    ', '#_resolve', path, str(obj));
  let p = path.shift();
  if (p == null) {
    return obj;
  }
  return _resolve.bind(this)(path, obj[p]);
}

/**
 * Shim for `paths.map(_resolve)`.
 * @private
 * @param {array.<string>} paths collection of paths
 * @return {object} no retruns
 */
function _resolveAll (paths) {
  // console.log('   ', '#_resolveAll', str(paths));
  let ret = [];
  for (let i = 0, len = paths.length; i < len; i++) {
    ret.push(_resolve(paths[i], this._root));
  }
  return ret;
}

/**
 * Return duplicate-free array.
 * (different objects which has same properties are dealt with NOT same object)
 * @private
 * @param {Array} paths array of paths
 * @returns {Array} duplicate-freed array
 */
function _uniqPaths (paths) {

  /* eslint no-labels: [0] */
  let ret = [];
  outer:
  for (let i = 0, I = paths.length; i < I; i++) {
    let t = paths[i];
    for (let j = 0, J = ret.length; j < J; j++) {
      if (ret[j].join() === t.join()) {
        break outer;
      }
    }
    ret.push(t);
  }
  return ret;
}

if (DEV) {
  jsoon._resolve = _resolve;
  jsoon._resolveAll = _resolveAll;
  jsoon._uniqPaths = _uniqPaths;
}
