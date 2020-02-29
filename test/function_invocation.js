/* eslint-disable
    class-methods-use-this,
    consistent-return,
    default-case,
    func-names,
    max-classes-per-file,
    max-len,
    new-cap,
    no-constant-condition,
    no-empty,
    no-multi-assign,
    no-param-reassign,
    no-plusplus,
    no-restricted-syntax,
    no-return-assign,
    no-shadow,
    no-undef,
    no-unused-expressions,
    no-unused-vars,
    no-var,
    prefer-const,
    prefer-rest-params,
    prefer-spread,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Function Invocation
// -------------------

// * Function Invocation
// * Splats in Function Invocations
// * Implicit Returns
// * Explicit Returns

// shared identity function
const id = function (_) { if (arguments.length === 1) { return _; } return [...arguments]; };

// helper to assert that a string should fail compilation
const cantCompile = (code) => throws(() => CoffeeScript.compile(code));

test('basic argument passing', () => {
  const a = {};
  const b = {};
  const c = {};
  eq(1, (id(1)));
  eq(2, (id(1, 2))[1]);
  eq(a, (id(a)));
  return eq(c, (id(a, b, c))[2]);
});


test('passing arguments on separate lines', () => {
  const a = {};
  const b = {};
  const c = {};
  ok(id(
    a,
    b,
    c,
  )[1] === b);
  eq(0, id(
    0,
    10,
  )[0]);
  eq(a, id(
    a,
  ));
  return eq(b,
    (id(b)));
});


test('optional parens can be used in a nested fashion', () => {
  const call = (func) => func();
  const add = (a, b) => a + b;
  const result = call(() => {
    let inner;
    return inner = call(() => add(5, 5));
  });
  return ok(result === 10);
});


test('hanging commas and semicolons in argument list', () => {
  const fn = function () { return arguments.length; };
  eq(2, fn(0, 1));
  eq(3, fn(0, 1,
    2));
  eq(2, fn(0, 1));
  // TODO: this test fails (the string compiles), but should it?
  // throws -> CoffeeScript.compile "fn(0,1,;)"
  throws(() => CoffeeScript.compile('fn(0,1,;;)'));
  throws(() => CoffeeScript.compile('fn(0, 1;,)'));
  throws(() => CoffeeScript.compile('fn(,0)'));
  return throws(() => CoffeeScript.compile('fn(;0)'));
});


test('function invocation', () => {
  const func = function () {
    if (true) { }
  };
  eq(undefined, func());

  const result = ('hello'.slice)(3);
  return ok(result === 'lo');
});


test('And even with strange things like this:', () => {
  const funcs = [((x) => x), ((x) => x * x)];
  const result = funcs[1](5);
  return ok(result === 25);
});


test('More fun with optional parens.', () => {
  const fn = (arg) => arg;
  ok(fn(fn({ prop: 101 })).prop === 101);

  const okFunc = (f) => ok(f());
  return okFunc(() => true);
});


test('chained function calls', () => {
  const nonce = {};
  const identityWrap = (x) => () => x;
  eq(nonce, identityWrap(identityWrap(nonce))()());
  return eq(nonce, (identityWrap(identityWrap(nonce)))()());
});


test('Multi-blocks with optional parens.', () => {
  const fn = (arg) => arg;
  const result = fn(() => fn(() => 'Wrapped'));
  return ok(result()() === 'Wrapped');
});


test('method calls', () => {
  const fnId = (fn) => (function () { return fn.apply(this, arguments); });
  const math = {
    add(a, b) { return a + b; },
    anonymousAdd(a, b) { return a + b; },
    fastAdd: fnId((a, b) => a + b),
  };
  ok(math.add(5, 5) === 10);
  ok(math.anonymousAdd(10, 10) === 20);
  return ok(math.fastAdd(20, 20) === 40);
});


test('Ensure that functions can have a trailing comma in their argument list', () => {
  const mult = function (x, ...rest) {
    const adjustedLength = Math.max(rest.length, 1); const mids = rest.slice(0, adjustedLength - 1); const
      y = rest[adjustedLength - 1];
    for (const n of Array.from(mids)) { x *= n; }
    return x *= y;
  };
  // ok mult(1, 2,) is 2
  // ok mult(1, 2, 3,) is 6
  return ok(mult(10, ...Array.from((([1, 2, 3, 4, 5, 6])))) === 7200);
});


test('`@` and `this` should both be able to invoke a method', () => {
  const nonce = {};
  const fn = (arg) => eq(nonce, arg);
  fn.withAt = function () { return this(nonce); };
  fn.withThis = function () { return this(nonce); };
  fn.withAt();
  return fn.withThis();
});


test('Trying an implicit object call with a trailing function.', () => {
  let a = null;
  const meth = (arg, obj, func) => a = [obj.a, arg, func()].join(' ');
  meth('apple', { b: 1, a: 13 }, () => 'orange');
  return ok(a === '13 apple orange');
});


test("Ensure that empty functions don't return mistaken values.", () => {
  const obj = {
    func(param, ...rest) {
      this.param = param;
      [...this.rest] = Array.from(rest);
    },
  };
  ok(obj.func(101, 102, 103, 104) === undefined);
  ok(obj.param === 101);
  return ok(obj.rest.join(' ') === '102 103 104');
});


test('Passing multiple functions without paren-wrapping is legal, and should compile.', () => {
  const sum = (one, two) => one() + two();
  const result = sum(() => 7 + 9,
    () => 1 + 3);
  return ok(result === 20);
});


test('Implicit call with a trailing if statement as a param.', () => {
  const func = function () { return arguments[1]; };
  const result = func('one', false ? 100 : 13);
  return ok(result === 13);
});


test('Test more function passing:', () => {
  let sum = (one, two) => one() + two();

  let result = sum(() => 1 + 2,
    () => 2 + 1);
  ok(result === 6);

  sum = (a, b) => a + b;
  result = sum(1,
    2);
  return ok(result === 3);
});


test('Chained blocks, with proper indentation levels:', () => {
  const counter = {
    results: [],
    tick(func) {
      this.results.push(func());
      return this;
    },
  };
  counter
    .tick(() => 3).tick(() => 2).tick(() => 1);
  return arrayEq([3, 2, 1], counter.results);
});


test('This is a crazy one.', () => {
  const x = (obj, func) => func(obj);
  const ident = (x) => x;
  const result = x({ one: ident(1) }, (obj) => {
    const inner = ident(obj);
    return ident(inner);
  });
  return ok(result.one === 1);
});


test('More paren compilation tests:', () => {
  const reverse = (obj) => obj.reverse();
  return ok(reverse([1, 2].concat(3)).join(' ') === '3 2 1');
});


test('Test for inline functions with parentheses and implicit calls.', () => {
  const combine = (func, num) => func() * num;
  const result = combine((() => 1 + 2), 3);
  return ok(result === 9);
});


test('Test for calls/parens/multiline-chains.', () => {
  const f = (x) => x;
  const result = (f(1)).toString()
    .length;
  return ok(result === 1);
});


test('Test implicit calls in functions in parens:', () => {
  const result = (function (val) {
    [].push(val);
    return val;
  }(10));
  return ok(result === 10);
});


test('Ensure that chained calls with indented implicit object literals below are alright.', () => {
  let result = null;
  const obj = {
    method(val) { return this; },
    second(hash) { return result = hash.three; },
  };
  obj
    .method(
      101,
    ).second({
      one: {
        two: 2,
      },
      three: 3,
    });
  return eq(result, 3);
});


test('Test newline-supressed call chains with nested functions.', () => {
  const obj = { call() { return this; } };
  const func = function () {
    obj
      .call(() => one(two)).call(() => three(four));
    return 101;
  };
  return eq(func(), 101);
});


test('Implicit objects with number arguments.', () => {
  const func = (x, y) => y;
  const obj = { prop: func('a', 1) };
  return ok(obj.prop === 1);
});


test('Non-spaced unary and binary operators should cause a function call.', () => {
  const func = (val) => val + 1;
  ok((func(+5)) === 6);
  return ok((func(-5)) === -4);
});


test('Prefix unary assignment operators are allowed in parenless calls.', () => {
  const func = (val) => val + 1;
  let val = 5;
  return ok((func(--val)) === 5);
});

test('#855: execution context for `func arr...` should be `null`', () => {
  const contextTest = function () { return eq(this, (typeof window !== 'undefined' && window !== null) ? window : global); };
  const array = [];
  contextTest(array);
  contextTest.apply(null, array);
  return contextTest(...Array.from(array || []));
});

test('#904: Destructuring function arguments with same-named variables in scope', () => {
  let b; let c; let d; let
    nonce;
  const a = (b = (nonce = {}));
  const fn = function (...args) {
    let a; let
      b; [a, b] = Array.from(args[0]); return { a, b };
  };
  const result = fn([(c = {}), (d = {})]);
  eq(c, result.a);
  eq(d, result.b);
  eq(nonce, a);
  return eq(nonce, b);
});

test('Simple Destructuring function arguments with same-named variables in scope', () => {
  const x = 1;
  const f = function (...args) { let x; [x] = Array.from(args[0]); return x; };
  eq(f([2]), 2);
  return eq(x, 1);
});

test('caching base value', () => {
  var obj = {
    index: 0,
    0: { method() { return this === obj[0]; } },
  };
  return ok(obj[obj.index++].method(...Array.from([] || [])));
});


test('passing splats to functions', () => {
  arrayEq([0, 1, 2, 3, 4], id(id(...Array.from([0, 1, 2, 3, 4] || []))));
  const fn = function (a, b, ...rest) {
    const adjustedLength = Math.max(rest.length, 1); const c = rest.slice(0, adjustedLength - 1); const
      d = rest[adjustedLength - 1]; return [a, b, c, d];
  };
  const range = [0, 1, 2, 3];
  const [first, second, others, last] = Array.from(fn(...Array.from(range), 4, ...Array.from([5, 6, 7])));
  eq(0, first);
  eq(1, second);
  arrayEq([2, 3, 4, 5, 6], others);
  return eq(7, last);
});

test('splat variables are local to the function', () => {
  const outer = 'x';
  const clobber = (avar, ...outer) => outer;
  clobber('foo', 'bar');
  return eq('x', outer);
});


test('Issue 894: Splatting against constructor-chained functions.', () => {
  let x = null;
  class Foo {
    bar(y) { return x = y; }
  }
  new Foo().bar(...Array.from([101] || []));
  return eq(x, 101);
});


test('Functions with splats being called with too few arguments.', () => {
  let pen = null;
  const method = function (first, ...rest) {
    const adjustedLength = Math.max(rest.length, 2); const variable = rest.slice(0, adjustedLength - 2); const penultimate = rest[adjustedLength - 2]; const
      ultimate = rest[adjustedLength - 1];
    return pen = penultimate;
  };
  method(1, 2, 3, 4, 5, 6, 7, 8, 9);
  ok(pen === 8);
  method(1, 2, 3);
  ok(pen === 2);
  method(1, 2);
  return ok(pen === 2);
});


test('splats with super() within classes.', () => {
  class Parent {
    meth(...args) {
      return args;
    }
  }
  class Child extends Parent {
    meth() {
      const nums = [3, 2, 1];
      return super.meth(...Array.from(nums || []));
    }
  }
  return ok((new Child()).meth().join(' ') === '3 2 1');
});


test('#1011: passing a splat to a method of a number', () => {
  eq('1011', (11).toString(...Array.from([2] || [])));
  eq('1011', ((31)).toString(...Array.from([3] || [])));
  eq('1011', (69.0).toString(...Array.from([4] || [])));
  return eq('1011', (131.0).toString(...Array.from([5] || [])));
});


test('splats and the `new` operator: functions that return `null` should construct their instance', () => {
  let constructor;
  const args = [];
  const child = new (constructor = () => null)(...Array.from(args || []));
  return ok(child instanceof constructor);
});

test('splats and the `new` operator: functions that return functions should construct their return value', () => {
  let constructor;
  const args = [];
  const fn = function () {};
  const child = new (constructor = () => fn)(...Array.from(args || []));
  ok(!(child instanceof constructor));
  return eq(fn, child);
});

test('implicit return', () => eq(ok, new (function () {
  return ok;
  /* Should `return` implicitly   */
  /* even with trailing comments. */
})()));


