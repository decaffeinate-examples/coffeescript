/* eslint-disable
    consistent-return,
    func-names,
    guard-for-in,
    no-constant-condition,
    no-multi-assign,
    no-plusplus,
    no-prototype-builtins,
    no-restricted-syntax,
    no-return-assign,
    no-self-compare,
    no-shadow,
    no-undef,
    no-unused-expressions,
    no-unused-vars,
    prefer-rest-params,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Object Literals
// ---------------

// TODO: refactor object literal tests
// TODO: add indexing and method invocation tests: {a}['a'] is a, {a}.a()

const trailingComma = { k1: 'v1', k2: 4, k3() { return true; } };
ok(trailingComma.k3() && (trailingComma.k2 === 4) && (trailingComma.k1 === 'v1'));

ok({ a(num) { return num === 10; } }.a(10));

const moe = {
  name: 'Moe',
  greet(salutation) {
    return `${salutation} ${this.name}`;
  },
  hello() {
    return this.greet('Hello');
  },
  10: 'number',
};
ok(moe.hello() === 'Hello Moe');
ok(moe[10] === 'number');
moe.hello = function () {
  return this.greet('Hello');
};
ok(moe.hello() === 'Hello Moe');

let obj = {
  is() { return true; },
  not() { return false; },
};
ok(obj.is());
ok(!obj.not());

({
  /* Top-level object literal... */
  obj: 1,
  /* ...doesn't break things. */
});

// Object literals should be able to include keywords.
obj = { class: 'höt' };
obj.function = 'dog';
ok((obj.class + obj.function) === 'hötdog');

// Implicit objects as part of chained calls.
const pluck = (x) => x.a;
eq(100, pluck(pluck(pluck({ a: { a: { a: 100 } } }))));


test('YAML-style object literals', () => {
  obj = {
    a: 1,
    b: 2,
  };
  eq(1, obj.a);
  eq(2, obj.b);

  const config = {
    development: {
      server: 'localhost',
      timeout: 10,
    },

    production: {
      server: 'dreamboat',
      timeout: 1000,
    },
  };

  ok(config.development.server === 'localhost');
  ok(config.production.server === 'dreamboat');
  ok(config.development.timeout === 10);
  return ok(config.production.timeout === 1000);
});

obj = {
  a: 1,
  b: 2,
};
ok(obj.a === 1);
ok(obj.b === 2);

// Implicit objects nesting.
obj = {
  options: {
    value: true,
  },
  fn() {
    ({});
    return null;
  },
};
ok(obj.options.value === true);
ok(obj.fn() === null);

// Implicit objects with wacky indentation:
obj = {
  reverse(obj) {
    return Array.prototype.reverse.call(obj);
  },
  abc() {
    return this.reverse(
      this.reverse(this.reverse(['a', 'b', 'c'].reverse())),
    );
  },
  one: [1, 2,
    { a: 'b' },
    3, 4],
  red: {
    orange: {
      yellow: {
        green: 'blue',
      },
    },
    indigo: 'violet',
  },
  misdent: [[],
    [],
    [],
    []],
};
ok(obj.abc().join(' ') === 'a b c');
ok(obj.one.length === 5);
ok(obj.one[4] === 4);
ok(obj.one[2].a === 'b');
ok(((() => {
  const result1 = [];
  for (const key in obj.red) {
    result1.push(key);
  }
  return result1;
})()).length === 2);
ok(obj.red.orange.yellow.green === 'blue');
ok(obj.red.indigo === 'violet');
ok(obj.misdent.toString() === ',,,');

// 542: Objects leading expression statement should be parenthesized.
({ f() { return ok(true); } }.f() + 1);

// String-keyed objects shouldn't suppress newlines.
let one = { '>!': 3 };
({ six() { return 10; } });
ok(!one.six);

// Shorthand objects with property references.
obj = {
  /* comment one */
  /* comment two */
  one: 1,
  two: 2,
  object() { return { one: this.one, two: this.two }; },
  list() { return [this.one, this.two]; },
};
let result = obj.object();
eq(result.one, 1);
eq(result.two, 2);
eq(result.two, obj.list()[1]);

let third = (a, b, c) => c;
obj = {
  one: 'one',
  two: third('one', 'two', 'three'),
};
ok(obj.one === 'one');
ok(obj.two === 'three');

