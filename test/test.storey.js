// What happens to falsey values?
// undefined => error
// NaN       => null
// null      => null
var testSubjects = {
  // should not even work...
  'undefined': {
    subject: undefined,
    result: undefined
  },
  'NaN': {
    subject: NaN,
    result: null
  },
  'null': {
    subject: null,
    result: null
  },
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
  'function': {
    subject: function(){},
    result: undefined
  },
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
  var types = Object.keys(testSubjects), type, typeName;
  for (var i = 0; i < types.length; i++) {
    typeName = types[i];
    type = testSubjects[typeName];
    it('should set ' + typeName, function(done) {
      storey.set(typeName, type.subject, function() {
        done();
      });
    });
    it('should get ' + typeName, function(done) {
      storey.get(typeName, function(value) {
        value.should.equal(type.result);
        done();
      });
    });
  }
});

// lame synchronous functions
describe('testing types (sync)', function() {
  var types = Object.keys(testSubjects), type, typeName;
  for (var i = 0; i < types.length; i++) {
    typeName = types[i];
    type = testSubjects[typeName];
    var value;
    it('should set ' + typeName, function() {
      storey.setSync(typeName, type.subject);
    });
    it('should get ' + typeName, function() {
      value = storey.getSync(typeName);
      value.should.equal(type.result);
    });
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
    is.should.equal('this');
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
