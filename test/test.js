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
        gender: 'female',
        'date-of-birth': '2000-01-01'
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
  describe('exported', function () {
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
          var $$obj = jsoon({});

          assert.typeOf($$obj[method], 'function');
        };
      }(methods[i])));
    }
  });
  it('chainable methods have no side-effect to myself', function () {
    var $$obj = jsoon(obj),
        beforeVal = $$obj.val();

    $$obj.find('name');
    assert.equal(beforeVal, $$obj.val());
  });
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
  describe('with single parameter', function () {
    it('returns descendants of each object in current filtered by `key`', function () {
      var $$obj = jsoon(obj);

      assert.equal(str($$obj.find('name').val()),
                   str(['Alice', 'Bob', 'Carol', 'Dave', 'Elen', 'Fred', 'Greg']));
    });
  });
  describe('with multiple parameters', function () {
    it('returns descendants of each object in current filtered by multiple `key`s which separated by `,`', function () {
      var $$obj = jsoon(obj);

      assert.equal(str($$obj.find('name, date-of-birth').val()),
                   str(['Alice', 'Bob', 'Carol', 'Dave', 'Elen', 'Fred', 'Greg', '2000-01-01']));
    });
  });
  describe('with redundant parameters', function () {
    it('returns descendants of each object with duplicated-freed form', function () {
      var $$obj = jsoon(obj);

      assert.lengthOf($$obj.find('name, name, name').val(),
                      ['Alice', 'Bob', 'Carol', 'Dave', 'Elen', 'Fred', 'Greg'].length);
    });
  });
});

describe('`eq` method', function () {
  describe('returns object at the specified index', function () {
    it('eq(0)', function () {
      var $$obj = jsoon(obj);

      assert.equal(str($$obj.find('name').eq(0).val()),
                   str(['Alice']));
    });
    it('eq(6)', function () {
      var $$obj = jsoon(obj);

      assert.equal(str($$obj.find('name').eq(6).val()),
                   str(['Greg']));
    });
  });
});

describe('`first` and `last` method', function () {
  describe('returns object at the specified index', function () {
    it('first()', function () {
      var $$obj = jsoon(obj);

      assert.equal(str($$obj.find('name').first().val()),
                   str(['Alice']));
    });
    it('last', function () {
      var $$obj = jsoon(obj);

      assert.equal(str($$obj.find('name').last().val()),
                   str(['Greg']));
    });
  });
});

describe('`parent` method', function () {
  it('returns object at the each of current object', function () {
    it('', function () {
      var $$obj = jsoon(obj);

      assert.equal($$obj.find('name').eq(0).parent().val(),
                   obj[0]);
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

      assert.equal(str(ret), str(['Alice']));
    });
    it('2', function () {
      var $$obj = jsoon(obj),
          ret = jsoon._resolveAll.apply($$obj, [[
            [0, 'name'],
            [1, 'name']
          ]]);

      assert.equal(str(ret), str(['Alice', 'Dave']));
    });
  });
  describe('`_uniqPaths`', function () {
    it('returns duplicate-free array', function () {
      var ary = [[0], [1], [2, 2], [3, [3, 3]], [1], [2, 2], [3, [3, 3]]];

      assert.equal(str(jsoon._uniqPaths(ary)), str([[0], [1], [2, 2], [3, [3, 3]]]));
    });
  });
});

// describe('`siblings` method', function () {
//   describe('returns siblings of each object in current', function () {
//     it('x', function () {
//       var obj = {a: 1},
//           $$obj = jsoon(obj);
//
//       assert.equal($$obj.find(obj).siblings().obj(), null);
//     });
//     it('x', function () {
//       var obj = {a: 1, b: 1},
//           $$obj = jsoon(obj);
//
//       assert.equal($$obj.find(obj).siblings().obj(), null);
//     });
//     it('x', function () {
//       var obj = {a: 1, b: 1, c: [{d: 1}]},
//           $$obj = jsoon(obj);
//
//       assert.equal($$obj.find(obj).siblings().obj(), null);
//     });
//     it('x', function () {
//       var obj = [{a: 1}, {b: 1}],
//           $$obj = jsoon(obj);
//
//       assert.equal($$obj.find(obj[0]).siblings().obj(), [obj[1]]);
//     });
//     it('x', function () {
//       var obj = [{a: 1}, {b: 1}, {c: 1}, {d: 1}],
//           $$obj = jsoon(obj);
//
//       assert.equal($$obj.find(obj[0]).siblings().obj(), [obj[1], obj[2], obj[3]]);
//     });
//     it('x', function () {
//       var obj = [{a: 1}, {b: [{c: 1}, {d: 1}]}],
//           $$obj = jsoon(obj);
//
//       assert.equal($$obj.find(obj[0]).siblings().obj(), [obj[1]]);
//     });
//   });
// });