test('invoking functions with implicit object literals', () => {
  let b;
  const generateGetter = (prop) => (obj) => obj[prop];
  const getA = generateGetter('a');
  const getArgs = function () { return arguments; };
  const a = (b = 30);

  result = getA({ a: 10 });
  eq(10, result);

  result = getA({ a: 20 });
  eq(20, result);

  result = getA(a,
    { b: 1 });
  eq(undefined, result);

  result = getA({
    b: 1,
    a: 43,
  });
  eq(43, result);

  result = getA({ b: 1 },
    { a: 62 });
  eq(undefined, result);

  result = getA(
    { b: 1 },
    a,
  );
  eq(undefined, result);

  result = getA({
    a: {
      b: 2,
    },
    b: 1,
  });
  eq(2, result.b);

  result = getArgs(
    { a: 1 },
    b,
    { c: 1 },
  );
  ok(result.length === 3);
  ok(result[2].c === 1);

  result = getA({ b: 13, a: 42 }, 2);
  eq(42, result);

  result = getArgs({ a: 1 }, (1 + 1));
  ok(result[1] === 2);

  result = getArgs({ a: 1 }, b);
  ok(result.length === 2);
  ok(result[1] === 30);

  result = getArgs({ a: 1 }, b, { b: 1 }, a);
  ok(result.length === 4);
  ok(result[2].b === 1);

  return throws(() => CoffeeScript.compile('a = b:1, c'));
});

test('some weird indentation in YAML-style object literals', () => {
  const two = (a, b) => b;
  obj = two(1, {
    1: 1,
    a: {
      b() {
        return fn(c,
          { d: e });
      },
    },
    f: 1,
  });
  return eq(1, obj[1]);
});

test('#1274: `{} = a()` compiles to `false` instead of `a()`', () => {
  let a = false;
  const fn = () => a = true;
  const obj1 = fn();
  return ok(a);
});

test('#1436: `for` etc. work as normal property names', () => {
  obj = {};
  eq(false, obj.hasOwnProperty('for'));
  obj.for = 'foo' in obj;
  return eq(true, obj.hasOwnProperty('for'));
});

test('#2706, Un-bracketed object as argument causes inconsistent behavior', () => {
  const foo = (x, y) => y;
  const bar = { baz: true };

  return eq(true, foo({ x: 1 }, bar.baz));
});

test('#2608, Allow inline objects in arguments to be followed by more arguments', () => {
  const foo = (x, y) => y;

  return eq(true, foo({ x: 1, y: 2 }, true));
});

test('#2308, a: b = c:1', () => {
  let b;
  const foo = { a: (b = { c: true }) };
  eq(b.c, true);
  return eq(foo.a.c, true);
});

test('#2317, a: b c: 1', () => {
  const foo = (x) => x;
  const bar = { a: foo({ c: true }) };
  return eq(bar.a.c, true);
});

test('#1896, a: func b, {c: d}', () => {
  const first = (x) => x;
  const second = (x, y) => y;
  third = (x, y, z) => z;

  one = 1;
  const two = 2;
  const three = 3;
  const four = 4;

  const foo = { a: second(one, { c: two }) };
  eq(foo.a.c, two);

  const bar = { a: second(one, { c: two }) };
  eq(bar.a.c, two);

  const baz = { a: second(one, { c: two }, { e: first(first({ h: three })) }) };
  eq(baz.a.c, two);

  const qux = { a: third(one, { c: two }, { e: first(first({ h: three })) }) };
  eq(qux.a.e.h, three);

  const quux = { a: third(one, { c: two }, { e: first(three), h: four }) };
  eq(quux.a.e, three);
  eq(quux.a.h, four);

  const corge = { a: third(one, { c: two }, { e: second(three, { h: four }) }) };
  return eq(corge.a.e.h, four);
});

test('Implicit objects, functions and arrays', () => {
  const first = (x) => x;
  const second = (x, y) => y;

  const foo = [
    1, {
      one: 1,
      two: 2,
      three: 3,
      more: {
        four: 4,
        five: 5,
        six: 6,
      },
    },
    2, 3, 4,
    5];
  eq(foo[2], 2);
  eq(foo[1].more.six, 6);

  const bar = [
    1,
    first(first(first(second(1,
      { one: 1, twoandthree: { twoandthree: { two: 2, three: 3 } } },
      2)))),
    2, {
      one: 1,
      two: 2,
      three: first(second(() => false,
        () => 3)),
    },
    3,
    4];
  eq(bar[2], 2);
  eq(bar[1].twoandthree.twoandthree.two, 2);
  eq(bar[3].three(), 3);
  return eq(bar[4], 3);
});

