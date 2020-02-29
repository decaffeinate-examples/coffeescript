/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Classes
// -------

// * Class Definition
// * Class Instantiation
// * Inheritance and Super

test("classes with a four-level inheritance chain", function() {

  let cls;
  class Base {
    func(string) {
      return `zero/${string}`;
    }

    static static(string) {
      return `static/${string}`;
    }
  }

  class FirstChild extends Base {
    func(string) {
      return super.func('one/') + string;
    }
  }

  const SecondChild = class extends FirstChild {
    func(string) {
      return super.func('two/') + string;
    }
  };

  const thirdCtor = function() {
    return this.array = [1, 2, 3];
  };

  class ThirdChild extends SecondChild {
    constructor() { {       // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }       let thisFn = (() => { return this; }).toString();       let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];       eval(`${thisName} = this;`);     }     thirdCtor.call(this); }

    // Gratuitous comment for testing.
    func(string) {
      return super.func('three/') + string;
    }
  }

  let result = (new ThirdChild).func('four');

  ok(result === 'zero/one/two/three/four');
  ok(Base.static('word') === 'static/word');

  (cls = FirstChild).prototype.func = function(string) {
    return cls.prototype.__proto__.func.call(this, 'one/').length + string;
  };

  result = (new ThirdChild).func('four');

  ok(result === '9two/three/four');

  return ok((new ThirdChild).array.join(' ') === '1 2 3');
});


test("constructors with inheritance and super", function() {

  const identity = f => f;

  class TopClass {
    constructor(arg) {
      this.prop = 'top-' + arg;
    }
  }

  class SuperClass extends TopClass {
    constructor(arg) {
      identity(super('super-' + arg));
    }
  }

  class SubClass extends SuperClass {
    constructor() {
      identity(super('sub'));
    }
  }

  return ok((new SubClass).prop === 'top-super-sub');
});


test("Overriding the static property new doesn't clobber Function::new", function() {

  class OneClass {
    static initClass() {
      this.new = 'new';
      this.prototype.function = 'function';
    }
    constructor(name) { this.name = name; }
  }
  OneClass.initClass();

  class TwoClass extends OneClass {}
  delete TwoClass.new;

  Function.prototype.new = function() { return new (this)(...arguments); };

  ok((TwoClass.new('three')).name === 'three');
  ok((new OneClass).function === 'function');
  ok(OneClass.new === 'new');

  return delete Function.prototype.new;
});


test("basic classes, again, but in the manual prototype style", function() {

  let cls, cls1, cls2;
  const Base = function() {};
  Base.prototype.func = string => 'zero/' + string;
  Base.prototype['func-func'] = string => `dynamic-${string}`;

  const FirstChild = function() {};
  const SecondChild = function() {};
  const ThirdChild = function() {
    this.array = [1, 2, 3];
    return this;
  };

  __extends__(ThirdChild, __extends__(SecondChild, __extends__(FirstChild, Base)));

  (cls = FirstChild).prototype.func = function(string) {
    return cls.prototype.__proto__.func.call(this, 'one/') + string;
  };

  (cls1 = SecondChild).prototype.func = function(string) {
    return cls1.prototype.__proto__.func.call(this, 'two/') + string;
  };

  (cls2 = ThirdChild).prototype.func = function(string) {
    return cls2.prototype.__proto__.func.call(this, 'three/') + string;
  };

  const result = (new ThirdChild).func('four');

  ok(result === 'zero/one/two/three/four');

  return ok((new ThirdChild)['func-func']('thing') === 'dynamic-thing');
});


test("super with plain ol' prototypes", function() {

  let cls, cls1;
  const TopClass = function() {};
  TopClass.prototype.func = arg => 'top-' + arg;

  const SuperClass = function() {};
  __extends__(SuperClass, TopClass);
  (cls = SuperClass).prototype.func = function(arg) {
    return cls.prototype.__proto__.func.call(this, 'super-' + arg);
  };

  const SubClass = function() {};
  __extends__(SubClass, SuperClass);
  (cls1 = SubClass).prototype.func = function() {
    return cls1.prototype.__proto__.func.call(this, 'sub');
  };

  return eq((new SubClass).func(), 'top-super-sub');
});


test("'@' referring to the current instance, and not being coerced into a call", function() {

  class ClassName {
    amI() {
      return this instanceof ClassName;
    }
  }

  const obj = new ClassName;
  return ok(obj.amI());
});


test("super() calls in constructors of classes that are defined as object properties", function() {

  class Hive {
    constructor(name) { this.name = name; }
  }

  Hive.Bee = class Bee extends Hive {
    constructor(name) { super(...arguments); }
  };

  const maya = new Hive.Bee('Maya');
  return ok(maya.name === 'Maya');
});


test("classes with JS-keyword properties", function() {

  class Class {
    static initClass() {
      this.prototype.class = 'class';
    }
    name() { return this.class; }
  }
  Class.initClass();

  const instance = new Class;
  ok(instance.class === 'class');
  return ok(instance.name() === 'class');
});


test("Classes with methods that are pre-bound to the instance, or statically, to the class", function() {

  class Dog {
    static initClass() {
  
      this.static = () => {
        return new (this)('Dog');
      };
    }
    constructor(name) {
      this.bark = this.bark.bind(this);
      this.name = name;
    }

    bark() {
      return `${this.name} woofs!`;
    }
  }
  Dog.initClass();

  const spark = new Dog('Spark');
  const fido  = new Dog('Fido');
  fido.bark = spark.bark;

  ok(fido.bark() === 'Spark woofs!');

  const obj = {func: Dog.static};

  return ok(obj.func().name === 'Dog');
});


test("a bound function in a bound function", function() {

  class Mini {
    constructor() {
      this.generate = this.generate.bind(this);
    }

    static initClass() {
      this.prototype.num = 10;
    }
    generate() {
      return [1, 2, 3].map((i) =>
        () => {
          return this.num;
        });
    }
  }
  Mini.initClass();

  const m = new Mini;
  return eq((Array.from(m.generate()).map((func) => func())).join(' '), '10 10 10');
});


test("contructor called with varargs", function() {

  class Connection {
    constructor(one, two, three) {
      [this.one, this.two, this.three] = Array.from([one, two, three]);
    }

    out() {
      return `${this.one}-${this.two}-${this.three}`;
    }
  }

  const list = [3, 2, 1];
  const conn = new Connection(...Array.from(list || []));
  ok(conn instanceof Connection);
  return ok(conn.out() === '3-2-1');
});


test("calling super and passing along all arguments", function() {

  class Parent {
    method(...args) { return this.args = args; }
  }

  class Child extends Parent {
    method() { return super.method(...arguments); }
  }

  const c = new Child;
  c.method(1, 2, 3, 4);
  return ok(c.args.join(' ') === '1 2 3 4');
});


test("classes wrapped in decorators", function() {

  let Test;
  const func = function(klass) {
    klass.prototype.prop = 'value';
    return klass;
  };

  func(Test = (function() {
    Test = class Test {
      static initClass() {
        this.prototype.prop2 = 'value2';
      }
    };
    Test.initClass();
    return Test;
  })()
  );

  ok((new Test).prop  === 'value');
  return ok((new Test).prop2 === 'value2');
});


test("anonymous classes", function() {

  const obj = {
    klass: class {
      method() { return 'value'; }
    }
  };

  const instance = new obj.klass;
  return ok(instance.method() === 'value');
});


test("Implicit objects as static properties", function() {

  class Static {
    static initClass() {
      this.static = {
        one: 1,
        two: 2
      };
    }
  }
  Static.initClass();

  ok(Static.static.one === 1);
  return ok(Static.static.two === 2);
});


test("nothing classes", function() {

  const c = class {};
  return ok(c instanceof Function);
});


test("classes with static-level implicit objects", function() {

  class A {
    static initClass() {
      this.static = {one: 1};
      this.prototype.two = 2;
    }
  }
  A.initClass();

  class B {
    static initClass() {
      this.static = { one: 1,
      two: 2
    };
    }
  }
  B.initClass();

  eq(A.static.one, 1);
  eq(A.static.two, undefined);
  eq((new A).two, 2);

  eq(B.static.one, 1);
  eq(B.static.two, 2);
  return eq((new B).two, undefined);
});


test("classes with value'd constructors", function() {

  let counter = 0;
  const classMaker = function() {
    const inner = ++counter;
    return function() {
      return this.value = inner;
    };
  };

  let createOne = undefined;
  class One {
    static initClass() {
      createOne = classMaker();
    }
    constructor() {
      return createOne.apply(this, arguments);
    }
  }
  One.initClass();

  let createTwo = undefined;
  class Two {
    static initClass() {
      createTwo = classMaker();
    }
    constructor() {
      return createTwo.apply(this, arguments);
    }
  }
  Two.initClass();

  eq((new One).value, 1);
  eq((new Two).value, 2);
  eq((new One).value, 1);
  return eq((new Two).value, 2);
});


test("executable class bodies", function() {

  class A {
    static initClass() {
      if (true) {
        this.prototype.b = 'b';
      } else {
        this.prototype.c = 'c';
      }
    }
  }
  A.initClass();

  const a = new A;

  eq(a.b, 'b');
  return eq(a.c, undefined);
});


test("#2502: parenthesizing inner object values", function() {

  class A {
    static initClass() {
      this.prototype.category =  ({type: 'string'});
      this.prototype.sections =  ({type: 'number', default: 0});
    }
  }
  A.initClass();

  eq((new A).category.type, 'string');

  return eq((new A).sections.default, 0);
});


test("conditional prototype property assignment", function() {
  const debug = false;

  class Person {
    static initClass() {
      if (debug) {
        this.prototype.age = () => 10;
      } else {
        this.prototype.age = () => 20;
      }
    }
  }
  Person.initClass();

  return eq((new Person).age(), 20);
});


test("mild metaprogramming", function() {

  class Base {
    static attr(name) {
      return this.prototype[name] = function(val) {
        if (arguments.length > 0) {
          return this[`_${name}`] = val;
        } else {
          return this[`_${name}`];
        }
      };
    }
  }

  class Robot extends Base {
    static initClass() {
      this.attr('power');
      this.attr('speed');
    }
  }
  Robot.initClass();

  const robby = new Robot;

  ok(robby.power() === undefined);

  robby.power(11);
  robby.speed(Infinity);

  eq(robby.power(), 11);
  return eq(robby.speed(), Infinity);
});


test("namespaced classes do not reserve their function name in outside scope", function() {

  const one = {};
  const two = {};

  let Cls = (one.Klass = class Klass {
    static initClass() {
      this.label = "one";
    }
  });
  Cls.initClass();

  Cls = (two.Klass = class Klass {
    static initClass() {
      this.label = "two";
    }
  });
  Cls.initClass();

  eq(typeof Klass, 'undefined');
  eq(one.Klass.label, 'one');
  return eq(two.Klass.label, 'two');
});


test("nested classes", function() {

  class Outer {
    static initClass() {
  
      this.Inner = class Inner {
        constructor() {
          this.label = 'inner';
        }
      };
    }
    constructor() {
      this.label = 'outer';
    }
  }
  Outer.initClass();

  eq((new Outer).label, 'outer');
  return eq((new Outer.Inner).label, 'inner');
});


test("variables in constructor bodies are correctly scoped", function() {

  var A = (function() {
    let x = undefined;
    let y = undefined;
    A = class A {
      static initClass() {
        x = 1;
        y = 2;
      }
      constructor() {
        x = 10;
        y = 20;
      }
      captured() {
        return {x, y};
      }
    };
    A.initClass();
    return A;
  })();

  const a = new A;
  eq(a.captured().x, 10);
  return eq(a.captured().y, 2);
});


test("Issue #924: Static methods in nested classes", function() {

  class A {
    static initClass() {
      this.B = class {
        static c() { return 5; }
      };
    }
  }
  A.initClass();

  return eq(A.B.c(), 5);
});


test("`class extends this`", function() {

  class A {
    func() { return 'A'; }
  }

  let B = null;
  const makeClass = function() {
    return B = class extends this {
      func() { return super.func(...arguments) + ' B'; }
    };
  };

  makeClass.call(A);

  return eq((new B()).func(), 'A B');
});


test("ensure that constructors invoked with splats return a new object", function() {

  const args = [1, 2, 3];
  let Type = function(args1) {
    this.args = args1;
  };
  const type = new Type(args);

  ok(type && type instanceof Type);
  ok(type.args && type.args instanceof Array);
  for (let i = 0; i < type.args.length; i++) { const v = type.args[i]; ok(v === args[i]); }

  const Type1 = function(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  };
  const type1 = new Type1(...Array.from(args || []));

  ok(type1 instanceof   Type1);
  eq(type1.constructor, Type1);
  ok((type1.a === args[0]) && (type1.b === args[1]) && (type1.c === args[2]));

  // Ensure that constructors invoked with splats cache the function.
  let called = 0;
  const get = function() { if (called++) { return false; } else { return (Type = class Type {}); } };
  return new get()(...Array.from(args || []));
});

test("`new` shouldn't add extra parens", () => ok(new Date().constructor === Date));


test("`new` works against bare function", () => eq(Date, new (function() {
  eq(this, new (() => this));
  return Date;
})
));


test("#1182: a subclass should be able to set its constructor to an external function", function() {
  const ctor = function() {
    return this.val = 1;
  };
  class A {}
  let createB = undefined;
  class B extends A {
    static initClass() {
      createB = ctor;
    }
    constructor() {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      return createB.apply(this, arguments);
    }
  }
  B.initClass();
  return eq((new B).val, 1);
});

test("#1182: external constructors continued", function() {
  const ctor = function() {};
  class A {}
  let createB = undefined;
  class B extends A {
    static initClass() {
      createB = ctor;
    }
    method() {}
    constructor() {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      return createB.apply(this, arguments);
    }
  }
  B.initClass();
  return ok(B.prototype.method);
});

test("#1313: misplaced __extends", function() {
  const nonce = {};
  class A {}
  class B extends A {
    static initClass() {
      this.prototype.prop = nonce;
    }
    constructor() {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
    }
  }
  B.initClass();
  return eq(nonce, B.prototype.prop);
});

test("#1182: execution order needs to be considered as well", function() {
  let B;
  let counter = 0;
  const makeFn = function(n) { eq(n, ++counter); return function() {}; };
  return B = (function() {
    let createB = undefined;
    B = class B extends (makeFn(1)) {
      static initClass() {
        this.B = makeFn(2);
        createB = makeFn(3);
      }
      constructor() {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        return createB.apply(this, arguments);
      }
    };
    B.initClass();
    return B;
  })();
});

test("#1182: external constructors with bound functions", function() {
  const fn = function() {
    ({one: 1});
    return this;
  };
  class B {}
  let createA = undefined;
  class A {
    static initClass() {
      createA = fn;
    }
    constructor() {
      this.method = this.method.bind(this);
      return createA.apply(this, arguments);
    }
    method() { return this instanceof A; }
  }
  A.initClass();
  return ok((new A).method.call(new B));
});

test("#1372: bound class methods with reserved names", function() {
  class C {
    constructor() {
      this.delete = this.delete.bind(this);
    }

    delete() {}
  }
  return ok(C.prototype.delete);
});

test("#1380: `super` with reserved names", function() {
  class C {
    do() { return super.do(...arguments); }
  }
  ok(C.prototype.do);

  class B {
    0() { return super[0](...arguments); }
  }
  return ok(B.prototype[0]);
});

test("#1464: bound class methods should keep context", function() {
  const nonce  = {};
  const nonce2 = {};
  class C {
    static initClass() {
      this.boundStaticColon = () => new (this)(nonce);
      this.boundStaticEqual= () => new (this)(nonce2);
    }
    constructor(id) {
      this.id = id;
    }
  }
  C.initClass();
  eq(nonce,  C.boundStaticColon().id);
  return eq(nonce2, C.boundStaticEqual().id);
});

test("#1009: classes with reserved words as determined names", () => (function() {
  eq('function', typeof (this.for = class _for {}));
  ok(!/\beval\b/.test((this.eval = class _eval {}).toString()));
  return ok(!/\barguments\b/.test((this.arguments = class _arguments {}).toString()));
}).call({}));

test("#1482: classes can extend expressions", function() {
  const id = x => x;
  const nonce = {};
  class A {
    static initClass() {
      this.prototype.nonce = nonce;
    }
  }
  A.initClass();
  class B extends id(A) {}
  return eq(nonce, (new B).nonce);
});

test("#1598: super works for static methods too", function() {

  class Parent {
    method() {
      return 'NO';
    }
    static method() {
      return 'yes';
    }
  }

  class Child extends Parent {
    static method() {
      return 'pass? ' + super.method(...arguments);
    }
  }

  return eq(Child.method(), 'pass? yes');
});

test("#1842: Regression with bound functions within bound class methods", function() {

  class Store {
    static initClass() {
      this.bound = () => {
        return (() => {
          return eq(this, Store);
        })();
      };
    }
  }
  Store.initClass();

  Store.bound();

  // And a fancier case:

  Store = class Store {
    constructor() {
      this.instance = this.instance.bind(this);
    }

    static initClass() {
  
      eq(this, Store);
  
      this.bound = () => {
        return (() => {
          return eq(this, Store);
        })();
      };
    }

    static unbound() {
      return eq(this, Store);
    }

    instance() {
      return ok(this instanceof Store);
    }
  };
  Store.initClass();

  Store.bound();
  Store.unbound();
  return (new Store).instance();
});

test("#1876: Class @A extends A", function() {
  class A {}
  this.A = class A extends A {};

  return ok((new this.A) instanceof A);
});

test("#1813: Passing class definitions as expressions", function() {
  let A, B;
  const ident = x => x;

  let result = ident(A = (function() {
    let x = undefined;
    A = class A {
      static initClass() {
        x = 1;
      }
    };
    A.initClass();
    return A;
  })());

  eq(result, A);

  result = ident(B = (function() {
    let x = undefined;
    B = class B extends A {
      static initClass() {
        x = 1;
      }
    };
    B.initClass();
    return B;
  })()
  );

  return eq(result, B);
});

test("#1966: external constructors should produce their return value", function() {
  const ctor = () => ({});
  let createA = undefined;
  class A {
    static initClass() {
      createA = ctor;
    }
    constructor() {
      return createA.apply(this, arguments);
    }
  }
  A.initClass();
  return ok(!((new A) instanceof A));
});

test("#1980: regression with an inherited class with static function members", function() {

  class A {}

  class B extends A {
    static initClass() {
      this.static = () => 'value';
    }
  }
  B.initClass();

  return eq(B.static(), 'value');
});

test("#1534: class then 'use strict'", function() {
  // [14.1 Directive Prologues and the Use Strict Directive](http://es5.github.com/#x14.1)
  const nonce = {};
  const error = 'do -> ok this';
  const strictTest = `do ->'use strict';${error}`;
  if (((() => { try { return CoffeeScript.run(strictTest, {bare: true}); } catch (e) { return nonce; } })()) !== nonce) { return; }

  throws(() => CoffeeScript.run(`class then 'use strict';${error}`, {bare: true}));
  doesNotThrow(() => CoffeeScript.run(`class then ${error}`, {bare: true}));
  doesNotThrow(() => CoffeeScript.run(`class then ${error};'use strict'`, {bare: true}));

  // comments are ignored in the Directive Prologue
  const comments = [`\
class
  ### comment ###
  'use strict'
  ${error}`,
  `\
class
  ### comment 1 ###
  ### comment 2 ###
  'use strict'
  ${error}`,
  `\
class
  ### comment 1 ###
  ### comment 2 ###
  'use strict'
  ${error}
  ### comment 3 ###`
  ];
  for (var comment of Array.from(comments)) { throws((() => CoffeeScript.run(comment, {bare: true}))); }

  // [ES5 §14.1](http://es5.github.com/#x14.1) allows for other directives
  const directives = [`\
class
  'directive 1'
  'use strict'
  ${error}`,
  `\
class
  'use strict'
  'directive 2'
  ${error}`,
  `\
class
  ### comment 1 ###
  'directive 1'
  'use strict'
  ${error}`,
  `\
class
  ### comment 1 ###
  'directive 1'
  ### comment 2 ###
  'use strict'
  ${error}`
  ];
  return Array.from(directives).map((directive) => throws((() => CoffeeScript.run(directive, {bare: true}))));
});

test("#2052: classes should work in strict mode", function() {
  try {
    return (function() {
      'use strict';
      let A;
      return (A = class A {});
    })();
  } catch (e) {
    return ok(false);
  }
});

test("directives in class with extends ", function() {
  const strictTest = `\
class extends Object
  ### comment ###
  'use strict'
  do -> eq this, undefined\
`;
  return CoffeeScript.run(strictTest, {bare: true});
});

test("#2630: class bodies can't reference arguments", function() {
  throws(() => CoffeeScript.compile('class Test then arguments'));

  // #4320: Don't be too eager when checking, though.
  class Test {
    static initClass() {
      this.prototype.arguments = 5;
    }
  }
  Test.initClass();
  return eq(5, Test.prototype.arguments);
});

test("#2319: fn class n extends o.p [INDENT] x = 123", function() {
  let OneKeeper;
  const first = function() {};

  const base = {onebase() {}};

  first(OneKeeper = (function() {
    let one = undefined;
    OneKeeper = class OneKeeper extends base.onebase {
      static initClass() {
        one = 1;
      }
      one() { return one; }
    };
    OneKeeper.initClass();
    return OneKeeper;
  })()
  );

  return eq(new OneKeeper().one(), 1);
});


test("#2599: other typed constructors should be inherited", function() {
  class Base {
    constructor() { return {}; }
  }

  class Derived extends Base {}

  ok(!((new Derived) instanceof Derived));
  ok(!((new Derived) instanceof Base));
  return ok(!((new Base) instanceof Base));
});

test("#2359: extending native objects that use other typed constructors requires defining a constructor", function() {
  class BrokenArray extends Array {
    method() { return 'no one will call me'; }
  }

  const brokenArray = new BrokenArray;
  ok(!(brokenArray instanceof BrokenArray));
  ok(typeof brokenArray.method === 'undefined');

  class WorkingArray extends Array {
    constructor() { super(...arguments); }
    method() { return 'yes!'; }
  }

  const workingArray = new WorkingArray;
  ok(workingArray instanceof WorkingArray);
  return eq('yes!', workingArray.method());
});


test("#2782: non-alphanumeric-named bound functions", function() {
  class A {
    constructor() {
      this['b:c'] = this['b:c'].bind(this);
    }

    'b:c'() {
      return 'd';
    }
  }

  return eq((new A)['b:c'](), 'd');
});


test("#2781: overriding bound functions", function() {
  class A {
    constructor() {
      this.b = this.b.bind(this);
    }

    a() {
        return this.b();
      }
    b() {
        return 1;
      }
  }

  class B extends A {
    constructor(...args) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.b = this.b.bind(this);
      super(...args);
    }

    b() {
        return 2;
      }
  }

  let {
    b
  } = new A;
  eq(b(), 1);

  ({
    b
  } = new B);
  return eq(b(), 2);
});


test("#2791: bound function with destructured argument", function() {
  class Foo {
    constructor() {
      this.method = this.method.bind(this);
    }

    method({a}) { return 'Bar'; }
  }

  return eq((new Foo).method({a: 'Bar'}), 'Bar');
});


test("#2796: ditto, ditto, ditto", function() {
  let answer = null;

  const outsideMethod = func => func.call({message: 'wrong!'});

  class Base {
    constructor() {
      this.echo = this.echo.bind(this);
      this.message = 'right!';
      outsideMethod(this.echo);
    }

    echo() {
      return answer = this.message;
    }
  }

  new Base;
  return eq(answer, 'right!');
});

test("#3063: Class bodies cannot contain pure statements", () => throws(() => CoffeeScript.compile(`\
class extends S
return if S.f
@f: => this\
`
)));

test("#2949: super in static method with reserved name", function() {
  class Foo {
    static static() { return 'baz'; }
  }

  class Bar extends Foo {
    static static() { return super.static(...arguments); }
  }

  return eq(Bar.static(), 'baz');
});

test("#3232: super in static methods (not object-assigned)", function() {
  class Foo {
    static baz() { return true; }
    static qux() { return true; }
  }

  class Bar extends Foo {
    static baz() { return super.baz(...arguments); }
    static qux() { return super.qux(...arguments); }
  }

  ok(Bar.baz());
  return ok(Bar.qux());
});

test("#1392 calling `super` in methods defined on namespaced classes", function() {
  let cls, cls1;
  class Base {
    m() { return 5; }
    n() { return 4; }
  }
  const namespace = {
    A() {},
    B() {}
  };
  __extends__(namespace.A, Base);

  (cls = namespace.A).prototype.m = function() { return cls.prototype.__proto__.m.call(this, ...arguments); };
  eq(5, (new namespace.A).m());
  namespace.B.prototype.m = namespace.A.prototype.m;
  namespace.A.prototype.m = null;
  eq(5, (new namespace.B).m());

  let count = 0;
  const getNamespace = function() { count++; return namespace; };
  (cls1 = getNamespace().A).prototype.n = function() { return cls1.prototype.__proto__.n.call(this, ...arguments); };
  eq(4, (new namespace.A).n());
  eq(1, count);

  class C {
    static initClass() {
      let cls2;
      __extends__(this.a, Base);
      (cls2 = this.a).prototype.m = function() { return cls2.prototype.__proto__.m.call(this, ...arguments); };
    }
    static a() {}
  }
  C.initClass();
  return eq(5, (new C.a).m());
});

test("dynamic method names and super", function() {
  let cls, cls1, method, method1;
  let method2, method3;
  class Base {
    static m() { return 6; }
    m() { return 5; }
    m2() { return 4.5; }
    n() { return 4; }
  }
  const A = function() {};
  __extends__(A, Base);

  let m = 'm';
  (cls = A).prototype[method = m] = function() { return cls.prototype.__proto__[method].call(this, ...arguments); };
  m = 'n';
  eq(5, (new A).m());

  const name = function() { count++; return 'n'; };

  var count = 0;
  (cls1 = A).prototype[method1 = name()] = function() { return cls1.prototype.__proto__[method1].call(this, ...arguments); };
  eq(4, (new A).n());
  eq(1, count);

  m = 'm';
  let m2 = 'm2';
  count = 0;
  class B extends Base {
    static initClass() {
      let cls2, method2;
      (cls2 = this).prototype[method2 = m] = function() { return cls2.prototype.__proto__[method2].call(this, ...arguments); };
    }
    static [method2 = name()]() { return super[method2](...arguments); }
    [method3 = m2]() { return super[method3](...arguments); }
  }
  B.initClass();
  const b = new B;
  m = (m2 = 'n');
  eq(6, B.m());
  eq(5, b.m());
  eq(4.5, b.m2());
  eq(1, count);

  class C extends B {
    m() { return super.m(...arguments); }
  }
  return eq(5, (new C).m());
});

function __extends__(child, parent) {
  Object.getOwnPropertyNames(parent).forEach(
    name => child[name] = parent[name]
  );
  child.prototype = Object.create(parent.prototype);
  child.__super__ = parent.prototype;
  return child;
}