/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Assignment
// ----------

// * Assignment
// * Compound Assignment
// * Destructuring Assignment
// * Context Property (@) Assignment
// * Existential Assignment (?=)
// * Assignment to variables similar to generated variables

test("context property assignment (using @)", function() {
  const nonce = {};
  const addMethod = function() {
    this.method = () => nonce;
    return this;
  };
  return eq(nonce, addMethod.call({}).method());
});

test("unassignable values", function() {
  const nonce = {};
  return Array.from(['', '""', '0', 'f()'].concat(CoffeeScript.RESERVED)).map((nonref) =>
    eq(nonce, ((() => { try { return CoffeeScript.compile(`${nonref} = v`); } catch (e) { return nonce; } })())));
});

// Compound Assignment

test("boolean operators", function() {
  let f;
  const nonce = {};

  let a  = 0;
  if (!a) { a = nonce; }
  eq(nonce, a);

  let b  = 1;
  if (!b) { b = nonce; }
  eq(1, b);

  let c = 0;
  if (c) { c = nonce; }
  eq(0, c);

  let d = 1;
  if (d) { d = nonce; }
  eq(nonce, d);

  // ensure that RHS is treated as a group
  let e = (f = false);
  if (e) { e = f || true; }
  return eq(false, e);
});

test("compound assignment as a sub expression", function() {
  let [a, b, c] = Array.from([1, 2, 3]);
  eq(6, (a + (b += c)));
  eq(1, a);
  eq(5, b);
  return eq(3, c);
});

// *note: this test could still use refactoring*
test("compound assignment should be careful about caching variables", function() {
  let base1, base2, base3, name, name1, name2;
  let count = 0;
  const list = [];

  if (!list[name = ++count]) { list[name] = 1; }
  eq(1, list[1]);
  eq(1, count);

  if (list[name1 = ++count] == null) { list[name1] = 2; }
  eq(2, list[2]);
  eq(2, count);

  if (list[name2 = count++]) { list[name2] = 6; }
  eq(6, list[2]);
  eq(3, count);

  var base = function() {
    ++count;
    return base;
  };

  if (!(base1 = base()).four) { base1.four = 4; }
  eq(4, base.four);
  eq(4, count);

  if ((base2 = base()).five == null) { base2.five = 5; }
  eq(5, base.five);
  eq(5, count);

  eq(5, (base3 = base()).five != null ? base3.five : (base3.five = 6));
  return eq(6, count);
});

test("compound assignment with implicit objects", function() {
  let obj = undefined;
  if (obj == null) { obj =
    {one: 1}; }

  eq(1, obj.one);

  if (obj) { obj = {two: 2}; }

  eq(undefined, obj.one);
  return eq(2, obj.two);
});

test("compound assignment (math operators)", function() {
  let num = 10;
  num -= 5;
  eq(5, num);

  num *= 10;
  eq(50, num);

  num /= 10;
  eq(5, num);

  num %= 3;
  return eq(2, num);
});

test("more compound assignment", function() {
  const a = {};
  let val = undefined;
  if (!val) { val = a; }
  if (!val) { val = true; }
  eq(a, val);

  const b = {};
  if (val) { val = true; }
  eq(val, true);
  if (val) { val = b; }
  eq(b, val);

  const c = {};
  val = null;
  if (val == null) { val = c; }
  if (val == null) { val = true; }
  return eq(c, val);
});

test("#1192: assignment starting with object literals", function() {
  doesNotThrow((() => CoffeeScript.run("{}.p = 0")));
  doesNotThrow((() => CoffeeScript.run("{}.p++")));
  doesNotThrow((() => CoffeeScript.run("{}[0] = 1")));
  doesNotThrow((() => CoffeeScript.run(`{a: 1, 'b', "${1}": 2}.p = 0`)));
  return doesNotThrow((() => CoffeeScript.run("{a:{0:{}}}.a[0] = 0")));
});


// Destructuring Assignment

test("empty destructuring assignment", function() {
  let ref;
  return ref = (undefined), ref;
});

test("chained destructuring assignments", function() {
  let b, c, nonce;
  const [a] = Array.from(({0: b} = ({'0': c} = [(nonce={})])));
  eq(nonce, a);
  eq(nonce, b);
  return eq(nonce, c);
});

