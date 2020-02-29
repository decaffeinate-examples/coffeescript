/* eslint-disable
    class-methods-use-this,
    consistent-return,
    constructor-super,
    default-case,
    func-names,
    guard-for-in,
    max-classes-per-file,
    no-constant-condition,
    no-empty,
    no-eval,
    no-ex-assign,
    no-mixed-spaces-and-tabs,
    no-multi-assign,
    no-proto,
    no-restricted-syntax,
    no-return-assign,
    no-sequences,
    no-shadow,
    no-tabs,
    no-this-before-super,
    no-throw-literal,
    no-undef,
    no-underscore-dangle,
    no-unused-expressions,
    no-unused-vars,
    no-use-before-define,
    no-useless-constructor,
    prefer-rest-params,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS203: Remove `|| {}` from converted for-own loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Scope
// -----

// * Variable Safety
// * Variable Shadowing
// * Auto-closure (`do`)
// * Global Scope Leaks

test('reference `arguments` inside of functions', () => {
  const sumOfArgs = function () {
    let sum = (a, b) => a + b;
    sum = 0;
    for (const num of Array.from(arguments)) { sum += num; }
    return sum;
  };
  return eq(10, sumOfArgs(0, 1, 2, 3, 4));
});

test('assignment to an Object.prototype-named variable should not leak to outer scope', () => {
  // FIXME: fails on IE
  (function () {
    let constructor;
    return constructor = 'word';
  }());
  return ok(constructor !== 'word');
});

test("siblings of splat parameters shouldn't leak to surrounding scope", () => {
  const x = 10;
  const oops = function (x, ...args) {};
  oops(20, 1, 2, 3);
  return eq(x, 10);
});

test('catch statements should introduce their argument to scope', () => {
  try { throw ''; } catch (e) {
    ((() => e = 5))();
    return eq(5, e);
  }
});

test('loop variable should be accessible after for-of loop', () => {
  let x;
  const d = ((() => {
    const result = [];
    for (x in { 1: 'a', 2: 'b' }) {
      result.push(x);
    }
    return result;
  })());
  return ok(['1', '2'].includes(x));
});

test('loop variable should be accessible after for-in loop', () => {
  let x;
  const d = ((() => {
    const result = [];
    for (x of [1, 2]) {
      result.push(x);
    }
    return result;
  })());
  return eq(x, 2);
});

test('loop variable should be accessible after for-from loop', () => {
  let x;
  const d = ((() => {
    const result = [];
    for (x of [1, 2]) {
      result.push(x);
    }
    return result;
  })());
  return eq(x, 2);
});
// https://github.com/decaffeinate/decaffeinate/blob/master/docs/correctness-issues.md#globals-like-object-and-array-may-be-accessed-by-name-from-generated-code
class Array_ {
  static initClass() {
    this.prototype.slice = fail;
  }
}
Array_.initClass(); // needs to be global
class Object_ {
  static initClass() {
    this.prototype.hasOwnProperty = fail;
  }
}
Object_.initClass();
test("#1973: redefining Array/Object constructors shouldn't confuse __X helpers", () => {
  const arr = [1, 2, 3, 4];
  arrayEq([3, 4], arr.slice(2));
  const obj = { arr };
  return (() => {
    const result = [];
    for (const k of Object.keys(obj || {})) {
      result.push(eq(arr, obj[k]));
    }
    return result;
  })();
});

test('#2255: global leak with splatted @-params', () => {
  ok((typeof x === 'undefined' || x === null));
  arrayEq([0], (function (...args) { [...this.x] = Array.from(args); return this.x; }).call({}, 0));
  return ok((typeof x === 'undefined' || x === null));
});

test('#1183: super + fat arrows', () => {
  const dolater = (cb) => cb();

  class A {
  	constructor() {
  		this._i = 0;
    }

  	foo(cb) {
  		return dolater(() => {
  			this._i += 1;
  			return cb();
      });
    }
  }

  class B extends A {
  	constructor() {
  		super(...arguments);
    }

  	foo(cb) {
  		return dolater(() => dolater(() => {
  				this._i += 2;
  				return B.prototype.__proto__.foo.call(this, cb);
      }));
    }
  }

  const b = new B();
  return b.foo(() => eq(b._i, 3));
});

test('#1183: super + wrap', () => {
  let cls;
  class A {
    m() { return 10; }
  }

  class B extends A {
    constructor() { super(...arguments); }
  }

  (cls = B).prototype.m = function () {
    let r;
    return r = (() => { try { return cls.prototype.__proto__.m.call(this); } catch (error) {} })();
  };

  return eq((new B()).m(), 10);
});

test('#1183: super + closures', () => {
  class A {
    constructor() {
      this.i = 10;
    }

    foo() { return this.i; }
  }

  class B extends A {
    foo() {
      const ret = (() => {
        switch (1) {
          case 0: return 0;
          case 1: return super.foo();
        }
      })();
      return ret;
    }
  }
  return eq((new B()).foo(), 10);
});

test('#2331: bound super regression', () => {
  class A {
    static initClass() {
      this.value = 'A';
    }

    method() { return this.constructor.value; }
  }
  A.initClass();

  class B extends A {
    constructor(...args) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        const thisFn = (() => this).toString();
        const thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.method = this.method.bind(this);
      super(...args);
    }

    method() { return super.method(...arguments); }
  }

  return eq((new B()).method(), 'A');
});

test('#3259: leak with @-params within destructured parameters', () => {
  const fn = function ({ foo1 }, ...rest) {
    let bar; let baz; let
      foo;
    this.foo = foo1;
    [this.bar] = Array.from(rest[0]), [{ baz: this.baz }] = Array.from(rest[1]);
    return foo = (bar = (baz = false));
  };

  fn.call({}, { foo: 'foo' }, ['bar'], [{ baz: 'baz' }]);

  eq('undefined', typeof foo);
  eq('undefined', typeof bar);
  return eq('undefined', typeof baz);
});
