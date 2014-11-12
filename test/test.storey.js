// Not supported objects/types:
//  undefined, null, NaN, functions (can be .toStringed)
var testSubjects = {
  // should not even work...
  'number': {
    subject: 7,
    result: 7
  },
  // should (de)serialize correctly
  'boolean': {
    subject: false,
    result: false
  },
  // no support for functions
  // could be undergone toString first
  // but... who the hell uses localStorage
  // to store functions?
  /*'function': {
    subject: function(){},
    result: undefined
  },*/
  'object': {
    subject: {test: 'object', sup: 'man'},
    result: {test: 'object', sup: 'man'}
  },
  'basic array of numbers': {
    subject: [1, 2, 3],
    result: [1, 2, 3]
  },
  'array of multiple types': {
    subject: [1, 'h', true, {test: 'ing'}],
    result: [1, 'h', true, {test: 'ing'}]
  }
};

describe('#set()', function() {
  it('should be asynchronous', function(done) {
    storey.set('hello', 'world', function() {
      done();
    });
  });
  it('should be set', function() {
    localStorage.getItem('hello').should.equal('world');
  });
});

// reuse 'hello'=>'world' from before
describe('#get()', function() {
  it('should be able to get', function(done) {
    storey.get('hello', function(value) {
      value.should.equal('world');
      done();
    });
  });
});

// now remove 'hello'=>'world'
describe('#remove()', function() {
  it('should be able to remove', function(done) {
    storey.remove('hello', function() {
      storey.get('hello', function(value) {
        value.should.not.be.ok;
      });
      done();
    });
  });
});

// now that basic functions are nailed,
// do a variation of types inserted and extracted
describe('testing types (async)', function() {
  var types = Object.keys(testSubjects);
  for (var i = 0; i < types.length; i++) {
    // for localization of i in for loop
    // if this is not done, async functions
    // will just use last index in loop
    (function(i) {
      var typeName = types[i];
      var type = testSubjects[typeName];
      it('should set ' + typeName, function(done) {
        storey.set(typeName, type.subject, function() {
          done();
        });
      });
      it('should get ' + typeName, function(done) {
        storey.get(typeName, function(value) {
          value.should.eql(type.result);
          /*
          if (typeof value === 'object') value.should.eql(type.result);
          else value.should.equal(type.result);*/
          done();
        });
      });
    })(i);
  }
});

// lame synchronous functions
describe('testing types (sync)', function() {
  var types = Object.keys(testSubjects);
  for (var i = 0; i < types.length; i++) {
    (function(i) {
      var typeName = types[i];
      var type = testSubjects[typeName];
      var value;
      it('should set ' + typeName, function() {
        storey.setSync(typeName, type.subject);
      });
      it('should get ' + typeName, function() {
        value = storey.getSync(typeName);
        // use eql to check for contents
        value.should.eql(type.result);
      });
  })(i);
  }
});

// types are nailed!
// moving on to multi functions
describe('#setMulti()', function() {
  it('should set multiple', function(done) {
    storey.setMulti({
      'this': 'is',
      'amazing': 'right',
      'oh': 'yeah'
    }, function(){
      done();
    });
  });
  it('should be set correctly', function(){
    // just use sync functions...
    // why the hassle
    var is = storey.getSync('this');
    var right = storey.getSync('amazing');
    var yeah = storey.getSync('oh');
    is.should.equal('is');
    right.should.equal('right');
    yeah.should.equal('yeah');
  });
});

describe('#getMulti()', function() {
  it('should be in right order', function(done) {
    // shuffled their order?
    storey.getMulti(['amazing', 'this', 'oh'], function(values) {
      // .eql matches contents
      values.should.eql(['right', 'is', 'yeah']);
      done();
    });
  });
});

describe('#removeMulti()', function() {
  it('should remove perfectly', function(done) {
    var keys = ['amazing', 'this', 'oh'];
    storey.removeMulti(keys, function() {
      // getMulti passed test and usable
      storey.getMulti(keys, function(values) {
        values.should.eql([undefined, undefined, undefined]);
      });
      done();
    });
  });
});

describe('Not in storage', function() {
  it('should return null', function(done) {
    storey.get('some unknown key', function(value) {
      (value === null).should.be.true;
      done();
    });
  });
});

describe('#clear()', function() {
  it('should clear perfectly', function(done) {
    storey.clear(function() {
      done();
    });
  });
  // this clears out storage
  // and all is left for 'null' to be returned
  it('should only return null', function(done) {
    var types = Object.keys(testSubjects);
    for (var i = 0; i < types.length; i++) {
      (function(i) {
        var type = types[i];
        storey.get(type, function(value) {
          (value === null).should.be.true;
          done();
        });
      })(i);
    }
  });
});

// for callbacks, this check is sufficient:
// if (typeof callback === 'function') callback();

// storage is clear, set new items
describe('#forEach()', function() {
  it('should do function on each item', function(done) {
    storey.setMulti({
      a: 1,
      b: 2,
      c: 3
    });
    storey.forEach(function(value) {
      done();
      return value * 2;
    });
    storey.getMulti(['a', 'b', 'c'], function(values) {
      values[0].should.be.equal(2);
      values[1].should.be.equal(4);
      values[2].should.be.equal(6);
    });
  });
});

// lame tests for size
describe('#left()', function() {
  it('should be 500 MB - storey.size()', function() {
    var MAX_SIZE = 1024 * 1024 * 5;
    storey.left().should.be.equal(MAX_SIZE - storey.size());
  });
});