test("variable swapping to verify caching of RHS values when appropriate", function() {
  let nonceA, nonceB, nonceC;
  let a = (nonceA = {});
  let b = (nonceB = {});
  let c = (nonceC = {});
  [a, b, c] = Array.from([b, c, a]);
  eq(nonceB, a);
  eq(nonceC, b);
  eq(nonceA, c);
  [a, b, c] = Array.from([b, c, a]);
  eq(nonceC, a);
  eq(nonceA, b);
  eq(nonceB, c);
  const fn = function() {
    let ref;
    return [a, b, c] = Array.from(ref = [b, c, a]), ref;
  };
  arrayEq([nonceA,nonceB,nonceC], fn());
  eq(nonceA, a);
  eq(nonceB, b);
  return eq(nonceC, c);
});

test("#713: destructuring assignment should return right-hand-side value", function() {
  let a, b, c, d, nonceA, nonceB, ref;
  const nonces = [(nonceA={}),(nonceB={})];
  eq(nonces, ([a, b] = Array.from(ref = ([c, d] = Array.from(nonces), nonces)), ref));
  eq(nonceA, a);
  eq(nonceA, c);
  eq(nonceB, b);
  return eq(nonceB, d);
});

test("destructuring assignment with splats", function() {
  const a = {}; const b = {}; const c = {}; const d = {}; const e = {};
  const array = [a,b,c,d,e], x = array[0], adjustedLength = Math.max(array.length, 2), y = array.slice(1, adjustedLength - 1), z = array[adjustedLength - 1];
  eq(a, x);
  arrayEq([b,c,d], y);
  return eq(e, z);
});

test("deep destructuring assignment with splats", function() {
  const a={}; const b={}; const c={}; const d={}; const e={}; const f={}; const g={}; const h={}; const i={};
  const array = [a, [b, c, d, e], f, g, h, i], u = array[0], array1 = array[1], v = array1[0], adjustedLength = Math.max(array1.length, 2), w = array1.slice(1, adjustedLength - 1), x = array1[adjustedLength - 1], adjustedLength1 = Math.max(array.length, 3), y = array.slice(2, adjustedLength1 - 1), z = array[adjustedLength1 - 1];
  eq(a, u);
  eq(b, v);
  arrayEq([c,d], w);
  eq(e, x);
  arrayEq([f,g,h], y);
  return eq(i, z);
});

test("destructuring assignment with objects", function() {
  const a={}; const b={}; const c={};
  const obj = {a,b,c};
  const {a:x, b:y, c:z} = obj;
  eq(a, x);
  eq(b, y);
  return eq(c, z);
});

test("deep destructuring assignment with objects", function() {
  const a={}; const b={}; const c={}; const d={};
  const obj = {
    a,
    b: {
      'c': {
        d: [
          b,
          {e: c, f: d}
        ]
      }
    }
  };
  const w = obj.a, obj1 = obj['b'], obj2 = obj1.c, [x, {'f': z, e: y}] = Array.from(obj2.d);
  eq(a, w);
  eq(b, x);
  eq(c, y);
  return eq(d, z);
});

test("destructuring assignment with objects and splats", function() {
  const a={}; const b={}; const c={}; const d={};
  const obj = {a: {b: [a, b, c, d]}};
  const obj1 = obj.a, [y, ...z] = Array.from(obj1.b);
  eq(a, y);
  return arrayEq([b,c,d], z);
});

test("destructuring assignment against an expression", function() {
  const a={}; const b={};
  const [y, z] = Array.from(true ? [a, b] : [b, a]);
  eq(a, y);
  return eq(b, z);
});

test("bracket insertion when necessary", function() {
  let left;
  const [a] = Array.from((left = [0]) != null ? left : [1]);
  return eq(a, 0);
});

// for implicit destructuring assignment in comprehensions, see the comprehension tests

test("destructuring assignment with context (@) properties", function() {
  const a={}; const b={}; const c={}; const d={}; const e={};
  const obj = {
    fn() {
      const local = [a, {b, c}, d, e];
      return [this.a, {b: this.b, c: this.c}, this.d, this.e] = Array.from(local), local;
    }
  };
  for (let key of ['a','b','c','d','e']) { eq(undefined, obj[key]); }
  obj.fn();
  eq(a, obj.a);
  eq(b, obj.b);
  eq(c, obj.c);
  eq(d, obj.d);
  return eq(e, obj.e);
});

