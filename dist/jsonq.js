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