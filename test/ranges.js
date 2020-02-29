/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Range Literals
// --------------

// TODO: add indexing and method invocation tests: [1..4][0] is 1, [0...3].toString()

// shared array
const shared = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

test("basic inclusive ranges", function() {
  arrayEq([1, 2, 3] , [1, 2, 3]);
  arrayEq([0, 1, 2] , [0, 1, 2]);
  arrayEq([0, 1]    , [0, 1]);
  arrayEq([0]       , [0]);
  arrayEq([-1]      , __range__(-1, -1, true));
  arrayEq([-1, 0]   , __range__(-1, 0, true));
  return arrayEq([-1, 0, 1], __range__(-1, 1, true));
});

test("basic exclusive ranges", function() {
  arrayEq([1, 2, 3] , [1, 2, 3]);
  arrayEq([0, 1, 2] , [0, 1, 2]);
  arrayEq([0, 1]    , [0, 1]);
  arrayEq([0]       , [0]);
  arrayEq([-1]      , __range__(-1, 0, false));
  arrayEq([-1, 0]   , __range__(-1, 1, false));
  arrayEq([-1, 0, 1], __range__(-1, 2, false));

  arrayEq([], []);
  arrayEq([], []);
  return arrayEq([], __range__(-1, -1, false));
});

test("downward ranges", function() {
  arrayEq(shared, [9, 8, 7, 6, 5, 4, 3, 2, 1, 0].reverse());
  arrayEq([5, 4, 3, 2] , [5, 4, 3, 2]);
  arrayEq([2, 1, 0, -1], __range__(2, -1, true));

  arrayEq([3, 2, 1]  , [3, 2, 1]);
  arrayEq([2, 1, 0]  , [2, 1, 0]);
  arrayEq([1, 0]     , [1, 0]);
  arrayEq([0]        , [0]);
  arrayEq([-1]       , __range__(-1, -1, true));
  arrayEq([0, -1]    , __range__(0, -1, true));
  arrayEq([1, 0, -1] , __range__(1, -1, true));
  arrayEq([0, -1, -2], __range__(0, -2, true));

  arrayEq([4, 3, 2], [4, 3, 2]);
  arrayEq([3, 2, 1], [3, 2, 1]);
  arrayEq([2, 1]   , [2, 1]);
  arrayEq([1]      , [1]);
  arrayEq([]       , []);
  arrayEq([]       , __range__(-1, -1, false));
  arrayEq([0]      , __range__(0, -1, false));
  arrayEq([0, -1]  , __range__(0, -2, false));
  arrayEq([1, 0]   , __range__(1, -1, false));
  return arrayEq([2, 1, 0], __range__(2, -1, false));
});

test("ranges with variables as enpoints", function() {
  let [a, b] = Array.from([1, 3]);
  arrayEq([1, 2, 3], __range__(a, b, true));
  arrayEq([1, 2]   , __range__(a, b, false));
  b = -2;
  arrayEq([1, 0, -1, -2], __range__(a, b, true));
  return arrayEq([1, 0, -1]    , __range__(a, b, false));
});

test("ranges with expressions as endpoints", function() {
  const [a, b] = Array.from([1, 3]);
  arrayEq([2, 3, 4, 5, 6], __range__((a+1), 2*b, true));
  return arrayEq([2, 3, 4, 5]   , __range__((a+1), 2*b, false));
});

test("large ranges are generated with looping constructs", function() {
  let len;
  const down = __range__(99, 0, true);
  eq(100, (len = down.length));
  eq(0, down[len - 1]);

  const up = __range__(0, 100, false);
  eq(100, (len = up.length));
  return eq(99, up[len - 1]);
});

test("for-from loops over ranges", function() {
  const array1 = [];
  for (let x of [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]) {
    array1.push(x);
    if (x === 25) { break; }
  }
  return arrayEq(array1, [20, 21, 22, 23, 24, 25]);
});

test("for-from comprehensions over ranges", function() {
  let x;
  const array1 = ((() => {
    const result = [];
    for (x of [20, 21, 22, 23, 24, 25]) {       result.push(x + 10);
    }
    return result;
  })());
  ok(array1.join(' ') === '30 31 32 33 34 35');

  const array2 = ((() => {
    const result1 = [];
    for (x of [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]) {       if (__mod__(x, 2) === 0) {
        result1.push(x);
      }
    }
    return result1;
  })());
  return ok(array2.join(' ') === '20 22 24 26 28 30');
});

test("#1012 slices with arguments object", function() {
  const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const argsAtStart = (function() { return __range__(arguments[0], 9, true); })(0);
  arrayEq(expected, argsAtStart);
  const argsAtEnd = (function() { return __range__(0, arguments[0], true); })(9);
  arrayEq(expected, argsAtEnd);
  const argsAtBoth = (function() { return __range__(arguments[0], arguments[1], true); })(0, 9);
  return arrayEq(expected, argsAtBoth);
});

test("#1409: creating large ranges outside of a function body", () => CoffeeScript.eval('[0..100]'));

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
function __mod__(a, b) {
  a = +a;
  b = +b;
  return (a % b + b) % b;
}