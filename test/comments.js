/* eslint-disable
    class-methods-use-this,
    func-names,
    implicit-arrow-linebreak,
    max-classes-per-file,
    no-constant-condition,
    no-multi-str,
    no-nested-ternary,
    no-return-assign,
    no-undef,
    no-unused-expressions,
    no-unused-vars,
    operator-linebreak,
    semi-style,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Comments
// --------

// * Single-Line Comments
// * Block Comments

// Note: awkward spacing seen in some tests is likely intentional.

test('comments in objects', () => {
  const obj1 = {
  // comment
    // comment
    // comment
    one: 1,
    // comment
    two: 2,
    // comment
  };

  ok(Object.prototype.hasOwnProperty.call(obj1, 'one'));
  eq(obj1.one, 1);
  ok(Object.prototype.hasOwnProperty.call(obj1, 'two'));
  return eq(obj1.two, 2);
});

test('comments in YAML-style objects', () => {
  const obj2 = {
  // comment
    // comment
    // comment
    three: 3,
    // comment
    four: 4,
  };
  // comment

  ok(Object.prototype.hasOwnProperty.call(obj2, 'three'));
  eq(obj2.three, 3);
  ok(Object.prototype.hasOwnProperty.call(obj2, 'four'));
  return eq(obj2.four, 4);
});

test('comments following operators that continue lines', () => {
  const sum = 1
    + 1 // comment
    + 1;
  return eq(3, sum);
});

test('comments in functions', () => {
  const fn = function () {
  // comment

    false;
    false; // comment
    false;

    // comment

    // comment
    return true;
  };

  ok(fn());

  const fn2 = () => // comment
    fn();
    // comment

  return ok(fn2());
});

test('trailing comment before an outdent', () => {
  const nonce = {};
  const fn3 = function () {
    if (true) {
      undefined; // comment
    }
    return nonce;
  };

  return eq(nonce, fn3());
});

test('comments in a switch', () => {
  const nonce = {};
  const result = (() => {
    switch (nonce) { // comment
    // comment
      case false: return undefined;
        // comment
      case null: // comment
        return undefined;
      default: return nonce; // comment
    }
  })();

  return eq(nonce, result);
});

test('comment with conditional statements', () => {
  const nonce = {};
  const result = false // comment
    ? undefined
  // comment
    : // comment
    nonce;
    // comment
  return eq(nonce, result);
});

test('spaced comments with conditional statements', () => {
  const nonce = {};
  const result = false
    ? undefined

  // comment
    : false
      ? undefined

    // comment
      : nonce;

  return eq(nonce, result);
});


// Block Comments

/*
  This is a here-comment.
  Kind of like a heredoc.
*/

test('block comments in objects', () => {
  const a = {};
  const b = {};
  const obj = {
    a,
    /*
    comment
    */
    b,
  };

  eq(a, obj.a);
  return eq(b, obj.b);
});

test('block comments in YAML-style', () => {
  const a = {};
  const b = {};
  const obj = {
    a,
    /*
    comment
    */
    b,
  };

  eq(a, obj.a);
  return eq(b, obj.b);
});


test('block comments in functions', () => {
  const nonce = {};

  const fn1 = () => true
  /*
      false
      */;

  ok(fn1());

  const fn2 = () => /*
      block comment
      */
    nonce;

  eq(nonce, fn2());

  const fn3 = () => nonce;
  /*
  block comment
  */

  eq(nonce, fn3());

  const fn4 = function () {
    let one;
    return one = function () {
      /*
        block comment
      */
      let two;
      return two = function () {
        let three;
        return three = () => nonce;
      };
    };
  };

  return eq(nonce, fn4()()()());
});

test('block comments inside class bodies', () => {
  class A {
    a() {}

    /*
    Comment
    */
    b() {}
  }

  ok(A.prototype.b instanceof Function);

  class B {
    /*
    Comment
    */
    a() {}

    b() {}
  }

  return ok(B.prototype.a instanceof Function);
});