test('#2549, Brace-less Object Literal as a Second Operand on a New Line', () => {
  const foo = false || {
    one: 1,
    two: 2,
    three: 3,
  };
  eq(foo.one, 1);

  const bar = true && { one: 1 };
  eq(bar.one, 1);

  const baz = null != null ? null : {
    one: 1,
    two: 2,
  };
  return eq(baz.two, 2);
});

test('#2757, Nested', () => {
  const foo = {
    bar: {
      one: 1,
    },
  };
  eq(foo.bar.one, 1);

  const baz = {
    qux: {
      one: 1,
    },
    corge: {
      two: 2,
      three: { three: { three: 3 } },
    },
    xyzzy: {
      thud: {
        four: {
          four: 4,
        },
      },
      five: 5,
    },
  };

  eq(baz.qux.one, 1);
  eq(baz.corge.three.three.three, 3);
  eq(baz.xyzzy.thud.four.four, 4);
  return eq(baz.xyzzy.five, 5);
});

test('#1865, syntax regression 1.1.3', () => {
  const foo = (x, y) => y;

  const bar = {
    a: foo((() => {}),
      { c: true }),
  };
  eq(bar.a.c, true);

  const baz = { a: foo((() => {}), { c: true }) };
  return eq(baz.a.c, true);
});


test('#1322: implicit call against implicit object with block comments', () => (function (obj, arg) {
  eq(obj.x * obj.y, 6);
  return ok(!arg);
}({
  /*
  x
  */
  x: 2,
  /* y */
  y: 3,
})));

test('#1513: Top level bare objs need to be wrapped in parens for unary and existence ops', () => {
  doesNotThrow(() => CoffeeScript.run('{}?', { bare: true }));
  return doesNotThrow(() => CoffeeScript.run('{}.a++', { bare: true }));
});

test('#1871: Special case for IMPLICIT_END in the middle of an implicit object', () => {
  result = 'result';
  const ident = (x) => x;

  if (false) { result = ident({ one: 1 }); }

  eq(result, 'result');

  result = ident({
    one: 1,
    two: ([1, 2, 3].map((i) => 2)),
  });

  return eq(result.two.join(' '), '2 2 2');
});

test('#1871: implicit object closed by IMPLICIT_END in implicit returns', () => {
  const ob = (function () {
    if (false) { return { a: 1 }; }
  }());
  eq(ob, undefined);

  // instead these return an object
  let func = () => ({
    key:
      ([1, 2, 3]),
  });

  eq(func().key.join(' '), '1 2 3');

  func = () => ({
    key: (([1, 2, 3])),
  });

  return eq(func().key.join(' '), '1 2 3');
});

test('#1961, #1974, regression with compound assigning to an implicit object', () => {
  obj = null;

  if (obj == null) {
    obj = {
      one: 1,
      two: 2,
    };
  }

  eq(obj.two, 2);

  obj = null;

  if (!obj) {
    obj = {
      three: 3,
      four: 4,
    };
  }

  return eq(obj.four, 4);
});

test("#2207: Immediate implicit closes don't close implicit objects", () => {
  const func = () => ({
    key: [1, 2, 3],
  });

  return eq(func().key.join(' '), '1 2 3');
});

test('#3216: For loop declaration as a value of an implicit object', () => {
  let i; let
    v;
  const test = [0, 1, 2];
  const ob = {
    a: (() => {
      const result2 = [];
      for (i = 0; i < test.length; i++) {
        v = test[i];
        result2.push(i);
      }
      return result2;
    })(),
    b: (() => {
      const result3 = [];
      for (i = 0; i < test.length; i++) {
        v = test[i];
        result3.push(i);
      }
      return result3;
    })(),
    c: (() => {
      const result4 = [];
      for (let j = 0; j < test.length; j++) {
        v = test[j];
        result4.push(v);
      }
      return result4;
    })(),
    d: (() => {
      const result5 = [];
      for (v of Array.from(test)) {
        if (true) {
          result5.push(v);
        }
      }
      return result5;
    })(),
  };
  arrayEq(ob.a, test);
  arrayEq(ob.b, test);
  arrayEq(ob.c, test);
  return arrayEq(ob.d, test);
});