test('implicit returns with multiple branches', () => {
  const nonce = {};
  const fn = function () {
    if (false) {
      for (const a of Array.from(b)) {
        if (d) { return c; }
      }
    } else {
      return nonce;
    }
  };
  return eq(nonce, fn());
});


test('implicit returns with switches', () => {
  const nonce = {};
  const fn = function () {
    switch (nonce) {
      case nonce: return nonce;
      default: return undefined;
    }
  };
  return eq(nonce, fn());
});


test('preserve context when generating closure wrappers for expression conversions', () => {
  const nonce = {};
  const obj = {
    property: nonce,
    method() {
      return this.result = (() => {
        if (false) {
          return 10;
        }
        'a';
        'b';
        return this.property;
      })();
    },
  };
  eq(nonce, obj.method());
  return eq(nonce, obj.property);
});


test("don't wrap 'pure' statements in a closure", () => {
  const nonce = {};
  const items = [0, 1, 2, 3, nonce, 4, 5];
  const fn = function (items) {
    for (const item of Array.from(items)) {
      if (item === nonce) { return item; }
    }
  };
  return eq(nonce, fn(items));
});


test('usage of `new` is careful about where the invocation parens end up', () => {
  eq('object', typeof new ((() => { try { return Array; } catch (error) {} })())());
  return eq('object', typeof new (((() => (function () {})))())());
});