test("#1024: destructure empty assignments to produce javascript-like results", function() {
  let ref;
  return eq(2 * (ref = 3 + 5, ref), 16);
});

test("#1005: invalid identifiers allowed on LHS of destructuring assignment", function() {
  let tSplat, v;
  const disallowed = ['eval', 'arguments'].concat(CoffeeScript.RESERVED);
  throws((() => CoffeeScript.compile(`[${disallowed.join(', ')}] = x`)), null, 'all disallowed');
  throws((() => CoffeeScript.compile(`[${disallowed.join('..., ')}...] = x`)), null, 'all disallowed as splats');
  let t = (tSplat = null);
  for (v of Array.from(disallowed)) { // `class` by itself is an expression
    if (v !== 'class') {
      throws((() => CoffeeScript.compile(t)), null, (t = `[${v}] = x`));
      throws((() => CoffeeScript.compile(tSplat)), null, (tSplat = `[${v}...] = x`));
    }
  }
  return doesNotThrow(() => (() => {
    const result = [];
    for (v of Array.from(disallowed)) {
      CoffeeScript.compile(`[a.${v}] = x`);
      CoffeeScript.compile(`[a.${v}...] = x`);
      CoffeeScript.compile(`[@${v}] = x`);
      result.push(CoffeeScript.compile(`[@${v}...] = x`));
    }
    return result;
  })());
});

test("#2055: destructuring assignment with `new`", function() {
  const {length} = new Array;
  return eq(0, length);
});

test("#156: destructuring with expansion", function() {
  let lastButOne, second;
  const array = [1, 2, 3, 4, 5];
  let first = array[0], last = array[array.length - 1];
  eq(1, first);
  eq(5, last);
  lastButOne = array[array.length - 2], last = array[array.length - 1];
  eq(4, lastButOne);
  eq(5, last);
  first = array[0], second = array[1], last = array[array.length - 1];
  eq(2, second);
  last = 'strings as well -> x'['strings as well -> x'.length - 1];
  eq('x', last);
  throws((() => CoffeeScript.compile("[1, ..., 3]")),        null, "prohibit expansion outside of assignment");
  throws((() => CoffeeScript.compile("[..., a, b...] = c")), null, "prohibit expansion and a splat");
  return throws((() => CoffeeScript.compile("[...] = c")),          null, "prohibit lone expansion");
});

test("destructuring with dynamic keys", function() {
  const {['a']: a, ['b']: b, c} = {a: 1, b: 2, c: 3};
  eq(1, a);
  eq(2, b);
  eq(3, c);
  return throws(() => CoffeeScript.compile('{"#{a}"} = b'));
});

test("simple array destructuring defaults", function() {
  let array1, array2, array3, val1, val2, val3;
  let array = [], val = array[0], a = val != null ? val : 1;
  eq(1, a);
  array1 = [undefined], val1 = array1[0], a = val1 != null ? val1 : 2;
  eq(2, a);
  array2 = [null], val2 = array2[0], a = val2 != null ? val2 : 3;
  eq(3, a);
  array3 = [0], val3 = array3[0], a = val3 != null ? val3 : 4;
  eq(0, a);
  const arr = [(a = 5)];
  eq(5, a);
  return arrayEq([5], arr);
});

test("simple object destructuring defaults", function() {
  let obj1, obj2, obj3, obj5, obj6, obj7, val1, val2, val3, val5, val6, val7;
  let obj = {}, val = obj.b, b = val != null ? val : 1;
  eq(b, 1);
  obj1 = {b: undefined}, val1 = obj1.b, b = val1 != null ? val1 : 2;
  eq(b, 2);
  obj2 = {b: null}, val2 = obj2.b, b = val2 != null ? val2 : 3;
  eq(b, 3);
  obj3 = {b: 0}, val3 = obj3.b, b = val3 != null ? val3 : 4;
  eq(b, 0);

  let obj4 = {}, val4 = obj4.b, c = val4 != null ? val4 : 1;
  eq(c, 1);
  obj5 = {b: undefined}, val5 = obj5.b, c = val5 != null ? val5 : 2;
  eq(c, 2);
  obj6 = {b: null}, val6 = obj6.b, c = val6 != null ? val6 : 3;
  eq(c, 3);
  obj7 = {b: 0}, val7 = obj7.b, c = val7 != null ? val7 : 4;
  return eq(c, 0);
});