test("#2037: herecomments shouldn't imply line terminators", () => (((() => /* */ fail)))());

test('#2916: block comment before implicit call with implicit object', () => {
  const fn = (obj) => ok(obj.a);
  /* */
  return fn({ a: true });
});

test('#3132: Format single-line block comment nicely', () => {
  const input = '\
### Single-line block comment without additional space here => ###';

  const result = `\

/* Single-line block comment without additional space here => */

\
`;
  return eq(CoffeeScript.compile(input, { bare: true }), result);
});

test('#3132: Format multi-line block comment nicely', () => {
  const input = `\
###
# Multi-line
# block
# comment
###`;

  const result = `\

/*
 * Multi-line
 * block
 * comment
 */

\
`;
  return eq(CoffeeScript.compile(input, { bare: true }), result);
});

test('#3132: Format simple block comment nicely', () => {
  const input = `\
###
No
Preceding hash
###`;

  const result = `\

/*
No
Preceding hash
 */

\
`;

  return eq(CoffeeScript.compile(input, { bare: true }), result);
});

test('#3132: Format indented block-comment nicely', () => {
  const input = `\
fn = () ->
  ###
  # Indented
  Multiline
  ###
  1`;

  const result = `\
var fn;

fn = function() {

  /*
   * Indented
  Multiline
   */
  return 1;
};
\
`;
  return eq(CoffeeScript.compile(input, { bare: true }), result);
});

// Although adequately working, block comment-placement is not yet perfect.
// (Considering a case where multiple variables have been declared …)
test('#3132: Format jsdoc-style block-comment nicely', () => {
  const input = `\
###*
# Multiline for jsdoc-"@doctags"
#
# @type {Function}
###
fn = () -> 1\
`;

  const result = `\

/**
 * Multiline for jsdoc-"@doctags"
 *
 * @type {Function}
 */
var fn;

fn = function() {
  return 1;
};
\
`;
  return eq(CoffeeScript.compile(input, { bare: true }), result);
});

// Although adequately working, block comment-placement is not yet perfect.
// (Considering a case where multiple variables have been declared …)
test('#3132: Format hand-made (raw) jsdoc-style block-comment nicely', () => {
  const input = `\
###*
 * Multiline for jsdoc-"@doctags"
 *
 * @type {Function}
###
fn = () -> 1\
`;

  const result = `\

/**
 * Multiline for jsdoc-"@doctags"
 *
 * @type {Function}
 */
var fn;

fn = function() {
  return 1;
};
\
`;
  return eq(CoffeeScript.compile(input, { bare: true }), result);
});

// Although adequately working, block comment-placement is not yet perfect.
// (Considering a case where multiple variables have been declared …)
test('#3132: Place block-comments nicely', () => {
  const input = `\
###*
# A dummy class definition
#
# @class
###
class DummyClass

  ###*
  # @constructor
  ###
  constructor: ->

  ###*
  # Singleton reference
  #
  # @type {DummyClass}
  ###
  @instance = new DummyClass()
\
`;

  const result = `\

/**
 * A dummy class definition
 *
 * @class
 */
var DummyClass;

DummyClass = (function() {

  /**
   * @constructor
   */
  function DummyClass() {}


  /**
   * Singleton reference
   *
   * @type {DummyClass}
   */

  DummyClass.instance = new DummyClass();

  return DummyClass;

})();
\
`;
  return eq(CoffeeScript.compile(input, { bare: true }), result);
});

test('#3638: Demand a whitespace after # symbol', () => {
  const input = `\
###
#No
#whitespace
###`;

  const result = `\

/*
#No
#whitespace
 */

\
`;

  return eq(CoffeeScript.compile(input, { bare: true }), result);
});

test('#3761: Multiline comment at end of an object', () => {
  const anObject = {
    x: 3,
    /*
     *Comment
     */
  };

  return ok(anObject.x === 3);
});

test('#4375: UTF-8 characters in comments', () => // 智に働けば角が立つ、情に掉させば流される。
  ok(true));
