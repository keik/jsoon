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

var jsoon = require('./');

var $ = jsoon(obj);