test("multiple array destructuring defaults", function() {
  let array1, array2, val2, val3, val4, val5;
  let array = [null, 12, 13], val = array[0], a = val != null ? val : 1, val1 = array[1], b = val1 != null ? val1 : 2, c = array[2];
  eq(a, 1);
  eq(b, 12);
  eq(c, 13);
  array1 = [null, 12, 13],
    a = array1[0],
    val2 = array1[1],
    b = val2 != null ? val2 : 2,
    val3 = array1[2],
    c = val3 != null ? val3 : 3;
  eq(a, null);
  eq(b, 12);
  eq(c, 13);
  array2 = [11, 12],
    val4 = array2[0],
    a = val4 != null ? val4 : 1,
    b = array2[1],
    val5 = array2[2],
    c = val5 != null ? val5 : 3;
  eq(a, 11);
  eq(b, 12);
  return eq(c, 3);
});

test("multiple object destructuring defaults", function() {
  const obj = {['b']: 12}, val = obj.a, a = val != null ? val : 1, val1 = obj.b, bb = val1 != null ? val1 : 2, val2 = obj['c'], c = val2 != null ? val2 : 3, val3 = obj[`${0}`], d = val3 != null ? val3 : 4;
  eq(a, 1);
  eq(bb, 12);
  eq(c, 3);
  return eq(d, 4);
});

test("array destructuring defaults with splats", function() {
  const array = [], val = array[array.length - 1], a = val != null ? val : 9;
  eq(a, 9);
  const array1 = [19], val1 = array1[array1.length - 1], b = val1 != null ? val1 : 9;
  return eq(b, 19);
});

test("deep destructuring assignment with defaults", function() {
  const array = [0], a = array[0], val = array[1], array1 = val != null ? val : [{c: 2}], obj = array1[0], val1 = obj.b, b = val1 != null ? val1 : 1, val2 = obj.c, c = val2 != null ? val2 : 3;
  eq(a, 0);
  eq(b, 1);
  return eq(c, 2);
});

test("destructuring assignment with context (@) properties and defaults", function() {
  const a={}; const b={}; const c={}; const d={}; const e={};
  const obj = {
    fn() {
      let obj1, val, val1, val2;
      const local = [a, {b, c: null}, d];
      return this.a = local[0], obj1 = local[1], val = obj1.b, this.b = val != null ? val : b, val1 = obj1.c, this.c = val1 != null ? val1 : c, this.d = local[2], val2 = local[3], this.e = val2 != null ? val2 : e, local;
    }
  };
  for (let key of ['a','b','c','d','e']) { eq(undefined, obj[key]); }
  obj.fn();
  eq(a, obj.a);
  eq(b, obj.b);
  eq(c, obj.c);
  eq(d, obj.d);
  return eq(e, obj.e);
});

test("destructuring assignment with defaults single evaluation", function() {
  let array1, c, obj, val1, val2, val3;
  let callCount = 0;
  const fn = () => callCount++;
  let array = [], val = array[0], a = val != null ? val : fn();
  eq(0, a);
  eq(1, callCount);
  array1 = [10], val1 = array1[0], a = val1 != null ? val1 : fn();
  eq(10, a);
  eq(1, callCount);
  obj = {a: 20, b: null},
    val2 = obj.a,
    a = val2 != null ? val2 : fn(),
    val3 = obj.b,
    c = val3 != null ? val3 : fn();
  eq(20, a);
  eq(c, 1);
  return eq(callCount, 2);
});


// Existential Assignment

test("existential assignment", function() {
  const nonce = {};
  let a = false;
  if (a == null) { a = nonce; }
  eq(false, a);
  let b = undefined;
  if (b == null) { b = nonce; }
  eq(nonce, b);
  let c = null;
  if (c == null) { c = nonce; }
  return eq(nonce, c);
});

