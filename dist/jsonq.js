/* eslint strict: [0] */

'use strict';

module.exports = jsonq;

function jsonq(json) {
  if (this == null) {

    /* eslint new-cap: [0] */
    return new jsonq(json);
  }

  this._root = json;
  this._current = json;
  return this;
}

function traverse() {}

jsonq.fn = jsonq.prototype = {

  root: function root() {
    this._current = this._root;
    return this;
  },

  parent: function parent() {
    return null;
  },

  children: function children() {
    return null;
  },

  siblings: function siblings() {
    return null;
  },

  find: function find() {
    return null;
  },

  eq: function eq() {
    return null;
  },

  obj: function obj() {
    return this._current;
  },

  keys: function keys() {
    return null;
  },

  val: function val() {
    return null;
  },

  _dump: function _dump() {
    return this;
  }
};