test('inline implicit object literals within multiline implicit object literals', () => {
  const x = {
    a: { aa: 0 },
    b: 0,
  };
  eq(0, x.b);
  return eq(0, x.a.aa);
});

test('object keys with interpolations', () => {
  // Simple cases.
  let ref;
  const a = 'a';
  obj = { [a]: true };
  eq(obj.a, true);
  obj = { [a]: true };
  eq(obj.a, true);
  obj = { [`${a}`]: `${a}` };
  eq(obj.a, 'a');
  obj = { [`${5}`]: `${5}` };
  eq(obj[5], '5'); // Note that the value is a string, just like the key.

  // Commas in implicit object.
  obj = { a: 1, b: 2 };
  deepEqual(obj, { a: 1, b: 2 });
  obj = { a: 1, b: 2 };
  deepEqual(obj, { a: 1, b: 2 });
  obj = { a: 1, b: 2 };
  deepEqual(obj, { a: 1, b: 2 });

  // Commas in explicit object.
  obj = { a: 1, b: 2 };
  deepEqual(obj, { a: 1, b: 2 });
  obj = { a: 1, b: 2 };
  deepEqual(obj, { a: 1, b: 2 });
  obj = { a: 1, b: 2 };
  deepEqual(obj, { a: 1, b: 2 });

  // Commas after key with interpolation.
  obj = { a: true };
  eq(obj.a, true);
  obj = {
    a: 1,
    b: 2,
    /* herecomment */
    c: 3,
  };
  deepEqual(obj, { a: 1, b: 2, c: 3 });
  obj = {
    a: 1,
    b: 2,
    /* herecomment */
    c: 3,
  };
  deepEqual(obj, { a: 1, b: 2, c: 3 });
  obj = {
    a: 1,
    b: 2,
    /* herecomment */
    c: 3,
    d: 4,
  };
  deepEqual(obj, {
    a: 1, b: 2, c: 3, d: 4,
  });

  // Key with interpolation mixed with `@prop`.
  deepEqual((function () { return { a: this.a, b: 2 }; }).call({ a: 1 }), { a: 1, b: 2 });

  // Evaluate only once.
  let count = 0;
  const b = function () { count++; return 'b'; };
  obj = { [ref = `${b()}`]: ref };
  eq(obj.b, 'b');
  eq(count, 1);

  // Evaluation order.
  const arr = [];
  obj = {
    a: arr.push(1),
    b: arr.push(2),
    c: arr.push(3),
    d: arr.push(4),
    e: arr.push(5),
    f: arr.push(6),
    g: arr.push(7),
  };
  arrayEq(arr, [1, 2, 3, 4, 5, 6, 7]);
  deepEqual(obj, {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7,
  });

  // Object starting with dynamic key.
  obj = {
    a: 1,
    b: 2,
  };
  deepEqual(obj, { a: 1, b: 2 });

  // Comments in implicit object.
  obj = {
    /* leading comment */
    a: 1,

    /* middle */

    b: 2,
    // regular comment
    c: 3,
    /* foo */
    d: 4,
    e: 5,
  };
  deepEqual(obj, {
    a: 1, b: 2, c: 3, d: 4, e: 5,
  });

  // Comments in explicit object.
  obj = {
    /* leading comment */
    a: 1,

    /* middle */

    b: 2,
    // regular comment
    c: 3,
    /* foo */
    d: 4,
    e: 5,
  };
  deepEqual(obj, {
    a: 1, b: 2, c: 3, d: 4, e: 5,
  });

  // A more complicated case.
  obj = {
    interpolated: {
      nested: { 123: 456 },
    },
  };
  return deepEqual(obj, {
    interpolated: {
      nested: {
        123: 456,
      },
    },
  });
});

test('#4324: Shorthand after interpolated key', () => {
  const a = 2;
  obj = { 1: 1, a };
  eq(1, obj[1]);
  return eq(2, obj.a);
});

test('#1263: Braceless object return', () => {
  const fn = () => ({
    a: 1,
    b: 2,
    c() { return 3; },
  });

  obj = fn();
  eq(1, obj.a);
  eq(2, obj.b);
  return eq(3, obj.c());
});