test("#1627: prohibit conditional assignment of undefined variables", function() {
  throws((() => CoffeeScript.compile("x ?= 10")),        null, "prohibit (x ?= 10)");
  throws((() => CoffeeScript.compile("x ||= 10")),       null, "prohibit (x ||= 10)");
  throws((() => CoffeeScript.compile("x or= 10")),       null, "prohibit (x or= 10)");
  throws((() => CoffeeScript.compile("do -> x ?= 10")),  null, "prohibit (do -> x ?= 10)");
  throws((() => CoffeeScript.compile("do -> x ||= 10")), null, "prohibit (do -> x ||= 10)");
  throws((() => CoffeeScript.compile("do -> x or= 10")), null, "prohibit (do -> x or= 10)");
  doesNotThrow((() => CoffeeScript.compile("x = null; x ?= 10")),        "allow (x = null; x ?= 10)");
  doesNotThrow((() => CoffeeScript.compile("x = null; x ||= 10")),       "allow (x = null; x ||= 10)");
  doesNotThrow((() => CoffeeScript.compile("x = null; x or= 10")),       "allow (x = null; x or= 10)");
  doesNotThrow((() => CoffeeScript.compile("x = null; do -> x ?= 10")),  "allow (x = null; do -> x ?= 10)");
  doesNotThrow((() => CoffeeScript.compile("x = null; do -> x ||= 10")), "allow (x = null; do -> x ||= 10)");
  doesNotThrow((() => CoffeeScript.compile("x = null; do -> x or= 10")), "allow (x = null; do -> x or= 10)");

  throws((() => CoffeeScript.compile("-> -> -> x ?= 10")), null, "prohibit (-> -> -> x ?= 10)");
  return doesNotThrow((() => CoffeeScript.compile("x = null; -> -> -> x ?= 10")), "allow (x = null; -> -> -> x ?= 10)");
});

test("more existential assignment", function() {
  if (global.temp == null) { global.temp = 0; }
  eq(global.temp, 0);
  if (!global.temp) { global.temp = 100; }
  eq(global.temp, 100);
  return delete global.temp;
});

test("#1348, #1216: existential assignment compilation", function() {
  const nonce = {};
  let a = nonce;
  let b = (a != null ? a : (a = 0));
  eq(nonce, b);
  //the first ?= compiles into a statement; the second ?= compiles to a ternary expression
  eq(a != null ? a : (a = b != null ? b : (b = 1)), nonce);

  if (a) { if (a == null) { a = 2; } } else { a = 3; }
  return eq(a, nonce);
});

test("#1591, #1101: splatted expressions in destructuring assignment must be assignable", function() {
  const nonce = {};
  return Array.from(['', '""', '0', 'f()', '(->)'].concat(CoffeeScript.RESERVED)).map((nonref) =>
    eq(nonce, ((() => { try { return CoffeeScript.compile(`[${nonref}...] = v`); } catch (e) { return nonce; } })())));
});

test("#1643: splatted accesses in destructuring assignments should not be declared as variables", function() {
  let code, i, j;
  let e;
  const nonce = {};
  const accesses = ['o.a', 'o["a"]', '(o.a)', '(o.a).a', '@o.a', 'C::a', 'C::', 'f().a', 'o?.a', 'o?.a.b', 'f?().a'];
  for (let access of Array.from(accesses)) {
    const iterable = [1,2,3];
    for (j = 0; j < iterable.length; j++) { //position can matter
      i = iterable[j];
      code =
        `\
nonce = {}; nonce2 = {}; nonce3 = {};
@o = o = new (class C then a:{}); f = -> o
[${new Array(i).join('x,')}${access}...] = [${new Array(i).join('0,')}nonce, nonce2, nonce3]
unless ${access}[0] is nonce and ${access}[1] is nonce2 and ${access}[2] is nonce3 then throw new Error('[...]')\
`;
      eq(nonce, (!(() => { try { return CoffeeScript.run(code, {bare: true}); } catch (error) { e = error; return true; } })()) ? nonce : undefined);
    }
  }
  // subpatterns like `[[a]...]` and `[{a}...]`
  const subpatterns = ['[sub, sub2, sub3]', '{0: sub, 1: sub2, 2: sub3}'];
  return Array.from(subpatterns).map((subpattern) =>
    (() => {
      const result = [];
      const iterable1 = [1,2,3];
      for (j = 0; j < iterable1.length; j++) {
        i = iterable1[j];
        code =
          `\
nonce = {}; nonce2 = {}; nonce3 = {};
[${new Array(i).join('x,')}${subpattern}...] = [${new Array(i).join('0,')}nonce, nonce2, nonce3]
unless sub is nonce and sub2 is nonce2 and sub3 is nonce3 then throw new Error('[sub...]')\
`;
        result.push(eq(nonce, (!(() => { try { return CoffeeScript.run(code, {bare: true}); } catch (error1) { e = error1; return true; } })()) ? nonce : undefined));
      }
      return result;
    })());
});

