/* global describe, it */
/* eslint strict: [0] */

var assert = require('chai').assert;

var jsoon = require('./../dist/jsoon');

var str = JSON.stringify;
var parse = JSON.parse;

var obj = [
  {
    name: 'Alice',
    age: 40,
    gender: 'female',
    children: [
      {
        name: 'Bob',
        age: 15,
        gender: 'male'
      }, {
        name: 'Carol',
        age: 14,
        gender: 'female'
      }
    ]
  }, {
    name: 'Dave',
    age: 65,
    gender: 'male',
    children: [
      {
        name: 'Elen',
        age: 40,
        gender: 'female',
        children: [
          {
            name: 'Fred',
            age: 12,
            gender: 'male'
          }
        ]
      }, {
        name: 'Greg',
        age: 35,
        gender: 'male'
      }
    ]
  }
];

describe('module', function () {
  it('exists', function () {
    assert.ok(jsoon);
  });
});

describe('methods', function () {
  var $$obj = jsoon({});

  var methods = [
    'root',
    'parent',
    'children',
    'siblings',
    'find',
    'eq',
    'keys',
    'val'
  ];

  for (var i = 0, len = methods.length; i < len; i++) {
    it('`' + methods[i] + '` are exported', (function (method) {
      return function () {
        assert.typeOf($$obj[method], 'function');
      };
    }(methods[i])));
  }
});

describe('`val` method', function () {
  describe('returns current value', function () {
    var $$obj = jsoon(obj);

    assert.equal($$obj.val(), obj);
  });
});

describe('`root` method', function () {
  it('returns root obj', function () {
    var $$obj = jsoon(obj);

    assert.equal($$obj.root().val(), obj);
  });
});

describe('`find` method', function () {
  describe('returns descendants of each object in current filtered by `key', function () {
    it('when JSON object has no nested / two properties', function () {
      var $$obj = jsoon(obj);

      assert.sameDeepMembers(
        $$obj.find('name')._current,
        [['0', 'name'],
         ['0', 'children', '0', 'name'],
         ['0', 'children', '1', 'name'],
         ['1', 'name'],
         ['1', 'children', '0', 'name'],
         ['1', 'children', '0', 'children', '0', 'name'],
         ['1', 'children', '1', 'name']]
      );
    });
  });
});

describe('inner method', function () {
  describe('`_resolve` returns specific objects', function () {
    it('1', function () {
      var ret = jsoon._resolve(['name'], obj[0]);
      assert.equal(ret, 'Alice');
    });
    it('2', function () {
      var ret = jsoon._resolve([0, 'children'], obj);
      assert.equal(ret, obj[0].children);
    });
    it('3', function () {
      var ret = jsoon._resolve([1, 'children', 0, 'name'], obj);
      assert.equal(ret, 'Elen');
    });
    it('4', function () {
      var ret = jsoon._resolve([1, 'children', 1, 'gender'], obj);
      assert.equal(ret, 'male');
    });
  });
  describe('`_resolveAll` returns specific objects', function () {
    it('1', function () {
      var $$obj = jsoon(obj),
          ret = jsoon._resolveAll.apply($$obj, [[
            [0, 'name']
          ]]);
      assert.sameMembers(ret, ['Alice']);
    });
    it('2', function () {
      var $$obj = jsoon(obj),
          ret = jsoon._resolveAll.apply($$obj, [[
            [0, 'name'],
            [1, 'name']
          ]]);
      assert.sameMembers(ret, ['Alice', 'Dave']);
    });
  });
});

describe('`siblings` method', function () {
  describe('returns siblings of each object in current', function () {
    it('x', function () {
      var obj = {a: 1},
          $$obj = jsoon(obj);

      assert.equal($$obj.find(obj).siblings().obj(), null);
    });
    it('x', function () {
      var obj = {a: 1, b: 1},
          $$obj = jsoon(obj);

      assert.equal($$obj.find(obj).siblings().obj(), null);
    });
    it('x', function () {
      var obj = {a: 1, b: 1, c: [{d: 1}]},
          $$obj = jsoon(obj);

      assert.equal($$obj.find(obj).siblings().obj(), null);
    });
    it('x', function () {
      var obj = [{a: 1}, {b: 1}],
          $$obj = jsoon(obj);

      assert.equal($$obj.find(obj[0]).siblings().obj(), [obj[1]]);
    });
    it('x', function () {
      var obj = [{a: 1}, {b: 1}, {c: 1}, {d: 1}],
          $$obj = jsoon(obj);

      assert.equal($$obj.find(obj[0]).siblings().obj(), [obj[1], obj[2], obj[3]]);
    });
    it('x', function () {
      var obj = [{a: 1}, {b: [{c: 1}, {d: 1}]}],
          $$obj = jsoon(obj);

      assert.equal($$obj.find(obj[0]).siblings().obj(), [obj[1]]);
    });
  });
});
