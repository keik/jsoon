/* eslint strict: [0] */

'use strict';

module.exports = jsonq;

function jsonq (json) {
  if (this == null) {

    /* eslint new-cap: [0] */
    return new jsonq(json);
  }

  this._json = json;
  return this;
}

jsonq.fn = jsonq.prototype = {

  root: function () {
    return null;
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
    return null;
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
