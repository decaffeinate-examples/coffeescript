/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Array Literals
// --------------

// * Array Literals
// * Splats in Array Literals

// TODO: add indexing and method invocation tests: [1][0] is 1, [].toString()

test("trailing commas", function() {
  let trailingComma = [1, 2, 3,];
  ok((trailingComma[0] === 1) && (trailingComma[2] === 3) && (trailingComma.length === 3));

  trailingComma = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
  ];
  for (let n of Array.from(trailingComma)) { var sum = (sum || 0) + n; }

  const a = [(x => x), (x => x * x)];
  return ok(a.length === 2);
});

test("incorrect indentation without commas", function() {
  const result = [['a'],
   {b: 'c'}];
  ok(result[0][0] === 'a');
  return ok(result[1]['b'] === 'c');
});


// Splats in Array Literals

test("array splat expansions with assignments", function() {
  let a, b;
  const nums = [1, 2, 3];
  const list = [(a = 0), ...Array.from(nums), (b = 4)];
  eq(0, a);
  eq(4, b);
  return arrayEq([0,1,2,3,4], list);
});


test("mixed shorthand objects in array lists", function() {

  let arr = [
    {a:1},
    'b',
    {c:1}
  ];
  ok(arr.length === 3);
  ok(arr[2].c === 1);

  arr = [{b: 1, a: 2}, 100];
  eq(arr[1], 100);

  arr = [{a:0, b:1}, (1 + 1)];
  eq(arr[1], 2);

  arr = [{a:1}, 'a', {b:1}, 'b'];
  eq(arr.length, 4);
  eq(arr[2].b, 1);
  return eq(arr[3], 'b');
});


test("array splats with nested arrays", function() {
  const nonce = {};
  let a = [nonce];
  let list = [1, 2, ...Array.from(a)];
  eq(list[0], 1);
  eq(list[2], nonce);

  a = [[nonce]];
  list = [1, 2, ...Array.from(a)];
  return arrayEq(list, [1, 2, [nonce]]);
});

test("#1274: `[] = a()` compiles to `false` instead of `a()`", function() {
  let a = false;
  const fn = () => a = true;
  const array = fn();
  return ok(a);
});

test("#3194: string interpolation in array", function() {
  let arr = [ "a",
          {key: 'value'}
        ];
  eq(2, arr.length);
  eq('a', arr[0]);
  eq('value', arr[1].key);

  const b = 'b';
  arr = [ `a${b}`,
          {key: 'value'}
        ];
  eq(2, arr.length);
  eq('ab', arr[0]);
  return eq('value', arr[1].key);
});

test("regex interpolation in array", function() {
  let arr = [ /a/,
          {key: 'value'}
        ];
  eq(2, arr.length);
  eq('a', arr[0].source);
  eq('value', arr[1].key);

  const b = 'b';
  arr = [ new RegExp(`a${b}`),
          {key: 'value'}
        ];
  eq(2, arr.length);
  eq('ab', arr[0].source);
  return eq('value', arr[1].key);
});


test("for-from loops over Array", function() {
  let a, b;
  let d;
  let array1 = [50, 30, 70, 20];
  let array2 = [];
  for (let x of array1) {
    array2.push(x);
  }
  arrayEq(array1, array2);

  array1 = [[20, 30], [40, 50]];
  array2 = [];
  for ([a, b] of array1) {
    array2.push(b);
    array2.push(a);
  }
  arrayEq(array2, [30, 20, 50, 40]);

  array1 = [{a: 10, b: 20, c: 30}, {a: 40, b: 50, c: 60}];
  array2 = [];
  for ({a, b, c: d} of array1) {
    array2.push([a, b, d]);
  }
  arrayEq(array2, [[10, 20, 30], [40, 50, 60]]);

  array1 = [[10, 20, 30, 40, 50]];
  return (() => {
    const result = [];
    for (let value of array1) {
      var adjustedLength, c;
      a = value[0],
        adjustedLength = Math.max(value.length, 2),
        b = value.slice(1, adjustedLength - 1),
        c = value[adjustedLength - 1];
      eq(10, a);
      arrayEq([20, 30, 40], b);
      result.push(eq(50, c));
    }
    return result;
  })();
});

test("for-from comprehensions over Array", function() {
  let x, a, b;
  let array1 = ((() => {
    const result = [];
    for (x of [10, 20, 30]) {       result.push(x + 10);
    }
    return result;
  })());
  ok(array1.join(' ') === '20 30 40');

  let array2 = ((() => {
    const result1 = [];
    for (x of [30, 41, 57]) {       if (__mod__(x, 3) === 0) {
        result1.push(x);
      }
    }
    return result1;
  })());
  ok(array2.join(' ') === '30 57');

  array1 = ((() => {
    const result2 = [];
    for ([a, b] of [[20, 30], [40, 50]]) {       result2.push(b + 5);
    }
    return result2;
  })());
  ok(array1.join(' ') === '35 55');

  array2 = ((() => {
    const result3 = [];
    for ([a, b] of [[10, 20], [30, 40], [50, 60]]) {       if ((a + b) >= 70) {
        result3.push(a + b);
      }
    }
    return result3;
  })());
  return ok(array2.join(' ') === '70 110');
});

function __mod__(a, b) {
  a = +a;
  b = +b;
  return (a % b + b) % b;
}