test('implicit call against control structures', () => {
  let error;
  let result = null;
  const save = (obj) => result = obj;

  save((() => {
    switch (id(false)) {
      case true:
        return 'true';
      case false:
        return 'false';
    }
  })());

  eq(result, 'false');

  save(id(false)
    ? 'false'
    : 'true');

  eq(result, 'true');

  save(!id(false)
    ? 'true'
    : 'false');

  eq(result, 'true');

  save((() => {
    try {
      return doesnt(exist);
    } catch (error1) {
      error = error1;
      return 'caught';
    }
  })());

  eq(result, 'caught');

  save((() => { try { return doesnt(exist); } catch (error2) { error = error2; return 'caught2'; } })());

  return eq(result, 'caught2');
});


test('#1420: things like `(fn() ->)`; there are no words for this one', () => {
  const fn = () => (f) => f();
  const nonce = {};
  return eq(nonce, (fn()(() => nonce)));
});

test("#1416: don't omit one 'new' when compiling 'new new'", () => {
  const nonce = {};
  const obj = new (new (function () {
    return () => ({
      prop: nonce,
    });
  })())();
  return eq(obj.prop, nonce);
});

test("#1416: don't omit one 'new' when compiling 'new new fn()()'", () => {
  const nonce = {};
  const argNonceA = {};
  const argNonceB = {};
  const fn = (a) => (b) => ({
    a,
    b,
    prop: nonce,
  });
  const obj = new (new fn(argNonceA))(argNonceB);
  eq(obj.prop, nonce);
  eq(obj.a, argNonceA);
  return eq(obj.b, argNonceB);
});

