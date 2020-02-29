var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable
    class-methods-use-this,
    consistent-return,
    func-names,
    max-len,
    no-cond-assign,
    no-continue,
    no-multi-assign,
    no-new-wrappers,
    no-param-reassign,
    no-plusplus,
    no-restricted-syntax,
    no-return-assign,
    no-shadow,
    no-underscore-dangle,
    no-unused-vars,
    no-use-before-define,
    no-var,
    vars-on-top,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS202: Simplify dynamic range loops
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// The CoffeeScript language has a good deal of optional syntax, implicit syntax,
// and shorthand syntax. This can greatly complicate a grammar and bloat
// the resulting parse table. Instead of making the parser handle it all, we take
// a series of passes over the token stream, using this **Rewriter** to convert
// shorthand into the unambiguous long form, add implicit indentation and
// parentheses, and generally clean things up.

// Create a generated token: one that exists due to a use of implicit syntax.
var INVERSES = void 0;var Rewriter = void 0;
var generate = function generate(tag, value, origin) {
  var tok = [tag, value];
  tok.generated = true;
  if (origin) {
    tok.origin = origin;
  }
  return tok;
};

// The **Rewriter** class is used by the [Lexer](lexer.html), directly against
// its internal array of tokens.
exports.Rewriter = Rewriter = function () {
  Rewriter = function () {
    function Rewriter() {
      _classCallCheck(this, Rewriter);
    }

    _createClass(Rewriter, [{
      key: 'rewrite',


      // Rewrite the token stream in multiple passes, one logical filter at
      // a time. This could certainly be changed into a single pass through the
      // stream, with a big ol' efficient switch, but it's much nicer to work with
      // like this. The order of these passes matters -- indentation must be
      // corrected before implicit parentheses can be wrapped around blocks of code.
      value: function rewrite(tokens) {
        // Helpful snippet for debugging:
        //     console.log (t[0] + '/' + t[1] for t in @tokens).join ' '
        this.tokens = tokens;
        this.removeLeadingNewlines();
        this.closeOpenCalls();
        this.closeOpenIndexes();
        this.normalizeLines();
        this.tagPostfixConditionals();
        this.addImplicitBracesAndParens();
        this.addLocationDataToGeneratedTokens();
        this.fixOutdentLocationData();
        return this.tokens;
      }

      // Rewrite the token stream, looking one token ahead and behind.
      // Allow the return value of the block to tell us how many tokens to move
      // forwards (or backwards) in the stream, to make sure we don't miss anything
      // as tokens are inserted and removed, and the stream changes length under
      // our feet.

    }, {
      key: 'scanTokens',
      value: function scanTokens(block) {
        var token = void 0;
        var tokens = this.tokens;

        var i = 0;
        while (token = tokens[i]) {
          i += block.call(this, token, i, tokens);
        }
        return true;
      }
    }, {
      key: 'detectEnd',
      value: function detectEnd(i, condition, action) {
        var token = void 0;
        var tokens = this.tokens;

        var levels = 0;
        while (token = tokens[i]) {
          if (levels === 0 && condition.call(this, token, i)) {
            return action.call(this, token, i);
          }
          if (!token || levels < 0) {
            return action.call(this, token, i - 1);
          }
          if (Array.from(EXPRESSION_START).includes(token[0])) {
            levels += 1;
          } else if (Array.from(EXPRESSION_END).includes(token[0])) {
            levels -= 1;
          }
          i += 1;
        }
        return i - 1;
      }

      // Leading newlines would introduce an ambiguity in the grammar, so we
      // dispatch them here.

    }, {
      key: 'removeLeadingNewlines',
      value: function removeLeadingNewlines() {
        var i = void 0;
        for (i = 0; i < this.tokens.length; i++) {
          var _tokens$i = _slicedToArray(this.tokens[i], 1),
              tag = _tokens$i[0];

          if (tag !== 'TERMINATOR') {
            break;
          }
        }
        if (i) {
          return this.tokens.splice(0, i);
        }
      }

      // The lexer has tagged the opening parenthesis of a method call. Match it with
      // its paired close. We have the mis-nested outdent case included here for
      // calls that close on the same line, just before their outdent.

    }, {
      key: 'closeOpenCalls',
      value: function closeOpenCalls() {
        var condition = function condition(token, i) {
          return [')', 'CALL_END'].includes(token[0]) || token[0] === 'OUTDENT' && this.tag(i - 1) === ')';
        };

        var action = function action(token, i) {
          return this.tokens[token[0] === 'OUTDENT' ? i - 1 : i][0] = 'CALL_END';
        };

        return this.scanTokens(function (token, i) {
          if (token[0] === 'CALL_START') {
            this.detectEnd(i + 1, condition, action);
          }
          return 1;
        });
      }

      // The lexer has tagged the opening parenthesis of an indexing operation call.
      // Match it with its paired close.

    }, {
      key: 'closeOpenIndexes',
      value: function closeOpenIndexes() {
        var condition = function condition(token, i) {
          return [']', 'INDEX_END'].includes(token[0]);
        };

        var action = function action(token, i) {
          return token[0] = 'INDEX_END';
        };

        return this.scanTokens(function (token, i) {
          if (token[0] === 'INDEX_START') {
            this.detectEnd(i + 1, condition, action);
          }
          return 1;
        });
      }

      // Match tags in token stream starting at `i` with `pattern`, skipping 'HERECOMMENT's.
      // `pattern` may consist of strings (equality), an array of strings (one of)
      // or null (wildcard). Returns the index of the match or -1 if no match.

    }, {
      key: 'indexOfTag',
      value: function indexOfTag(i) {
        var j = void 0;
        var asc = void 0;var end = void 0;
        var fuzz = 0;

        for (var _len = arguments.length, pattern = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          pattern[_key - 1] = arguments[_key];
        }

        for (j = 0, end = pattern.length, asc = end >= 0; asc ? j < end : j > end; asc ? j++ : j--) {
          var needle;
          while (this.tag(i + j + fuzz) === 'HERECOMMENT') {
            fuzz += 2;
          }
          if (pattern[j] == null) {
            continue;
          }
          if (typeof pattern[j] === 'string') {
            pattern[j] = [pattern[j]];
          }
          if (needle = this.tag(i + j + fuzz), !Array.from(pattern[j]).includes(needle)) {
            return -1;
          }
        }
        return i + j + fuzz - 1;
      }

      // Returns `yes` if standing in front of something looking like
      // `@<x>:`, `<x>:` or `<EXPRESSION_START><x>...<EXPRESSION_END>:`,
      // skipping over 'HERECOMMENT's.

    }, {
      key: 'looksObjectish',
      value: function looksObjectish(j) {
        if (this.indexOfTag(j, '@', null, ':') > -1 || this.indexOfTag(j, null, ':') > -1) {
          return true;
        }
        var index = this.indexOfTag(j, EXPRESSION_START);
        if (index > -1) {
          var end = null;
          this.detectEnd(index + 1, function (token) {
            return Array.from(EXPRESSION_END).includes(token[0]);
          }, function (token, i) {
            return end = i;
          });
          if (this.tag(end + 1) === ':') {
            return true;
          }
        }
        return false;
      }

      // Returns `yes` if current line of tokens contain an element of tags on same
      // expression level. Stop searching at LINEBREAKS or explicit start of
      // containing balanced expression.

    }, {
      key: 'findTagsBackwards',
      value: function findTagsBackwards(i, tags) {
        var needle = void 0;var needle1 = void 0;var needle2 = void 0;
        var needle5 = void 0;
        var backStack = [];
        while (i >= 0 && (backStack.length || (needle = this.tag(i), !Array.from(tags).includes(needle)) && ((needle1 = this.tag(i), !Array.from(EXPRESSION_START).includes(needle1)) || this.tokens[i].generated) && (needle2 = this.tag(i), !Array.from(LINEBREAKS).includes(needle2)))) {
          var needle3;var needle4;
          if (needle3 = this.tag(i), Array.from(EXPRESSION_END).includes(needle3)) {
            backStack.push(this.tag(i));
          }
          if ((needle4 = this.tag(i), Array.from(EXPRESSION_START).includes(needle4)) && backStack.length) {
            backStack.pop();
          }
          i -= 1;
        }
        return needle5 = this.tag(i), Array.from(tags).includes(needle5);
      }

      // Look for signs of implicit calls and objects in the token stream and
      // add them.

    }, {
      key: 'addImplicitBracesAndParens',
      value: function addImplicitBracesAndParens() {
        // Track current balancing depth (both implicit and explicit) on stack.
        var stack = [];
        var start = null;

        return this.scanTokens(function (token, i, tokens) {
          var _this = this;

          var prevToken = void 0;var stackIdx = void 0;var stackTag = void 0;var startsLine = void 0;

          var _Array$from = Array.from(token),
              _Array$from2 = _slicedToArray(_Array$from, 1),
              tag = _Array$from2[0];

          var _Array$from3 = Array.from(prevToken = i > 0 ? tokens[i - 1] : []),
              _Array$from4 = _slicedToArray(_Array$from3, 1),
              prevTag = _Array$from4[0];

          var _Array$from5 = Array.from(i < tokens.length - 1 ? tokens[i + 1] : []),
              _Array$from6 = _slicedToArray(_Array$from5, 1),
              nextTag = _Array$from6[0];

          var stackTop = function stackTop() {
            return stack[stack.length - 1];
          };
          var startIdx = i;

          // Helper function, used for keeping track of the number of tokens consumed
          // and spliced, when returning for getting a new token.
          var forward = function forward(n) {
            return i - startIdx + n;
          };

          // Helper functions
          var isImplicit = function isImplicit(stackItem) {
            return __guard__(stackItem != null ? stackItem[2] : undefined, function (x) {
              return x.ours;
            });
          };
          var isImplicitObject = function isImplicitObject(stackItem) {
            return isImplicit(stackItem) && (stackItem != null ? stackItem[0] : undefined) === '{';
          };
          var isImplicitCall = function isImplicitCall(stackItem) {
            return isImplicit(stackItem) && (stackItem != null ? stackItem[0] : undefined) === '(';
          };
          var inImplicit = function inImplicit() {
            return isImplicit(stackTop());
          };
          var inImplicitCall = function inImplicitCall() {
            return isImplicitCall(stackTop());
          };
          var inImplicitObject = function inImplicitObject() {
            return isImplicitObject(stackTop());
          };
          // Unclosed control statement inside implicit parens (like
          // class declaration or if-conditionals)
          var inImplicitControl = function inImplicitControl() {
            return inImplicit && __guard__(stackTop(), function (x) {
              return x[0];
            }) === 'CONTROL';
          };

          var startImplicitCall = function startImplicitCall(j) {
            var idx = j != null ? j : i;
            stack.push(['(', idx, { ours: true }]);
            tokens.splice(idx, 0, generate('CALL_START', '(', ['', 'implicit function call', token[2]]));
            if (j == null) {
              return i += 1;
            }
          };

          var endImplicitCall = function endImplicitCall() {
            stack.pop();
            tokens.splice(i, 0, generate('CALL_END', ')', ['', 'end of input', token[2]]));
            return i += 1;
          };

          var startImplicitObject = function startImplicitObject(j, startsLine) {
            if (startsLine == null) {
              startsLine = true;
            }
            var idx = j != null ? j : i;
            stack.push(['{', idx, { sameLine: true, startsLine: startsLine, ours: true }]);
            var val = new String('{');
            val.generated = true;
            tokens.splice(idx, 0, generate('{', val, token));
            if (j == null) {
              return i += 1;
            }
          };

          var endImplicitObject = function endImplicitObject(j) {
            j = j != null ? j : i;
            stack.pop();
            tokens.splice(j, 0, generate('}', '}', token));
            return i += 1;
          };

          // Don't end an implicit call on next indent if any of these are in an argument
          if (inImplicitCall() && ['IF', 'TRY', 'FINALLY', 'CATCH', 'CLASS', 'SWITCH'].includes(tag)) {
            stack.push(['CONTROL', i, { ours: true }]);
            return forward(1);
          }

          if (tag === 'INDENT' && inImplicit()) {
            // An `INDENT` closes an implicit call unless
            //
            //  1. We have seen a `CONTROL` argument on the line.
            //  2. The last token before the indent is part of the list below
            //
            if (!['=>', '->', '[', '(', ',', '{', 'TRY', 'ELSE', '='].includes(prevTag)) {
              while (inImplicitCall()) {
                endImplicitCall();
              }
            }
            if (inImplicitControl()) {
              stack.pop();
            }
            stack.push([tag, i]);
            return forward(1);
          }

          // Straightforward start of explicit expression
          if (Array.from(EXPRESSION_START).includes(tag)) {
            stack.push([tag, i]);
            return forward(1);
          }

          // Close all implicit expressions inside of explicitly closed expressions.
          if (Array.from(EXPRESSION_END).includes(tag)) {
            while (inImplicit()) {
              if (inImplicitCall()) {
                endImplicitCall();
              } else if (inImplicitObject()) {
                endImplicitObject();
              } else {
                stack.pop();
              }
            }
            start = stack.pop();
          }

          // Recognize standard implicit calls like
          // f a, f() b, f? c, h[0] d etc.
          if ((Array.from(IMPLICIT_FUNC).includes(tag) && token.spaced || tag === '?' && i > 0 && !tokens[i - 1].spaced) && (Array.from(IMPLICIT_CALL).includes(nextTag) || Array.from(IMPLICIT_UNSPACED_CALL).includes(nextTag) && !__guard__(tokens[i + 1], function (x) {
            return x.spaced;
          }) && !__guard__(tokens[i + 1], function (x1) {
            return x1.newLine;
          }))) {
            if (tag === '?') {
              tag = token[0] = 'FUNC_EXIST';
            }
            startImplicitCall(i + 1);
            return forward(2);
          }

          // Implicit call taking an implicit indented object as first argument.
          //
          //     f
          //       a: b
          //       c: d
          //
          // and
          //
          //     f
          //       1
          //       a: b
          //       b: c
          //
          // Don't accept implicit calls of this type, when on the same line
          // as the control structures below as that may misinterpret constructs like:
          //
          //     if f
          //        a: 1
          // as
          //
          //     if f(a: 1)
          //
          // which is probably always unintended.
          // Furthermore don't allow this in literal arrays, as
          // that creates grammatical ambiguities.
          if (Array.from(IMPLICIT_FUNC).includes(tag) && this.indexOfTag(i + 1, 'INDENT') > -1 && this.looksObjectish(i + 2) && !this.findTagsBackwards(i, ['CLASS', 'EXTENDS', 'IF', 'CATCH', 'SWITCH', 'LEADING_WHEN', 'FOR', 'WHILE', 'UNTIL'])) {
            startImplicitCall(i + 1);
            stack.push(['INDENT', i + 2]);
            return forward(3);
          }

          // Implicit objects start here
          if (tag === ':') {
            // Go back to the (implicit) start of the object
            var needle1 = void 0;
            var s = function () {
              var needle = void 0;
              switch (false) {
                case (needle = _this.tag(i - 1), !Array.from(EXPRESSION_END).includes(needle)):
                  return start[1];
                case _this.tag(i - 2) !== '@':
                  return i - 2;
                default:
                  return i - 1;
              }
            }();
            while (this.tag(s - 2) === 'HERECOMMENT') {
              s -= 2;
            }

            // Mark if the value is a for loop
            this.insideForDeclaration = nextTag === 'FOR';

            startsLine = s === 0 || (needle1 = this.tag(s - 1), Array.from(LINEBREAKS).includes(needle1)) || tokens[s - 1].newLine;
            // Are we just continuing an already declared object?
            if (stackTop()) {
              var _Array$from7 = Array.from(stackTop());

              var _Array$from8 = _slicedToArray(_Array$from7, 2);

              stackTag = _Array$from8[0];
              stackIdx = _Array$from8[1];

              if ((stackTag === '{' || stackTag === 'INDENT' && this.tag(stackIdx - 1) === '{') && (startsLine || this.tag(s - 1) === ',' || this.tag(s - 1) === '{')) {
                return forward(1);
              }
            }

            startImplicitObject(s, !!startsLine);
            return forward(2);
          }

          // End implicit calls when chaining method calls
          // like e.g.:
          //
          //     f ->
          //       a
          //     .g b, ->
          //       c
          //     .h a
          //
          // and also
          //
          //     f a
          //     .g b
          //     .h a

          // Mark all enclosing objects as not sameLine
          if (Array.from(LINEBREAKS).includes(tag)) {
            for (var j = stack.length - 1; j >= 0; j--) {
              var stackItem = stack[j];
              if (!isImplicit(stackItem)) {
                break;
              }
              if (isImplicitObject(stackItem)) {
                stackItem[2].sameLine = false;
              }
            }
          }

          var newLine = prevTag === 'OUTDENT' || prevToken.newLine;
          if (Array.from(IMPLICIT_END).includes(tag) || Array.from(CALL_CLOSERS).includes(tag) && newLine) {
            while (inImplicit()) {
              var sameLine = void 0;

              // Close implicit calls when reached end of argument list
              var _Array$from9 = Array.from(stackTop());

              var _Array$from10 = _slicedToArray(_Array$from9, 3);

              stackTag = _Array$from10[0];
              stackIdx = _Array$from10[1];
              var _Array$from10$ = _Array$from10[2];
              sameLine = _Array$from10$.sameLine;
              startsLine = _Array$from10$.startsLine;
              if (inImplicitCall() && prevTag !== ',') {
                endImplicitCall();
                // Close implicit objects such as:
                // return a: 1, b: 2 unless true
              } else if (inImplicitObject() && !this.insideForDeclaration && sameLine && tag !== 'TERMINATOR' && prevTag !== ':') {
                endImplicitObject();
                // Close implicit objects when at end of line, line didn't end with a comma
                // and the implicit object didn't start the line or the next line doesn't look like
                // the continuation of an object.
              } else if (inImplicitObject() && tag === 'TERMINATOR' && prevTag !== ',' && !(startsLine && this.looksObjectish(i + 1))) {
                if (nextTag === 'HERECOMMENT') {
                  return forward(1);
                }
                endImplicitObject();
              } else {
                break;
              }
            }
          }

          // Close implicit object if comma is the last character
          // and what comes after doesn't look like it belongs.
          // This is used for trailing commas and calls, like:
          //
          //     x =
          //         a: b,
          //         c: d,
          //     e = 2
          //
          // and
          //
          //     f a, b: c, d: e, f, g: h: i, j
          //
          if (tag === ',' && !this.looksObjectish(i + 1) && inImplicitObject() && !this.insideForDeclaration && (nextTag !== 'TERMINATOR' || !this.looksObjectish(i + 2))) {
            // When nextTag is OUTDENT the comma is insignificant and
            // should just be ignored so embed it in the implicit object.
            //
            // When it isn't the comma go on to play a role in a call or
            // array further up the stack, so give it a chance.

            var offset = nextTag === 'OUTDENT' ? 1 : 0;
            while (inImplicitObject()) {
              endImplicitObject(i + offset);
            }
          }
          return forward(1);
        });
      }

      // Add location data to all tokens generated by the rewriter.

    }, {
      key: 'addLocationDataToGeneratedTokens',
      value: function addLocationDataToGeneratedTokens() {
        return this.scanTokens(function (token, i, tokens) {
          var column = void 0;var line = void 0;var nextLocation = void 0;var prevLocation = void 0;
          if (token[2]) {
            return 1;
          }
          if (!token.generated && !token.explicit) {
            return 1;
          }
          if (token[0] === '{' && (nextLocation = __guard__(tokens[i + 1], function (x) {
            return x[2];
          }))) {
            var _nextLocation = nextLocation;
            line = _nextLocation.first_line;
            column = _nextLocation.first_column;
          } else if (prevLocation = __guard__(tokens[i - 1], function (x1) {
            return x1[2];
          })) {
            var _prevLocation = prevLocation;
            line = _prevLocation.last_line;
            column = _prevLocation.last_column;
          } else {
            line = column = 0;
          }
          token[2] = {
            first_line: line,
            first_column: column,
            last_line: line,
            last_column: column
          };
          return 1;
        });
      }

      // OUTDENT tokens should always be positioned at the last character of the
      // previous token, so that AST nodes ending in an OUTDENT token end up with a
      // location corresponding to the last "real" token under the node.

    }, {
      key: 'fixOutdentLocationData',
      value: function fixOutdentLocationData() {
        return this.scanTokens(function (token, i, tokens) {
          if (token[0] !== 'OUTDENT' && (!token.generated || token[0] !== 'CALL_END') && (!token.generated || token[0] !== '}')) {
            return 1;
          }
          var prevLocationData = tokens[i - 1][2];
          token[2] = {
            first_line: prevLocationData.last_line,
            first_column: prevLocationData.last_column,
            last_line: prevLocationData.last_line,
            last_column: prevLocationData.last_column
          };
          return 1;
        });
      }

      // Because our grammar is LALR(1), it can't handle some single-line
      // expressions that lack ending delimiters. The **Rewriter** adds the implicit
      // blocks, so it doesn't need to. To keep the grammar clean and tidy, trailing
      // newlines within expressions are removed and the indentation tokens of empty
      // blocks are added.

    }, {
      key: 'normalizeLines',
      value: function normalizeLines() {
        var indent = void 0;var outdent = void 0;
        var starter = indent = outdent = null;

        var condition = function condition(token, i) {
          var needle = void 0;
          return token[1] !== ';' && Array.from(SINGLE_CLOSERS).includes(token[0]) && !(token[0] === 'TERMINATOR' && (needle = this.tag(i + 1), Array.from(EXPRESSION_CLOSE).includes(needle))) && !(token[0] === 'ELSE' && starter !== 'THEN') && !(['CATCH', 'FINALLY'].includes(token[0]) && ['->', '=>'].includes(starter)) || Array.from(CALL_CLOSERS).includes(token[0]) && (this.tokens[i - 1].newLine || this.tokens[i - 1][0] === 'OUTDENT');
        };

        var action = function action(token, i) {
          return this.tokens.splice(this.tag(i - 1) === ',' ? i - 1 : i, 0, outdent);
        };

        return this.scanTokens(function (token, i, tokens) {
          var _Array$from11 = Array.from(token),
              _Array$from12 = _slicedToArray(_Array$from11, 1),
              tag = _Array$from12[0];

          if (tag === 'TERMINATOR') {
            var needle = void 0;
            if (this.tag(i + 1) === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
              tokens.splice.apply(tokens, [i, 1].concat(_toConsumableArray(Array.from(this.indentation()))));
              return 1;
            }
            if (needle = this.tag(i + 1), Array.from(EXPRESSION_CLOSE).includes(needle)) {
              tokens.splice(i, 1);
              return 0;
            }
          }
          if (tag === 'CATCH') {
            for (var j = 1; j <= 2; j++) {
              var needle1;
              if (needle1 = this.tag(i + j), ['OUTDENT', 'TERMINATOR', 'FINALLY'].includes(needle1)) {
                tokens.splice.apply(tokens, [i + j, 0].concat(_toConsumableArray(Array.from(this.indentation()))));
                return 2 + j;
              }
            }
          }
          if (Array.from(SINGLE_LINERS).includes(tag) && this.tag(i + 1) !== 'INDENT' && !(tag === 'ELSE' && this.tag(i + 1) === 'IF')) {
            starter = tag;

            var _Array$from13 = Array.from(this.indentation(tokens[i]));

            var _Array$from14 = _slicedToArray(_Array$from13, 2);

            indent = _Array$from14[0];
            outdent = _Array$from14[1];

            if (starter === 'THEN') {
              indent.fromThen = true;
            }
            tokens.splice(i + 1, 0, indent);
            this.detectEnd(i + 2, condition, action);
            if (tag === 'THEN') {
              tokens.splice(i, 1);
            }
            return 1;
          }
          return 1;
        });
      }

      // Tag postfix conditionals as such, so that we can parse them with a
      // different precedence.

    }, {
      key: 'tagPostfixConditionals',
      value: function tagPostfixConditionals() {
        var original = null;

        var condition = function condition(token, i) {
          var _Array$from15 = Array.from(token),
              _Array$from16 = _slicedToArray(_Array$from15, 1),
              tag = _Array$from16[0];

          var _Array$from17 = Array.from(this.tokens[i - 1]),
              _Array$from18 = _slicedToArray(_Array$from17, 1),
              prevTag = _Array$from18[0];

          return tag === 'TERMINATOR' || tag === 'INDENT' && !Array.from(SINGLE_LINERS).includes(prevTag);
        };

        var action = function action(token, i) {
          if (token[0] !== 'INDENT' || token.generated && !token.fromThen) {
            return original[0] = 'POST_' + original[0];
          }
        };

        return this.scanTokens(function (token, i) {
          if (token[0] !== 'IF') {
            return 1;
          }
          original = token;
          this.detectEnd(i + 1, condition, action);
          return 1;
        });
      }

      // Generate the indentation tokens, based on another token on the same line.

    }, {
      key: 'indentation',
      value: function indentation(origin) {
        var indent = ['INDENT', 2];
        var outdent = ['OUTDENT', 2];
        if (origin) {
          indent.generated = outdent.generated = true;
          indent.origin = outdent.origin = origin;
        } else {
          indent.explicit = outdent.explicit = true;
        }
        return [indent, outdent];
      }

      // Look up a tag by token index.

    }, {
      key: 'tag',
      value: function tag(i) {
        return this.tokens[i] != null ? this.tokens[i][0] : undefined;
      }
    }], [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.generate = generate;
      }
    }]);

    return Rewriter;
  }();
  Rewriter.initClass();
  return Rewriter;
}();

