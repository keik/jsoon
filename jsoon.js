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

var unchainableFns = {
  val: function val() {
    if (this._current == null) return this._root;
    // console.log(idt(2), '#val', str(this._current));
    return _resolveAll.apply(this, [this._current]);
  }
};

// Merge chainable prototype functions.
for (var key in unchainableFns) {
  if (unchainableFns.hasOwnProperty(key)) {
    jsoon.fn[key] = unchainableFns[key];
  }
}

var chainableFns = {

  root: function root() {
    this._current = null;
    return this;
  },

  parent: function parent() {
    var current = this._current;
    for (var i = 0, len = current.length; i < len; i++) {
      current[i].pop();
    }
    return this;
  },

  children: function children() {
    return null;
  },

  siblings: function siblings() {
    return null;
  },

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

  eq: function eq(i) {
    this._current = [this._current[i]];
    return this;
  },

  first: function first() {
    return this.eq(0);
  },

  last: function last() {
    return this.eq(this._current.length - 1);
  },

  keys: function keys() {
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

function _traverse(obj, fn, acc) {
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

function _resolve(path, obj) {
  // console.log(idt(1 + 2), '#_resolve', path, str(obj));
  var p = path.shift();
  if (p == null) {
    return obj;
  }
  return _resolve.bind(this)(path, obj[p]);
}

function _resolveAll(paths) {
  // console.log(idt(1 + 2), '#_resolveAll', str(paths));
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