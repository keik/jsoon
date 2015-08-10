/* global describe, it */
/* eslint strict: [0] */

var chai = chai || require('chai'),
    assert = chai.assert;

var jsoon = jsoon || require('./../');

var str = JSON.stringify;
var parse = JSON.parse;

var obj = [
  {
    name: 'Alice',
    age: 40,
    gender: 'female',
    address: {
      zipcode: '000-0000',
      country: 'us'
    },
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
        gender: 'male',
        address: {
          zipcode: '000-0001',
          country: 'jp'
        }
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

  //it('chainable methods have no side-effect to myself', function () {
  //  var $$obj = jsoon(obj),
  //      beforeVal = $$obj.find('name');
  //
  //  $$obj.find('name');
  //  assert.equal(beforeVal[0], $$obj[0]);
  //});
});

describe('`val` method', function () {
  it('returns current value', function () {
    var $$obj = jsoon(obj);

    assert.equal($$obj[0], obj);
  });
});

describe('`jsoon` method', function () {
  it('returns root obj', function () {
    var $$obj = jsoon(obj);

    // assert.equal($$obj.root().val(), obj);
    assert.equal($$obj[0], obj);
  });
});

describe('`.root` method', function () {
  it('returns root obj', function () {
    var $$obj = jsoon(obj);

    // assert.equal($$obj.root().val(), obj);
    assert.equal($$obj.root()[0], obj);
  });
});

describe('`find` method', function () {
  describe('with single string parameter', function () {
    it('returns descendants of each object in current filtered by `key` of no object', function () {
      var $$obj = jsoon(obj);

      assert.equal(str($$obj.find('name').val()),
                   str(['Alice', 'Bob', 'Carol', 'Dave', 'Elen', 'Fred', 'Greg']));
    });
    it('returns descendants of each object in current filtered by `key` of object)', function () {
      var $$obj = jsoon(obj);

      assert.equal(str($$obj.find('address').val()),
                   str([obj[0].address, obj[1].children[1].address]));
    });
    it('returns no object when `key` is not exist', function () {
      var $$obj = jsoon(obj);

      assert.equal(str($$obj.find('NOEXIST').val()),
                   str([]));
    });
    it('returns descendants of each object in current filtered by `key` of array)', function () {
      var $$obj = jsoon(obj);
      assert.equal($$obj.find('children').val().length, 3);
      assert.equal(str($$obj.find('children').val()),
                   str([obj[0].children, obj[1].children, obj[1].children[0].children]));
    });
    it('returns descendants of each object with duplicated-freed form', function () {
      var $$obj = jsoon(obj);

      assert.equal(str($$obj.find('children').eq(1).find('name').val()),
                   str(['Elen', 'Fred', 'Greg']));
    });
  });
  describe('with multiple string parameters', function () {
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
  describe('with object parameter', function () {
    it('returns specified object', function () {
      var $$obj = jsoon(obj);

      assert.equal($$obj.find(obj[0].children[0]).val()[0],
                   obj[0].children[0]);
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
    var $$obj = jsoon(obj);

    assert.equal($$obj.find('name').eq(0).parent().val()[0],
                 obj[0]);
  });
});

describe('`children` method', function () {
  it('returns children objects at the each of current object', function () {
    var $$obj = jsoon(obj);

    assert.equal(str($$obj.find('address').children().val()),
                 str(['000-0000', 'us', '000-0001', 'jp']));
  });
  it('returns children objects at the each of current object', function () {
    var $$obj = jsoon(obj);

    assert.equal(str($$obj.find('address').children('zipcode').val()),
                 str(['000-0000', '000-0001']));
  });
});
//
//describe('inner method', function () {
//  describe('`_resolve` returns specific objects', function () {
//    var $$obj = jsoon(obj);
//
//    it('which is `string', function () {
//      assert.equal(jsoon._resolve([], $$obj), obj);
//    });
//    it('which is `string', function () {
//      assert.equal(jsoon._resolve([0, 'name'], $$obj), 'Alice');
//    });
//    it('which is `array`', function () {
//      assert.equal(jsoon._resolve([0, 'children'], $$obj), obj[0].children);
//    });
//    it('which is `object`', function () {
//      assert.equal(jsoon._resolve([0, 'address'], $$obj), obj[0].address);
//    });
//  });
//  describe('`_resolveAll` returns specific objects', function () {
//    it('1', function () {
//      var $$obj = jsoon(obj),
//          ret = jsoon._resolveAll([[0, 'name']], $$obj);
//
//      assert.equal(str(ret), str(['Alice']));
//    });
//    it('2', function () {
//      var $$obj = jsoon(obj),
//          ret = jsoon._resolveAll([[0, 'name'], [1, 'name']], $$obj);
//
//      assert.equal(str(ret), str(['Alice', 'Dave']));
//    });
//  });
//  describe('`_uniq`', function () {
//    it('returns duplicate-free array', function () {
//      var a = [0, 1, 2, 2];
//      assert.lengthOf(jsoon._uniq(a), 3);
//
//      var b = [0, 1, [1], [1]];
//      assert.lengthOf(jsoon._uniq(b), 3);
//
//      var c = [[0], [1], [2, 2], [3, [3, 3]], [1], [2, 2], [3, [3, 3]]];
//      assert.lengthOf(jsoon._uniq(c), 4);
//
//      var d = [['a', 'b'], ['a', 'b'], ['a', 'c']];
//      assert.lengthOf(jsoon._uniq(d), 2);
//
//      var e = [['a', 'b', ['c', 2]], ['a', 'b'], ['a', 'b', ['c', 2]]];
//      assert.lengthOf(jsoon._uniq(e), 2);
//
//      var f = [['a', {a: 1, b: {c: 1}}], ['a', 'b'], ['a', {a: 1, b: {c: 1}}, ['a', 'b', ['c', 2]]]];
//      assert.lengthOf(jsoon._uniq(f), 3);
//    });
//  });
//});
//
//// describe('`siblings` method', function () {
////   describe('returns siblings of each object in current', function () {
////     it('x', function () {
////       var obj = {a: 1},
////           $$obj = jsoon(obj);
////
////       assert.equal($$obj.find(obj).siblings().obj(), null);
////     });
////     it('x', function () {
////       var obj = {a: 1, b: 1},
////           $$obj = jsoon(obj);
////
////       assert.equal($$obj.find(obj).siblings().obj(), null);
////     });
////     it('x', function () {
////       var obj = {a: 1, b: 1, c: [{d: 1}]},
////           $$obj = jsoon(obj);
////
////       assert.equal($$obj.find(obj).siblings().obj(), null);
////     });
////     it('x', function () {
////       var obj = [{a: 1}, {b: 1}],
////           $$obj = jsoon(obj);
////
////       assert.equal($$obj.find(obj[0]).siblings().obj(), [obj[1]]);
////     });
////     it('x', function () {
////       var obj = [{a: 1}, {b: 1}, {c: 1}, {d: 1}],
////           $$obj = jsoon(obj);
////
////       assert.equal($$obj.find(obj[0]).siblings().obj(), [obj[1], obj[2], obj[3]]);
////     });
////     it('x', function () {
////       var obj = [{a: 1}, {b: [{c: 1}, {d: 1}]}],
////           $$obj = jsoon(obj);
////
////       assert.equal($$obj.find(obj[0]).siblings().obj(), [obj[1]]);
////     });
////   });
//// });
