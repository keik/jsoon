/* global describe, it */
/* eslint strict: [0] */
var assert = require('chai').assert;

var jsonq = require('./../dist/jsonq');

describe('module', function () {
  it('exists', function () {
    assert.ok(jsonq);
  });
});
