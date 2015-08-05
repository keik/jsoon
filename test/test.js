/* global describe, it */
/* eslint strict: [0] */

var assert = require('chai').assert;

var jsonq = require('./../dist/jsonq');

describe('module', function () {
  it('exists', function () {
    assert.ok(jsonq);
  });
});

describe('methods', function () {

  it('are exported', function () {
    var $_ = jsonq({});

    assert.typeOf($_.root,     'function');
    assert.typeOf($_.parent,   'function');
    assert.typeOf($_.children, 'function');
    assert.typeOf($_.siblings, 'function');
    assert.typeOf($_.find,     'function');
    assert.typeOf($_.eq,       'function');
    assert.typeOf($_.obj,      'function');
    assert.typeOf($_.keys,     'function');
    assert.typeOf($_.val,      'function');
  });
});

describe('`root` method', function () {

  it('returns root item', function () {
    var item = {a: 1};
    jsonq(item);

    // TODO
    assert.fail();
  });
});

describe('`obj` method', function () {

  it('returns object', function () {
    var item = {a: 1};
    jsonq(item);

    // TODO
    assert.fail();
  });
});

describe('`keys` method', function () {

  it('returns keys', function () {
    var item = {a: 1};
    jsonq(item);

    // TODO
    assert.fail();
  });
});

describe('`val` method', function () {

  it('returns values', function () {
    var item = {a: 1};
    jsonq(item);

    // TODO
    assert.fail();
  });
});

describe('`find` method return', function () {

  it('returns spedified items', function () {
    var item = {a: 1};
    jsonq(item);

    // TODO
    assert.fail();
  });
});
