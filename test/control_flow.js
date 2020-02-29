/* eslint-disable
    brace-style,
    consistent-return,
    default-case,
    func-names,
    max-classes-per-file,
    max-len,
    no-cond-assign,
    no-constant-condition,
    no-continue,
    no-empty,
    no-nested-ternary,
    no-plusplus,
    no-restricted-syntax,
    no-return-assign,
    no-self-compare,
    no-shadow,
    no-throw-literal,
    no-undef,
    no-unreachable,
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
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Control Flow
// ------------

// * Conditionals
// * Loops
//   * For
//   * While
//   * Until
//   * Loop
// * Switch
// * Throw

// TODO: make sure postfix forms and expression coercion are properly tested

// shared identity function
const id = function (_) { if (arguments.length === 1) { return _; } return Array.prototype.slice.call(arguments); };

// Conditionals

test('basic conditionals', () => {
  if (false) {
    ok(false);
  } else if (false) {
    ok(false);
  } else {
    ok(true);
  }

  if (true) {
    ok(true);
  } else if (true) {
    ok(false);
  } else {
    ok(true);
  }

  if (!true) {
    ok(false);
  } else if (!true) {
    ok(false);
  } else {
    ok(true);
  }

  if (!false) {
    return ok(true);
  } if (!false) {
    return ok(false);
  }
  return ok(true);
});

test('single-line conditional', () => {
  if (false) { ok(false); } else { ok(true); }
  if (!false) { return ok(true); } return ok(false);
});

test('nested conditionals', () => {
  const nonce = {};
  return eq(nonce, ((() => {
    if (true) {
      if (!false) {
        if (false) { return false; }
        if (true) {
          return nonce;
        }
      }
    }
  })()));
});

test('nested single-line conditionals', () => {
  let b;
  const nonce = {};

  const a = false ? undefined : (b = 0 ? undefined : nonce);
  eq(nonce, a);
  eq(nonce, b);

  const c = false ? undefined : (0 ? undefined : nonce);
  eq(nonce, c);

  const d = true ? id(false ? undefined : nonce) : undefined;
  return eq(nonce, d);
});

test('empty conditional bodies', () => eq(undefined, ((() => {
  if (false) {
  } else if (false) {} else {}
})())));

test('conditional bodies containing only comments', () => {
  eq(undefined, (true
    /*
    block comment
    */
    ? undefined : undefined
    // comment
  ));

  return eq(undefined, ((() => {
    if (false) {
    // comment
    } else if (true) {}
    /*
    block comment
    */
    else {}
  })()));
});

test('return value of if-else is from the proper body', () => {
  const nonce = {};
  return eq(nonce, false ? undefined : nonce);
});

test('return value of unless-else is from the proper body', () => {
  const nonce = {};
  return eq(nonce, !true ? undefined : nonce);
});

test('assign inside the condition of a conditional statement', () => {
  let a; let
    b;
  const nonce = {};
  if (a = nonce) { 1; }
  eq(nonce, a);
  if (b = nonce) { 1; }
  return eq(nonce, b);
});


// Interactions With Functions

test('single-line function definition with single-line conditional', () => {
  const fn = function () { if (1 < 0.5) { return 1; } return -1; };
  return ok(fn() === -1);
});

test('function resturns conditional value with no `else`', () => {
  const fn = function () {
    if (false) { return true; }
  };
  return eq(undefined, fn());
});

test('function returns a conditional value', () => {
  const a = {};
  const fnA = function () {
    if (false) { return undefined; } return a;
  };
  eq(a, fnA());

  const b = {};
  const fnB = function () {
    if (!false) { return b; } return undefined;
  };
  return eq(b, fnB());
});

test('passing a conditional value to a function', () => {
  const nonce = {};
  return eq(nonce, id(false ? undefined : nonce));
});

test('unmatched `then` should catch implicit calls', () => {
  let a = 0;
  const trueFn = () => true;
  if (trueFn(undefined)) { a++; }
  return eq(1, a);
});


// if-to-ternary

test('if-to-ternary with instanceof requires parentheses', () => {
  const nonce = {};
  return eq(nonce, ({} instanceof Object
    ? nonce
    : undefined));
});

test('if-to-ternary as part of a larger operation requires parentheses', () => ok(2, 1 + (false ? 0 : 1)));


