/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Function Literals
// -----------------

// TODO: add indexing and method invocation tests: (->)[0], (->).call()

// * Function Definition
// * Bound Function Definition
// * Parameter List Features
//   * Splat Parameters
//   * Context (@) Parameters
//   * Parameter Destructuring
//   * Default Parameters

// Function Definition

const x = 1;
const y = {};
y.x = () => 3;
ok(x === 1);
ok(typeof(y.x) === 'function');
ok(y.x instanceof Function);
ok(y.x() === 3);

// The empty function should not cause a syntax error.
(function() {});
(function() {});

// Multiple nested function declarations mixed with implicit calls should not
// cause a syntax error.
(one => two => three(four, five => six(seven, eight, function(nine) {})));

// with multiple single-line functions on the same line.
let func = x => x => x => x;
ok(func(1)(2)(3) === 3);

// Make incorrect indentation safe.
func = function() {
  const obj = {
          key: 10
        };
  return obj.key - 5;
};
eq(func(), 5);

// Ensure that functions with the same name don't clash with helper functions.
const del = () => 5;
ok(del() === 5);


// Bound Function Definition

let obj = {
  bound() {
    return (() => this)();
  },
  unbound() {
    return (function() { return this; })();
  },
  nested() {
    return (() => {
      return (() => {
        return (() => this)();
      }
      )();
    }
    )();
  }
};
eq(obj, obj.bound());
ok(obj !== obj.unbound());
eq(obj, obj.nested());


test("even more fancy bound functions", function() {
  obj = {
    one() {
      return (() => {
        return this.two();
      })();
    },
    two() {
      return (() => {
        return (() => {
          return (() => {
            return this.three;
          })();
        })();
      })();
    },
    three: 3
  };

  return eq(obj.one(), 3);
});


test("self-referencing functions", function() {
  var changeMe = () => changeMe = 2;

  changeMe();
  return eq(changeMe, 2);
});

test("#2009: don't touch `` `this` ``", function() {
  const nonceA = {};
  const nonceB = {};
  let fn = null;
  (function() {
    return fn = () => (this === nonceA) && (this === nonceB);
  }).call(nonceA);
  return ok(fn.call(nonceB));
});


// Parameter List Features

test("splats", function() {
  arrayEq([0, 1, 2], ((((...splat) => splat))(0, 1, 2)));
  arrayEq([2, 3], ((((_, _1, ...splat) => splat))(0, 1, 2, 3)));
  arrayEq([0, 1], ((function(...args) { const adjustedLength = Math.max(args.length, 2), splat = args.slice(0, adjustedLength - 2), _ = args[adjustedLength - 2], _1 = args[adjustedLength - 1]; return splat; })(0, 1, 2, 3)));
  return arrayEq([2], ((function(_, _1, ...rest) { const adjustedLength = Math.max(rest.length, 1), splat = rest.slice(0, adjustedLength - 1), _2 = rest[adjustedLength - 1]; return splat; })(0, 1, 2, 3)));
});

test("destructured splatted parameters", function() {
  const arr = [0,1,2];
  const splatArray = function(...args) { const [...a] = Array.from(args[0]); return a; };
  const splatArrayRest = function(...args) { const [...a] = Array.from(args[0]), b = args.slice(1, args.length - 0); arrayEq(a,b); return b; };
  arrayEq(splatArray(arr), arr);
  return arrayEq(splatArrayRest(arr,0,1,2), arr);
});

test("@-parameters: automatically assign an argument's value to a property of the context", function() {
  let context;
  const nonce = {};

  (function(prop) {
    this.prop = prop;
    }).call((context = {}), nonce);
  eq(nonce, context.prop);

  // allow splats along side the special argument
  (function(...args) {
    let adjustedLength, splat;
    adjustedLength = Math.max(args.length, 1),
      splat = args.slice(0, adjustedLength - 1),
      this.prop = args[adjustedLength - 1];
    }).apply((context = {}), [0, 0, nonce]);
  eq(nonce, context.prop);

  // allow the argument itself to be a splat
  (function(...args) {
    [...this.prop] = Array.from(args);
    }).call((context = {}), 0, nonce, 0);
  eq(nonce, context.prop[1]);

  // the argument should not be able to be referenced normally
  let code = '((@prop) -> prop).call {}';
  doesNotThrow(() => CoffeeScript.compile(code));
  throws((() => CoffeeScript.run(code)), ReferenceError);
  code = '((@prop) -> _at_prop).call {}';
  doesNotThrow(() => CoffeeScript.compile(code));
  return throws((() => CoffeeScript.run(code)), ReferenceError);
});