test('#1840: accessing the `prototype` after function invocation should compile', () => {
  doesNotThrow(() => CoffeeScript.compile('fn()::prop'));

  const nonce = {};
  class Test {
    static initClass() {
      this.prototype.id = nonce;
    }
  }
  Test.initClass();

  const dotAccess = () => Test.prototype;
  const protoAccess = () => Test;

  eq(dotAccess().id, nonce);
  return eq(protoAccess().prototype.id, nonce);
});

test("#960: improved 'do'", () => {
  let func;
  (((nonExistent) => eq(nonExistent, 'one')))('one');

  const overridden = 1;
  (((overridden) => eq(overridden, 2)))(2);

  const two = 2;
  (function (one, two, three) {
    eq(one, 1);
    eq(two, 2);
    return eq(three, 3);
  }(1, two, 3));

  const ret = (func = function (two) {
    eq(two, 2);
    return func;
  })(two);
  return eq(ret, func);
});

test('#2617: implicit call before unrelated implicit object', () => {
  const pass = () => true;

  const result = pass(1)
    ? { one: 1 } : undefined;
  return eq(result.one, 1);
});

test('#2292, b: f (z),(x)', () => {
  const f = (x, y) => y;
  const one = 1;
  const two = 2;
  const o = { b: f((one), (two)) };
  return eq(o.b, 2);
});

