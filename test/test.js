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
    var $$item = jsonq({a: 1});

    assert.typeOf($$item.root,     'function');
    assert.typeOf($$item.parent,   'function');
    assert.typeOf($$item.children, 'function');
    assert.typeOf($$item.siblings, 'function');
    assert.typeOf($$item.find,     'function');
    assert.typeOf($$item.eq,       'function');
    assert.typeOf($$item.obj,      'function');
    assert.typeOf($$item.keys,     'function');
    assert.typeOf($$item.val,      'function');
  });
});

describe('`obj` method', function () {
  describe('returns current object', function () {
    it('when item is blank array', function () {
      var item = [],
          $$item = jsonq(item);

      assert.equal($$item.obj(), item);
    });
    it('when item is blank object', function () {
      var item = {},
          $$item = jsonq(item);

      assert.equal($$item.obj(), item);
    });
    it('when item is object which have one property', function () {
      var item = {a: 1},
          $$item = jsonq(item);

      assert.equal($$item.obj(), item);
    });
    it('when item is array which have two objects', function () {
      var item = [{a: 1}, {b: 2}],
          $$item = jsonq(item);

      assert.equal($$item.obj(), item);
    });
  });
});

describe('`root` method', function () {
  describe('returns root item', function () {
    it('when item is blank array', function () {
      var item = [],
          $$item = jsonq(item);

      assert.equal($$item.root().obj(), item);
    });
    it('when item is blank object', function () {
      var item = {},
          $$item = jsonq(item);

      assert.equal($$item.root().obj(), item);
    });
    it('when item is object which have one property', function () {
      var item = {a: 1},
          $$item = jsonq(item);

      assert.equal($$item.root().obj(), item);
    });
    it('when item is array which have two objects', function () {
      var item = [{a: 1}, {b: 2}],
          $$item = jsonq(item);

      assert.equal($$item.root().obj(), item);
    });
  });
});

describe('`find` method', function () {
  describe('returns descendants of each object in current', function () {
    it('filterd by `key` from a object', function () {
      var item = {a: 1, b: 2},
          $$item = jsonq(item);

      assert.equal($$item.find({key: 'x'}).obj(), []);
      assert.equal($$item.find({key: 'a'}).obj(), []);
    });
    it('filtered by `key` from same depth', function () {
      var item = [{a: 1}, {b: 2}, {c: 3}],
          $$item = jsonq(item);

      assert.equal($$item.find({key: 'x'}).obj(), []);
      assert.equal($$item.find({key: 'a'}).obj(), []);
    });
    it('filterd by `key` from nested', function () {
      var item = {a: 1, b: {c: 1, d: {e: 1}}},
          $$item = jsonq(item);

      assert.equal($$item.find({key: 'x'}).obj(), []);
      assert.equal($$item.find({key: 'a'}).obj(), []);
      assert.equal($$item.find({key: 'b'}).obj(), []);
      assert.equal($$item.find({key: 'c'}).obj(), []);
      assert.equal($$item.find({key: 'd'}).obj(), [item.b.d]);
    });
  });
});

describe('`siblings` method', function () {
  describe('returns siblings of each object in current', function () {
    it('x', function () {
      var item = {a: 1},
          $$item = jsonq(item);

      assert.equal($$item.find(item).siblings().obj(), null);
    });
    it('x', function () {
      var item = {a: 1, b: 1},
          $$item = jsonq(item);

      assert.equal($$item.find(item).siblings().obj(), null);
    });
    it('x', function () {
      var item = {a: 1, b: 1, c: [{d: 1}]},
          $$item = jsonq(item);

      assert.equal($$item.find(item).siblings().obj(), null);
    });
    it('x', function () {
      var item = [{a: 1}, {b: 1}],
          $$item = jsonq(item);

      assert.equal($$item.find(item[0]).siblings().obj(), [item[1]]);
    });
    it('x', function () {
      var item = [{a: 1}, {b: 1}, {c: 1}, {d: 1}],
          $$item = jsonq(item);

      assert.equal($$item.find(item[0]).siblings().obj(), [item[1], item[2], item[3]]);
    });
    it('x', function () {
      var item = [{a: 1}, {b: [{c: 1}, {d: 1}]}],
          $$item = jsonq(item);

      assert.equal($$item.find(item[0]).siblings().obj(), [item[1]]);
    });
  });
});