test("@-parameters and splats with constructors", function() {
  const a = {};
  const b = {};
  class Klass {
    constructor(first, ...rest) {
      let adjustedLength, splat;
      this.first = first;
      adjustedLength = Math.max(rest.length, 1),
        splat = rest.slice(0, adjustedLength - 1),
        this.last = rest[adjustedLength - 1];
    }
  }

  obj = new Klass(a, 0, 0, b);
  eq(a, obj.first);
  return eq(b, obj.last);
});

test("destructuring in function definition", function() {
  (function(...args) {
    const array = args.slice(0, args.length - 0),
          obj1 = array[0],
          [b] = Array.from(obj1.a),
          {
            c
          } = obj1;
    eq(1, b);
    return eq(2, c);
  })({a: [1], c: 2});

  const context = {};
  (function(...args) {
    let array, array1, b, c, e, obj1, val, val1;
    array = args.slice(0, args.length - 0),
      obj1 = array[0],
      array1 = obj1.a,
      b = array1[0],
      val = array1[1],
      c = val != null ? val : 2,
      this.d = obj1.d,
      val1 = obj1.e,
      e = val1 != null ? val1 : 4;
    eq(1, b);
    eq(2, c);
    eq(this.d, 3);
    eq(context.d, 3);
    return eq(e, 4);
  }).call(context, {a: [1], d: 3});

  (function(...args) {
    const obj1 = args[0], val = obj1.a, aa = val != null ? val : 1, val1 = obj1.b, bb = val1 != null ? val1 : 2;
    eq(5, aa);
    return eq(2, bb);
  })({a: 5});

  const ajax = function(url, ...rest) {
    const obj1 = rest[0], val = obj1.async, async = val != null ? val : true, val1 = obj1.beforeSend, beforeSend = val1 != null ? val1 : function() {}, val2 = obj1.cache, cache = val2 != null ? val2 : true, val3 = obj1.method, method = val3 != null ? val3 : 'get', val4 = obj1.data, data = val4 != null ? val4 : {};
    return {url, async, beforeSend, cache, method, data};
  };

  const fn = function() {};
  return deepEqual(ajax('/home', {beforeSend: fn, cache: null, method: 'post'}), {
    url: '/home', async: true, beforeSend: fn, cache: true, method: 'post', data: {}
  });
});

test("#4005: `([a = {}]..., b) ->` weirdness", function() {
  const fn = function(...args) { const adjustedLength = Math.max(args.length, 1), array = args.slice(0, adjustedLength - 1), val = array[0], a = val != null ? val : {}, b = args[adjustedLength - 1]; return [a, b]; };
  return deepEqual(fn(5), [{}, 5]);
});

test("default values", function() {
  const nonceA = {};
  const nonceB = {};
  const a = function(_,_1,arg) { if (arg == null) { arg = nonceA; } return arg; };
  eq(nonceA, a());
  eq(nonceA, a(0));
  eq(nonceB, a(0,0,nonceB));
  eq(nonceA, a(0,0,undefined));
  eq(nonceA, a(0,0,null));
  eq(false , a(0,0,false));
  eq(nonceB, a(undefined,undefined,nonceB,undefined));
  const b = function(_,arg,_1,_2) { if (arg == null) { arg = nonceA; } return arg; };
  eq(nonceA, b());
  eq(nonceA, b(0));
  eq(nonceB, b(0,nonceB));
  eq(nonceA, b(0,undefined));
  eq(nonceA, b(0,null));
  eq(false , b(0,false));
  eq(nonceB, b(undefined,nonceB,undefined));
  const c = function(arg,_,_1) { if (arg == null) { arg = nonceA; } return arg; };
  eq(nonceA, c());
  eq(0, c(0));
  eq(nonceB, c(nonceB));
  eq(nonceA, c(undefined));
  eq(nonceA, c(null));
  eq(false , c(false));
  return eq(nonceB, c(nonceB,undefined,undefined));
});

test("default values with @-parameters", function() {
  const a = {};
  const b = {};
  obj = {f(q, p) { if (q == null) { q = a; } if (p == null) { p = b; } this.p = p; return q; }};
  eq(a, obj.f());
  return eq(b, obj.p);
});

test("default values with splatted arguments", function() {
  const withSplats = function(a, ...rest) { if (a == null) { a = 2; } const adjustedLength = Math.max(rest.length, 2), b = rest.slice(0, adjustedLength - 2), val = rest[adjustedLength - 2], c = val != null ? val : 3, val1 = rest[adjustedLength - 1], d = val1 != null ? val1 : 5; return a * (b.length + 1) * c * d; };
  eq(30, withSplats());
  eq(15, withSplats(1));
  eq(5, withSplats(1,1));
  eq(1, withSplats(1,1,1));
  return eq(2, withSplats(1,1,1,1));
});