test('#2297, Different behaviors on interpreting literal', () => {
  const foo = (x, y) => y;
  const bar = { baz: foo(100, true) };

  eq(bar.baz, true);

  const qux = (x) => x;
  const quux = qux({ corge: foo(100, true) });

  eq(quux.corge, true);

  const xyzzy = {
    e: 1,
    f: foo({
      a: 1,
      b: 2,
    },
    {
      one: 1,
      two: 2,
      three: 3,
    }),
    g: {
      a: 1,
      b: 2,
      c: foo(2, {
        one: 1,
        two: 2,
        three: 3,
      }),
      d: 3,
    },
    four: 4,
    h: foo({ one: 1, two: 2, three: { three: { three: 3 } } },
      2),
  };

  eq(xyzzy.f.two, 2);
  eq(xyzzy.g.c.three, 3);
  eq(xyzzy.four, 4);
  return eq(xyzzy.h, 2);
});

test('#2715, Chained implicit calls', () => {
  const first = (x) => x;
  const second = (x, y) => y;

  const foo = first(first({ one: 1 }));
  eq(foo.one, 1);

  const bar = first(second(
    { one: 1 }, 2,
  ));
  eq(bar, 2);

  const baz = first(second(
    { one: 1 },
    2,
  ));
  return eq(baz, 2);
});

test('Implicit calls and new', () => {
  const first = (x) => x;
  const foo = function (x) {
    this.x = x;
  };
  const bar = first(new foo(first(1)));
  eq(bar.x, 1);

  const third = (x, y, z) => z;
  const baz = first(new foo(new foo(third({
    one: 1,
    two: 2,
  },
  1,
  { three: 3 },
  2))));
  return eq(baz.x.x.three, 3);
});

test('Loose tokens inside of explicit call lists', () => {
  const first = (x) => x;
  const second = (x, y) => y;
  const one = 1;

  const foo = second(one,
    2);
  eq(foo, 2);

  const bar = first(first({ one: 1 }));
  return eq(bar.one, 1);
});

test("Non-callable literals shouldn't compile", () => {
  cantCompile('1(2)');
  cantCompile('1 2');
  cantCompile('/t/(2)');
  cantCompile('/t/ 2');
  cantCompile('///t///(2)');
  cantCompile('///t/// 2');
  cantCompile("''(2)");
  cantCompile("'' 2");
  cantCompile('""(2)');
  cantCompile('"" 2');
  cantCompile('""""""(2)');
  cantCompile('"""""" 2');
  cantCompile('{}(2)');
  cantCompile('{} 2');
  cantCompile('[](2)');
  cantCompile('[] 2');
  cantCompile('[2..9] 2');
  cantCompile('[2..9](2)');
  cantCompile('[1..10][2..9] 2');
  return cantCompile('[1..10][2..9](2)');
});

test('implicit invocation with implicit object literal', () => {
  const f = (obj) => eq(1, obj.a);

  f({ a: 1 });
  let obj = f
    ? { a: 2 }
    : { a: 1 };
  eq(2, obj.a);

  f({ a: 1 });
  obj = f
    ? { a: 2 }
    : { a: 1 };
  eq(2, obj.a);

  // #3935: Implicit call when the first key of an implicit object has interpolation.
  const a = 'a';
  f({ [a]: 1 });
  obj = f
    ? { [a]: 2 }
    : { [a]: 1 };
  return eq(2, obj.a);
});
