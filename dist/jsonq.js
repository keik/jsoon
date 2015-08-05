/* eslint strict: [0] */

'use strict';

module.exports = jsonq;

function jsonq(json) {
  if (this == null) {

    /* eslint new-cap: [0] */
    return new jsonq(json);
  }

  this._json = json;
  return this;
}

jsonq.fn = jsonq.prototype = {

  root: function root() {
    return null;
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
    return null;
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