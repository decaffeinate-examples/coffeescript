/* eslint-disable
    consistent-return,
    func-names,
    no-constant-condition,
    no-multi-str,
    no-restricted-syntax,
    no-sequences,
    no-undef,
    no-unused-vars,
    prefer-rest-params,
    radix,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Formatting
// ----------

// TODO: maybe this file should be split up into their respective sections:
//   operators -> operators
//   array literals -> array literals
//   string literals -> string literals
//   function invocations -> function invocations

doesNotThrow(() => CoffeeScript.compile('a = then b'));

test('multiple semicolon-separated statements in parentheticals', () => {
  const nonce = {};
  eq(nonce, (1, 2, nonce));
  return eq(nonce, ((() => (1, 2, nonce)))());
});

// * Line Continuation
//   * Property Accesss
//   * Operators
//   * Array Literals
//   * Function Invocations
//   * String Literals

// Property Access

test('chained accesses split on period/newline, backwards and forwards', () => {
  const str = 'abc';
  let result = str
    .split('')
    .reverse()
    .reverse()
    .reverse();
  arrayEq(['c', 'b', 'a'], result);
  arrayEq(['c', 'b', 'a'], str
    .split('')
    .reverse()
    .reverse()
    .reverse());
  result = str
    .split('')
    .reverse()
    .reverse()
    .reverse();
  arrayEq(['c', 'b', 'a'], result);
  arrayEq(['c', 'b', 'a'],
    str
      .split('')
      .reverse()
      .reverse()
      .reverse());
  return arrayEq(['c', 'b', 'a'],
    str
      .split('')
      .reverse()
      .reverse()
      .reverse());
});

// Operators

test('newline suppression for operators', () => {
  const six = 1
    + 2
    + 3;
  return eq(6, six);
});

test('`?.` and `::` should continue lines', () => ok(!(
  Date
    .prototype != null ? Date
      .prototype.foo
    : undefined)));
// eq Object::toString, Date?.
// prototype
// ::
// ?.foo

doesNotThrow(() => CoffeeScript.compile(`\
oh. yes
oh?. true
oh:: return\
`));

doesNotThrow(() => CoffeeScript.compile(`\
a?[b..]
a?[...b]
a?[b..c]\
`));

// Array Literals

test("indented array literals don't trigger whitespace rewriting", () => {
  const getArgs = function () { return arguments; };
  const result = getArgs(
    [[[[[],
      []],
    [[]]]],
    []],
  );
  return eq(1, result.length);
});

// Function Invocations

doesNotThrow(() => CoffeeScript.compile(`\
obj = then fn 1,
  1: 1
  a:
    b: ->
      fn c,
        d: e
  f: 1\
`));

// String Literals

test('indented heredoc', () => {
  const result = (((_) => _))(
    '\
abc\
',
  );
  return eq('abc', result);
});

// Chaining - all open calls are closed by property access starting a new line
// * chaining after
//   * indented argument
//   * function block
//   * indented object
//
//   * single line arguments
//   * inline function literal
//   * inline object literal
//
// * chaining inside
//   * implicit object literal

test('chaining after outdent', () => {
  const id = (x) => x;

  // indented argument
  const ff = id(0xff).toString();
  eq('255', ff);

  // function block
  const str = 'abc';
  const zero = parseInt(str.replace(/\w/, (letter) => 0)).toString();
  eq('0', zero);

  // indented object
  const {
    a,
  } = id(id({ a: 1 }));
  return eq(1, a);
});

test('#1495, method call chaining', () => {
  const str = 'abc';

  let result = str.split('')
    .join(', ');
  eq('a, b, c', result);

  result = str
    .split('')
    .join(', ');
  eq('a, b, c', result);

  eq('a, b, c', (str
    .split('')
    .join(', ')
  ));

  eq('abc',
    'aaabbbccc'.replace(/(\w)\1\1/g, '$1$1')
      .replace(/([abc])\1/g, '$1'));

  // Nested calls
  result = [1, 2, 3]
    .slice(Math.max(0, 1))
    .concat([3]);
  arrayEq([2, 3, 3], result);

  // Single line function arguments
  result = [1, 2, 3, 4, 5, 6]
    .map((x) => x * x)
    .filter((x) => (x % 2) === 0)
    .reverse();
  arrayEq([36, 16, 4], result);

  // Single line implicit objects
  const id = (x) => x;
  result = id({ a: 1 })
    .a;
  eq(1, result);

  // The parens are forced
  result = str.split(''
    .split('')
    .join('')).join(', ');
  return eq('a, b, c', result);
});

test('chaining should not wrap spilling ternary', () => throws(() => CoffeeScript.compile(`\
if 0 then 1 else g
a: 42
.h()\
`)));

test('chaining should wrap calls containing spilling ternary', () => {
  const f = (x) => ({
    h: x,
  });
  const id = (x) => x;
  const result = f(true ? 42 : id({ a: 2 })).h;
  return eq(42, result);
});

test('chaining should work within spilling ternary', () => {
  const f = (x) => ({
    h: x,
  });
  const id = (x) => x;
  const result = f(false ? 1 : id(
    { a: 3 }
      .a,
  ));
  return eq(3, result.h);
});

test('method call chaining inside objects', () => {
  const f = (x) => ({
    c: 42,
  });
  const result = {
    a: f(1),
    b: f({ a: 1 })
      .c,
  };
  return eq(42, result.b);
});

test('#4568: refine sameLine implicit object tagging', () => {
  const condition = true;
  const fn = () => true;

  const x = !condition ? fn({
    bar: {
      foo: 123,
    },
  }) : undefined;
  return eq(x, undefined);
});

// Nested blocks caused by paren unwrapping
test("#1492: Nested blocks don't cause double semicolons", () => {
  const js = CoffeeScript.compile('(0;0)');
  return eq(-1, js.indexOf(';;'));
});

test('#1195 Ignore trailing semicolons (before newlines or as the last char in a program)', () => {
  const preNewline = (numSemicolons) => `\
nonce = {}; nonce2 = {}
f = -> nonce${Array(numSemicolons + 1).join(';')}
nonce2
unless f() is nonce then throw new Error('; before linebreak should = newline')\
`;
  for (const n of [1, 2, 3]) { CoffeeScript.run(preNewline(n), { bare: true }); }

  const lastChar = '-> lastChar;';
  return doesNotThrow(() => CoffeeScript.compile(lastChar, { bare: true }));
});

test('#1299: Disallow token misnesting', () => {
  try {
    CoffeeScript.compile(`\
[{
   ]}\
`);
    return ok(false);
  } catch (e) {
    return eq('unmatched ]', e.message);
  }
});

test('#2981: Enforce initial indentation', () => {
  try {
    CoffeeScript.compile('  a\nb-');
    return ok(false);
  } catch (e) {
    return eq('missing indentation', e.message);
  }
});

test("'single-line' expression containing multiple lines", () => doesNotThrow(() => CoffeeScript.compile(`\
(a, b) -> if a
-a
else if b
then -b
else null\
`)));

test('#1275: allow indentation before closing brackets', () => {
  const array = [
    1,
    2,
    3,
  ];
  eq(array, array);
  (function () {}());

  const a = 1;
  return eq(1, a);
});

test('#3199: return multiline implicit object', () => {
  const y = (function () {
    if (false) {
      return {
        type: 'a',
        msg: 'b',
      };
    }
  }());
  return eq(undefined, y);
});
