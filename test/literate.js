/* eslint-disable
    implicit-arrow-linebreak,
    no-undef,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Literate CoffeeScript Test
// --------------------------
//
// comment comment
test('basic literate CoffeeScript parsing', () => ok(true));

// now with a...
test('broken up indentation', () => // ... broken up ...
  (() => // ... nested block.
    ok(true))());

// Code must be separated from text by a blank line.
test('code blocks must be preceded by a blank line', () => // The next line is part of the text and will not be executed.
//       fail()
  ok(true));

// Code in `backticks is not parsed` and...
test('comments in indented blocks work', () => {
  ((() => ((() => // Regular comment.

  /*
          Block comment.
        */

    ok(true)))()))();

  // Regular [Markdown](http://example.com/markdown) features, like links
  // and unordered lists, are fine:
  //
  //   * I
  //
  //   * Am
  //
  //   * A
  //
  //   * List
  //
  // Tabs work too:
  return test('tabbed code', () => ok(true));
});
