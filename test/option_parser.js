/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * DS209: Avoid top-level return
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Option Parser
// -------------

// TODO: refactor option parser tests

// Ensure that the OptionParser handles arguments correctly.
if (typeof require === 'undefined' || require === null) { return; }
const {OptionParser} = require('./../lib/coffee-script/optparse');

const opt = new OptionParser([
  ['-r', '--required [DIR]',  'desc required'],
  ['-o', '--optional',        'desc optional'],
  ['-l', '--list [FILES*]',   'desc list']
]);

test("basic arguments", function() {
  const args = ['one', 'two', 'three', '-r', 'dir'];
  const result = opt.parse(args);
  arrayEq(args, result.arguments);
  return eq(undefined, result.required);
});

test("boolean and parameterised options", function() {
  const result = opt.parse(['--optional', '-r', 'folder', 'one', 'two']);
  ok(result.optional);
  eq('folder', result.required);
  return arrayEq(['one', 'two'], result.arguments);
});

test("list options", function() {
  const result = opt.parse(['-l', 'one.txt', '-l', 'two.txt', 'three']);
  arrayEq(['one.txt', 'two.txt'], result.list);
  return arrayEq(['three'], result.arguments);
});

test("-- and interesting combinations", function() {
  let result = opt.parse(['-o','-r','a','-r','b','-o','--','-a','b','--c','d']);
  arrayEq(['-a', 'b', '--c', 'd'], result.arguments);
  ok(result.optional);
  eq('b', result.required);

  const args = ['--','-o','a','-r','c','-o','--','-a','arg0','-b','arg1'];
  result = opt.parse(args);
  eq(undefined, result.optional);
  eq(undefined, result.required);
  return arrayEq(args.slice(1), result.arguments);
});