// Odd Formatting

test('if-else indented within an assignment', () => {
  const nonce = {};
  const result = false
    ? undefined
    : nonce;
  return eq(nonce, result);
});

test('suppressed indentation via assignment', () => {
  const nonce = {};
  const result = false ? undefined
    : false ? undefined
      : 0 ? undefined
        : 1 < 0 ? undefined
          : id(
            false ? undefined
              : nonce,
          );
  return eq(nonce, result);
});

test('tight formatting with leading `then`', () => {
  const nonce = {};
  return eq(nonce,
    true
      ? nonce
      : undefined);
});

test('#738: inline function defintion', () => {
  const nonce = {};
  const fn = true ? () => nonce : undefined;
  return eq(nonce, fn());
});

test('#748: trailing reserved identifiers', () => {
  const nonce = {};
  const obj = { delete: true };
  const result = obj.delete
    ? nonce : undefined;
  return eq(nonce, result);
});

test('if-else within an assignment, condition parenthesized', () => {
  let result = (1 === 1) ? 'correct' : undefined;
  eq(result, 'correct');

  result = ('whatever' != null ? 'whatever' : false) ? 'correct' : undefined;
  eq(result, 'correct');

  const f = () => 'wrong';
  result = (typeof f === 'function' ? f() : undefined) ? 'correct' : 'wrong';
  return eq(result, 'correct');
});

// Postfix

test('#3056: multiple postfix conditionals', () => {
  let temp = 'initial';
  if (false) { if (!true) { temp = 'ignored'; } }
  return eq(temp, 'initial');
});

// Loops

test('basic `while` loops', () => {
  let i = 5;
  let list = (() => {
    const result = [];
    while ((i -= 1)) {
      result.push(i * 2);
    }
    return result;
  })();
  ok(list.join(' ') === '8 6 4 2');

  i = 5;
  list = ((() => {
    const result1 = [];
    while ((i -= 1)) {
      result1.push(i * 3);
    }
    return result1;
  })());
  ok(list.join(' ') === '12 9 6 3');

  i = 5;
  const func = (num) => i -= num;
  const assert = () => ok(i < 5 && 5 > 0);
  let results = (() => {
    const result2 = [];
    while (func(1)) {
      assert();
      result2.push(i);
    }
    return result2;
  })();
  ok(results.join(' ') === '4 3 2 1');

  i = 10;
  results = (() => {
    const result3 = [];
    while ((i -= 1)) {
      if ((i % 2) === 0) {
        result3.push(i * 2);
      }
    }
    return result3;
  })();
  return ok(results.join(' ') === '16 12 8 4');
});


test('Issue 759: `if` within `while` condition', () => (() => {
  const result = [];
  while (1 ? 0 : undefined) {
    result.push(2);
  }
  return result;
})());


test('assignment inside the condition of a `while` loop', () => {
  let a; let
    b;
  const nonce = {};
  let count = 1;
  while (count--) { a = nonce; }
  eq(nonce, a);
  count = 1;
  while (count--) {
    b = nonce;
  }
  return eq(nonce, b);
});


test('While over break.', () => {
  let i = 0;
  const result = (() => {
    const result1 = [];
    while (i < 10) {
      i++;
      break;
    }
    return result1;
  })();
  return arrayEq(result, []);
});


test('While over continue.', () => {
  let i = 0;
  const result = (() => {
    const result1 = [];
    while (i < 10) {
      i++;
      continue;
    }
    return result1;
  })();
  return arrayEq(result, []);
});


test('Basic `until`', () => {
  let value;
  value = false;
  let i = 0;
  const results = (() => {
    const result = [];
    while (!value) {
      if (i === 5) { value = true; }
      result.push(i++);
    }
    return result;
  })();
  return ok(i === 6);
});


test('Basic `loop`', () => {
  let i = 5;
  const list = [];
  while (true) {
    i -= 1;
    if (i === 0) { break; }
    list.push(i * 2);
  }
  return ok(list.join(' ') === '8 6 4 2');
});


test('break at the top level', () => {
  let result;
  for (const i of [1, 2, 3]) {
    result = i;
    if (i === 2) {
      break;
    }
  }
  return eq(2, result);
});

