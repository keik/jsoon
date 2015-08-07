(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jsoon = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  this._current = null;
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
    if (this._current == null) return this._root;
    // console.log('  ', '#val', str(this._current));
    return _resolveAll.apply(this, [this._current]);
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
    this._current = null;
    return this;
  },

  /**
   * Get the parents of current item.
   * @return {jsoon} myself
   */
  parent: function parent() {
    var current = this._current;
    for (var i = 0, len = current.length; i < len; i++) {
      current[i].pop();
    }

    this._current = _uniqPaths(this._current);
    return this;
  },

  /**
   * Get the parents of current item.
   * @return {jsoon} myself
   */
  children: function children() {
    // TODO
    return null;
  },

  /**
   * @return {jsoon} myself
   */
  siblings: function siblings() {
    // TODO
    return null;
  },

  /**
   * Get the value of matched property at specified `key` recursively.
   * @param {String} key property name
   * @return {jsoon} myself
   */
  find: function find(key) {
    var _this = this;

    var keys = key.split(/,/),
        paths = [];

    var _loop = function _loop(i, len) {
      var key = keys[i].trim();

      _traverse(_this._root, /* tmp */function (k, v) {
        var acc = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

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
    };

    for (var i = 0, len = keys.length; i < len; i++) {
      _loop(i, len);
    }
    this._current = _uniqPaths(paths);
    return this;
  },

  /**
   * Filter children expect for specified index.
   * @param {number} i index
   * @return {jsoon} myself
   */
  eq: function eq(i) {
    this._current = [this._current[i]];
    return this;
  },

  /**
   * Alias of `.eq(0)`.
   * @return {jsoon} myself
   */
  first: function first() {
    return this.eq(0);
  },

  /**
   * Alias of `.eq(<last-child>)`.
   * @return {jsoon} myself
   */
  last: function last() {
    return this.eq(this._current.length - 1);
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

var _loop2 = function _loop2(key) {
  if (chainableFns.hasOwnProperty(key)) {
    jsoon.fn[key] = function () {

      // Chainable methods must not have side effect to myself
      // so create a new clone and return one.
      var cloned = jsoon();
      cloned._root = this._root;
      cloned._current = this._current;

      return chainableFns[key].apply(cloned, arguments);
    };
  }
};

for (var key in chainableFns) {
  _loop2(key);
}

/**
 * @private
 * @param {object} obj start point object to traverse
 * @param {function} fn callback
 * @param {*} acc accumulator
 * @return {undefined} no retruns
 */
function _traverse(obj, fn, acc) {
  console.log('  ', '#traverse', str(obj), str(acc));
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
 * @param {string} path path to access to value
 * @param {object} obj start point object to be accessed
 * @return {object} resolved value
 */
function _resolve(path, obj) {
  // console.log('    ', '#_resolve', path, str(obj));
  var p = path.shift();
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
function _resolveAll(paths) {
  // console.log('   ', '#_resolveAll', str(paths));
  var ret = [];
  for (var i = 0, len = paths.length; i < len; i++) {
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
function _uniqPaths(paths) {

  /* eslint no-labels: [0] */
  var ret = [];
  outer: for (var i = 0, I = paths.length; i < I; i++) {
    var t = paths[i];
    for (var j = 0, J = ret.length; j < J; j++) {
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
},{}]},{},[1])(1)
});