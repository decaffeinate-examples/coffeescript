/* eslint-disable
    consistent-return,
    func-names,
    implicit-arrow-linebreak,
    max-len,
    no-plusplus,
    no-self-compare,
    no-undef,
    no-var,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
global.skippedTest = function (description, fn) {};

/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// See http://wiki.ecmascript.org/doku.php?id=harmony:egal
const egal = function (a, b) {
  if (a === b) {
    return (a !== 0) || ((1 / a) === (1 / b));
  }
  return (a !== a) && (b !== b);
};

// A recursive functional equivalence helper; uses egal for testing equivalence.
var arrayEgal = function (a, b) {
  if (egal(a, b)) {
    return true;
  } if (a instanceof Array && b instanceof Array) {
    if (a.length !== b.length) { return false; }
    for (let idx = 0; idx < a.length; idx++) { const el = a[idx]; if (!arrayEgal(el, b[idx])) { return false; } }
    return true;
  }
};

exports.eq = (a, b, msg) => ok(egal(a, b), msg || `Expected ${a} to equal ${b}`);
exports.arrayEq = (a, b, msg) => ok(arrayEgal(a, b), msg || `Expected ${a} to deep equal ${b}`);

exports.toJS = (str) => // Trim leading/trailing whitespace
  CoffeeScript.compile(str, { bare: true })
    .replace(/^\s+|\s+$/g, '');