test('break *not* at the top level', () => {
  const someFunc = function () {
    let result;
    let i = 0;
    while (++i < 3) {
      result = i;
      if (i > 1) { break; }
    }
    return result;
  };
  return eq(2, someFunc());
});

// Switch

test('basic `switch`', () => {
  const num = 10;
  const result = (() => {
    switch (num) {
      case 5: return false;
      case 'a':
        true;
        true;
        return false;
      case 10: return true;


        // Mid-switch comment with whitespace
        // and multi line
      case 11: return false;
      default: return false;
    }
  })();

  ok(result);


  const func = function (num) {
    switch (num) {
      case 2: case 4: case 6:
        return true;
      case 1: case 3: case 5:
        return false;
    }
  };

  ok(func(2));
  ok(func(6));
  ok(!func(3));
  return eq(func(8), undefined);
});


test("Ensure that trailing switch elses don't get rewritten.", () => {
  let result = false;
  switch ('word') {
    case 'one thing':
      doSomething();
      break;
    default:
      if (!false) { result = true; }
  }

  ok(result);

  result = false;
  switch ('word') {
    case 'one thing':
      doSomething();
      break;
    case 'other thing':
      doSomething();
      break;
    default:
      if (!false) { result = true; }
  }

  return ok(result);
});


test('Should be able to handle switches sans-condition.', () => {
  const result = (() => {
    switch (false) {
      case !null: return 0;
      case !!1: return 1;
      case '' in { '': '' }: return 2;
      case [] instanceof Array: return 3;
      case true !== false: return 4;
      case !('x' < 'y' && 'y' > 'z'): return 5;
      case !['b', 'c'].includes('a'): return 6;
      case !['e', 'f'].includes('d'): return 7;
      default: return ok;
    }
  })();

  return eq(result, ok);
});


test('Should be able to use `@properties` within the switch clause.', () => {
  const obj = {
    num: 101,
    func() {
      switch (this.num) {
        case 101: return '101!';
        default: return 'other';
      }
    },
  };

  return ok(obj.func() === '101!');
});


test('Should be able to use `@properties` within the switch cases.', () => {
  const obj = {
    num: 101,
    func(yesOrNo) {
      const result = (() => {
        switch (yesOrNo) {
          case true: return this.num;
          default: return 'other';
        }
      })();
      return result;
    },
  };

  return ok(obj.func(true) === 101);
});


test('Switch with break as the return value of a loop.', () => {
  let i = 10;
  const results = (() => {
    const result = [];
    while (i > 0) {
      i--;
      switch (i % 2) {
        case 1: result.push(i); break;
        case 0: break;
        default:
          result.push(undefined);
      }
    }
    return result;
  })();

  return eq(results.join(', '), '9, 7, 5, 3, 1');
});


test("Issue #997. Switch doesn't fallthrough.", () => {
  let val = 1;
  switch (true) {
    case true:
      if (false) {
        return 5;
      }
      break;
    default:
      val = 2;
  }

  return eq(val, 1);
});

// Throw

test('Throw should be usable as an expression.', () => {
  try {
    false || (() => { throw 'up'; })();
    throw new Error('failed');
  } catch (e) {
    return ok(e === 'up');
  }
});


test('#2555, strange function if bodies', () => {
  const success = () => ok(true);
  const failure = () => ok(false);

  if (((() => true))()) { success(); }

  if ((() => {
    try {
      return false;
    } catch (error) {}
  })()) { return failure(); }
});

test('#1057: `catch` or `finally` in single-line functions', () => {
  ok((function () { try { throw 'up'; } catch (error) { return true; } })());
  return ok((function () { try { return true; } finally { 'nothing'; } })());
});

test('#2367: super in for-loop', () => {
  class Foo {
    static initClass() {
      this.prototype.sum = 0;
    }

    add(val) { return this.sum += val; }
  }
  Foo.initClass();

  class Bar extends Foo {
    add(...vals) {
      for (const val of Array.from(vals)) { super.add(val); }
      return this.sum;
    }
  }

  return eq(10, (new Bar()).add(2, 3, 5));
});

test('#4267: lots of for-loops in the same scope', () => {
  // This used to include the invalid JavaScript `var do = 0`.
  const code = `\
do ->
  ${Array(200).join('for [0..0] then\n  ')}
  true\
`;
  return ok(CoffeeScript.eval(code));
});