test("#1838: Regression with variable assignment", function() {
  const name =
  'dave';

  return eq(name, 'dave');
});

test('#2211: splats in destructured parameters', function() {
  doesNotThrow(() => CoffeeScript.compile('([a...]) ->'));
  doesNotThrow(() => CoffeeScript.compile('([a...],b) ->'));
  doesNotThrow(() => CoffeeScript.compile('([a...],[b...]) ->'));
  throws(() => CoffeeScript.compile('([a...,[a...]]) ->'));
  return doesNotThrow(() => CoffeeScript.compile('([a...,[b...]]) ->'));
});

test('#2213: invocations within destructured parameters', function() {
  throws(() => CoffeeScript.compile('([a()])->'));
  throws(() => CoffeeScript.compile('([a:b()])->'));
  throws(() => CoffeeScript.compile('([a:b.c()])->'));
  throws(() => CoffeeScript.compile('({a()})->'));
  throws(() => CoffeeScript.compile('({a:b()})->'));
  return throws(() => CoffeeScript.compile('({a:b.c()})->'));
});

test('#2532: compound assignment with terminator', () => doesNotThrow(() => CoffeeScript.compile(`\
a = "hello"
a +=
"
world
!
"\
`
)));

test("#2613: parens on LHS of destructuring", function() {
  const a = {};
  [(a).b] = Array.from([1, 2, 3]);
  return eq(a.b, 1);
});

test("#2181: conditional assignment as a subexpression", function() {
  let a = false;
  false && (a || (a = true));
  eq(false, a);
  return eq(false, !(a || (a = true)));
});

test("#1500: Assignment to variables similar to generated variables", function() {
  let results;
  let base1, error, f, left, scope;
  const len = 0;
  let x = ([1, 2, 3].map((n) => ((results = null), n)));
  arrayEq([1, 2, 3], x);
  eq(0, len);

  for (x of [1, 2, 3]) {
    f = function() {
      let i;
      return i = 0;
    };
    f();
    eq('undefined', typeof i);
  }

  const ref = 2;
  x = (left = ref * 2) != null ? left : 1;
  eq(x, 4);
  eq('undefined', typeof ref1);

  x = {};
  const base = () => x;
  const name = -1;
  if ((base1 = base())[-name] == null) { base1[-name] = 2; }
  eq(x[1], 2);
  eq(base(), x);
  eq(name, -1);

  f = function(a1, a) { this.a = a1; return [this.a, a]; };
  arrayEq([1, 2], f.call((scope = {}), 1, 2));
  eq(1, scope.a);

  try { throw 'foo'; }
  catch (error1) {
    error = error1;
    eq(error, 'foo');
  }

  eq(error, 'foo');

  return doesNotThrow(() => CoffeeScript.compile('(@slice...) ->'));
});

test("Assignment to variables similar to helper functions", function() {
  const f = (...slice) => slice;
  arrayEq([1, 2, 3], f(1, 2, 3));
  eq('undefined', typeof slice1);

  class A {}
  var B = (function() {
    let extend = undefined;
    let hasProp = undefined;
    B = class B extends A {
      constructor(...args) {
        {
          // Hack: trick Babel/TypeScript into allowing this before super.
          if (false) { super(); }
          let thisFn = (() => { return this; }).toString();
          let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
          eval(`${thisName} = this;`);
        }
        this.method = this.method.bind(this);
        super(...args);
      }

      static initClass() {
        extend = 3;
        hasProp = 4;
        this.prototype.value = 5;
      }
      method(bind, bind1) { return [bind, bind1, extend, hasProp, this.value]; }
    };
    B.initClass();
    return B;
  })();
  const {method} = new B;
  arrayEq([1, 2, 3, 4, 5], method(1, 2));

  const modulo = __mod__(-1, 3);
  eq(2, modulo);

  const indexOf = [1, 2, 3];
  return ok(Array.from(indexOf).includes(2));
});

function __mod__(a, b) {
  a = +a;
  b = +b;
  return (a % b + b) % b;
}