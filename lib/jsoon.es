/**
 * https://github.com/keik/jsoon
 * @license MIT
 */

/* eslint strict: [0], no-loop-func: [0] */

const DEV = true;

let str = JSON.stringify;
let parse = JSON.parse;

exports = module.exports = jsoon;

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

let unchainableFns = {

  val: function () {
    if (this._current == null)
      return this._root;
    // console.log(idt(2), '#val', str(this._current));
    return _resolveAll.apply(this, [this._current]);
  }

};

// Merge unchainable prototype functions.
for (let key in unchainableFns) {
  if (unchainableFns.hasOwnProperty(key)) {
    jsoon.fn[key] = unchainableFns[key];
  }
}

let chainableFns = {

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
    this._current = _uniqPaths(paths);
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