test("#156: parameter lists with expansion", function() {
  const expandArguments = function(...args) {
    const first = args[0], lastButOne = args[args.length - 2], last = args[args.length - 1];
    eq(1, first);
    eq(4, lastButOne);
    return last;
  };
  eq(5, expandArguments(1, 2, 3, 4, 5));

  throws((() => CoffeeScript.compile("(..., a, b...) ->")), null, "prohibit expansion and a splat");
  return throws((() => CoffeeScript.compile("(...) ->")),          null, "prohibit lone expansion");
});

test("#156: parameter lists with expansion in array destructuring", function() {
  const expandArray = function(...args) {
    const array = args[args.length - 1], last = array[array.length - 1];
    return last;
  };
  return eq(3, expandArray(1, 2, 3, [1, 2, 3]));
});

test("#3502: variable definitions and expansion", function() {
  let b;
  const a = (b = 0);
  const f = function(...args) { let a, b; a = args[0], b = args[args.length - 1]; return [a, b]; };
  arrayEq([1, 5], f(1, 2, 3, 4, 5));
  eq(0, a);
  return eq(0, b);
});

test("variable definitions and splat", function() {
  let b;
  const a = (b = 0);
  const f = function(a, ...rest) { let adjustedLength, middle;
  let b; adjustedLength = Math.max(rest.length, 1),
    middle = rest.slice(0, adjustedLength - 1),
    b = rest[adjustedLength - 1]; return [a, middle, b]; };
  arrayEq([1, [2, 3, 4], 5], f(1, 2, 3, 4, 5));
  eq(0, a);
  return eq(0, b);
});

test("default values with function calls", () => doesNotThrow(() => CoffeeScript.compile("(x = f()) ->")));

test("arguments vs parameters", function() {
  doesNotThrow(() => CoffeeScript.compile("f(x) ->"));
  const f = g => g();
  return eq(5, f(x => 5));
});

test("reserved keyword as parameters", function() {
  let c;
  let f = function(_case, case1) { this.case = case1; return [_case, this.case]; };
  let [a, b] = Array.from(f(1, 2));
  eq(1, a);
  eq(2, b);

  f = function(case1, ..._case) { this.case = case1; return [this.case, ...Array.from(_case)]; };
  [a, b, c] = Array.from(f(1, 2, 3));
  eq(1, a);
  eq(2, b);
  return eq(3, c);
});

test("reserved keyword at-splat", function() {
  const f = function(...args) { [...this.case] = Array.from(args); return this.case; };
  const [a, b] = Array.from(f(1, 2));
  eq(1, a);
  return eq(2, b);
});

test("#1574: Destructuring and a parameter named _arg", function() {
  const f = ({a, b}, _arg, _arg1) => [a, b, _arg, _arg1];
  return arrayEq([1, 2, 3, 4], f({a: 1, b: 2}, 3, 4));
});

test("#1844: bound functions in nested comprehensions causing empty var statements", function() {
  var a = ([0].map((b) => (() => {
    const result = [];
    for (a of [0]) {       result.push((() => {}));
    }
    return result;
  })()));
  return eq(1, a.length);
});

test("#1859: inline function bodies shouldn't modify prior postfix ifs", function() {
  const list = [1, 2, 3];
  if (list.some(x => x === 2)) { return ok(true); }
});

test("#2258: allow whitespace-style parameter lists in function definitions", function() {
  func = (a, b, c) => c;
  eq(func(1, 2, 3), 3);

  func = (a, b, c) => b;
  return eq(func(1, 2, 3), 2);
});

test("#2621: fancy destructuring in parameter lists", function() {
  func = function(...args) {
    const obj1 = args[0],
          { key1 } = obj1.prop1,
          obj2 = obj1.prop2,
          {
            key2
          } = obj2,
          [a, b, c] = Array.from(obj2.key3);
    eq(key2, 'key2');
    return eq(a, 'a');
  };

  return func({prop1: {key1: 'key1'}, prop2: {key2: 'key2', key3: ['a', 'b', 'c']}});
});

test("#1435 Indented property access", function() {
  var rec = () => ({
    rec
  });

  return eq(1, (function() {
    rec()
      .rec(() => rec()
      .rec(() => rec.rec()).rec());
    return 1;
  })()
  );
});

test("#1038 Optimize trailing return statements", function() {
  const compile = code => CoffeeScript.compile(code, {bare: true}).trim().replace(/\s+/g, " ");

  eq("(function() {});",                 compile("->"));
  eq("(function() {});",                 compile("-> return"));
  eq("(function() { return void 0; });", compile("-> undefined"));
  eq("(function() { return void 0; });", compile("-> return undefined"));
  return eq("(function() { foo(); });",         compile(`\
->
  foo()
  return\
`)
  );
});
