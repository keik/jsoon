/* eslint strict: [0] */

'use strict';

module.exports = jsonq;

function jsonq (json) {
  if (this == null) {

    /* eslint new-cap: [0] */
    return new jsonq(json);
  }

  this._root = json;
  this._current = json;
  return this;
}

function traverse () {
}

jsonq.fn = jsonq.prototype = {

  root: function () {
    this._current = this._root;
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

  find: function () {
    return null;
  },

  eq: function () {
    return null;
  },

  obj: function () {
    return this._current;
  },

  keys: function () {
    return null;
  },

  val: function () {
    return null;
  },

  _dump: function () {
    return this;
  }
};
