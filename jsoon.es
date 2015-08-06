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
    return null;
  },

  children: function () {
    return null;
  },

  siblings: function () {
    return null;
  },

  find: function (key) {
    let path = [];
    _traverse(this._root/* tmp */, function (k, v, acc = []) {
      acc = parse(str(acc));
      if (typeof v === 'object') {
        acc.push(k);
      }
      if (k === key) {
        acc.push(k);
        path.push(parse(str(acc)));
        acc = [];
      }
      return acc;
    });

    this._current = path;
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

if (DEV) {
  jsoon._resolve = _resolve;
  jsoon._resolveAll = _resolveAll;
}
