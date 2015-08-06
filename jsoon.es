/* eslint strict: [0] */

'use strict';

const DEV = true;

var str = JSON.stringify;
var parse = JSON.parse;

module.exports = jsoon;

function jsoon (json) {
  if (this == null) {

    /* eslint new-cap: [0] */
    return new jsoon(json);
  }

  this._root = json;
  this._current = null;
  return this;
}

jsoon.fn = jsoon.prototype = {

  root: function () {
    this._current = null;
    return this;
  },

  parent: function () {
    let current = this._current;
    for (let i = 0, len = current.length; i < len; i++) {
      current[i].pop();
    }
    return this;
  },

  children: function () {
    return null;
  },

  siblings: function () {
    return null;
  },

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
    console.log(paths, _uniq(paths));
    this._current = _uniq(paths);
    return this;
  },

  eq: function (i) {
    this._current = [this._current[i]];
    return this;
  },

  first: function () {
    return this.eq(0);
  },

  last: function () {
    return this.eq(this._current.length - 1);
  },

  keys: function () {
    return null;
  },

  val: function () {
    if (this._current == null)
      return this._root;
    // console.log(idt(2), '#val', str(this._current));
    return _resolveAll.apply(this, [this._current]);
  }

};

function _traverse (obj, fn, acc) {
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

function _resolve (path, obj) {
  // console.log(idt(1 + 2), '#_resolve', path, str(obj));
  let p =  path.shift();
  if (p == null) {
    return obj;
  }
  return _resolve.bind(this)(path, obj[p]);
}

function _resolveAll (paths) {
  // console.log(idt(1 + 2), '#_resolveAll', str(paths));
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
 * @param {Array} array source array
 * @returns {Array} duplicate-freed array
 */
function _uniq (array) {
  let ret = [];
  for (let i = 0, len = array.length; i < len; i++) {
    let t = array[i];
    if (ret.indexOf(t) === -1) {
      ret.push(t);
    }
  }
  return ret;
}


if (DEV) {
  jsoon._resolve = _resolve;
  jsoon._resolveAll = _resolveAll;
  jsoon._uniq = _uniq;
}