// Constants
// ---------

// List of the token pairs that must be balanced.
var BALANCED_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['INDENT', 'OUTDENT'], ['CALL_START', 'CALL_END'], ['PARAM_START', 'PARAM_END'], ['INDEX_START', 'INDEX_END'], ['STRING_START', 'STRING_END'], ['REGEX_START', 'REGEX_END']];

// The inverse mappings of `BALANCED_PAIRS` we're trying to fix up, so we can
// look things up from either end.
exports.INVERSES = INVERSES = {};

// The tokens that signal the start/end of a balanced pair.
var EXPRESSION_START = [];
var EXPRESSION_END = [];

var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = Array.from(BALANCED_PAIRS)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var _ref = _step.value;

    var _ref2 = _slicedToArray(_ref, 2);

    var left = _ref2[0];
    var rite = _ref2[1];

    EXPRESSION_START.push(INVERSES[rite] = left);
    EXPRESSION_END.push(INVERSES[left] = rite);
  }

  // Tokens that indicate the close of a clause of an expression.
} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator.return) {
      _iterator.return();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}

var EXPRESSION_CLOSE = ['CATCH', 'THEN', 'ELSE', 'FINALLY'].concat(EXPRESSION_END);

// Tokens that, if followed by an `IMPLICIT_CALL`, indicate a function invocation.
var IMPLICIT_FUNC = ['IDENTIFIER', 'PROPERTY', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS'];

// If preceded by an `IMPLICIT_FUNC`, indicates a function invocation.
var IMPLICIT_CALL = ['IDENTIFIER', 'PROPERTY', 'NUMBER', 'INFINITY', 'NAN', 'STRING', 'STRING_START', 'REGEX', 'REGEX_START', 'JS', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'UNDEFINED', 'NULL', 'BOOL', 'UNARY', 'YIELD', 'UNARY_MATH', 'SUPER', 'THROW', '@', '->', '=>', '[', '(', '{', '--', '++'];

var IMPLICIT_UNSPACED_CALL = ['+', '-'];

// Tokens that always mark the end of an implicit call for single-liners.
var IMPLICIT_END = ['POST_IF', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR'];

// Single-line flavors of block expressions that have unclosed endings.
// The grammar can't disambiguate them, so we insert the implicit indentation.
var SINGLE_LINERS = ['ELSE', '->', '=>', 'TRY', 'FINALLY', 'THEN'];
var SINGLE_CLOSERS = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN'];

// Tokens that end a line.
var LINEBREAKS = ['TERMINATOR', 'INDENT', 'OUTDENT'];

// Tokens that close open calls when they follow a newline.
var CALL_CLOSERS = ['.', '?.', '::', '?::'];

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null ? transform(value) : undefined;
}