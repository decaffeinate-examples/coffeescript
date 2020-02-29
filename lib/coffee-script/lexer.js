var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable
    camelcase,
    class-methods-use-this,
    consistent-return,
    default-case,
    func-names,
    guard-for-in,
    implicit-arrow-linebreak,
    max-len,
    no-cond-assign,
    no-constant-condition,
    no-continue,
    no-multi-assign,
    no-multi-str,
    no-param-reassign,
    no-plusplus,
    no-restricted-syntax,
    no-return-assign,
    no-shadow,
    no-unused-expressions,
    no-unused-vars,
    no-use-before-define,
    no-var,
    prefer-const,
    prefer-destructuring,
    vars-on-top,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// The CoffeeScript Lexer. Uses a series of token-matching regexes to attempt
// matches against the beginning of the source code. When a match is found,
// a token is produced, we consume the match, and start again. Tokens are in the
// form:
//
//     [tag, value, locationData]
//
// where locationData is {first_line, first_column, last_line, last_column}, which is a
// format that can be fed directly into [Jison](https://github.com/zaach/jison).  These
// are read by jison in the `parser.lexer` function defined in coffee-script.coffee.

var Lexer = void 0;

var _require = require('./rewriter'),
    Rewriter = _require.Rewriter,
    INVERSES = _require.INVERSES;

// Import the helpers we need.


var _require2 = require('./helpers'),
    count = _require2.count,
    starts = _require2.starts,
    compact = _require2.compact,
    repeat = _require2.repeat,
    invertLiterate = _require2.invertLiterate,
    locationDataToString = _require2.locationDataToString,
    throwSyntaxError = _require2.throwSyntaxError;

// The Lexer Class
// ---------------

// The Lexer class reads a stream of CoffeeScript and divvies it up into tagged
// tokens. Some potential ambiguity in the grammar has been avoided by
// pushing some extra smarts into the Lexer.


exports.Lexer = Lexer = function () {
  function Lexer() {
    _classCallCheck(this, Lexer);
  }

  _createClass(Lexer, [{
    key: 'tokenize',

    // **tokenize** is the Lexer's main method. Scan by attempting to match tokens
    // one at a time, using a regular expression anchored at the start of the
    // remaining code, or a custom recursive token-matching method
    // (for interpolations). When the next token has been recorded, we move forward
    // within the code past the token, and begin again.
    //
    // Each tokenizing method is responsible for returning the number of characters
    // it has consumed.
    //
    // Before returning the token stream, run it through the [Rewriter](rewriter.html).
    value: function tokenize(code, opts) {
      var end = void 0;
      if (opts == null) {
        opts = {};
      }
      this.literate = opts.literate; // Are we lexing literate CoffeeScript?
      this.indent = 0; // The current indentation level.
      this.baseIndent = 0; // The overall minimum indentation level
      this.indebt = 0; // The over-indentation at the current level.
      this.outdebt = 0; // The under-outdentation at the current level.
      this.indents = []; // The stack of all current indentation levels.
      this.ends = []; // The stack for pairing up tokens.
      this.tokens = []; // Stream of parsed tokens in the form `['TYPE', value, location data]`.
      this.seenFor = false; // Used to recognize FORIN, FOROF and FORFROM tokens.
      this.seenImport = false; // Used to recognize IMPORT FROM? AS? tokens.
      this.seenExport = false; // Used to recognize EXPORT FROM? AS? tokens.
      this.importSpecifierList = false; // Used to identify when in an IMPORT {...} FROM? ...
      this.exportSpecifierList = false; // Used to identify when in an EXPORT {...} FROM? ...

      this.chunkLine = opts.line || 0; // The start line for the current @chunk.
      this.chunkColumn = opts.column || 0; // The start column of the current @chunk.
      code = this.clean(code); // The stripped, cleaned original source code.

      // At every position, run through this list of attempted matches,
      // short-circuiting if any of them succeed. Their order determines precedence:
      // `@literalToken` is the fallback catch-all.
      var i = 0;
      while (this.chunk = code.slice(i)) {
        var consumed = this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();

        // Update position

        var _Array$from = Array.from(this.getLineAndColumnFromChunk(consumed));

        var _Array$from2 = _slicedToArray(_Array$from, 2);

        this.chunkLine = _Array$from2[0];
        this.chunkColumn = _Array$from2[1];


        i += consumed;

        if (opts.untilBalanced && this.ends.length === 0) {
          return { tokens: this.tokens, index: i };
        }
      }

      this.closeIndentation();
      if (end = this.ends.pop()) {
        this.error('missing ' + end.tag, end.origin[2]);
      }
      if (opts.rewrite === false) {
        return this.tokens;
      }
      return new Rewriter().rewrite(this.tokens);
    }

    // Preprocess the code to remove leading and trailing whitespace, carriage
    // returns, etc. If we're lexing literate CoffeeScript, strip external Markdown
    // by removing all lines that aren't indented by at least four spaces or a tab.

  }, {
    key: 'clean',
    value: function clean(code) {
      if (code.charCodeAt(0) === BOM) {
        code = code.slice(1);
      }
      code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
      if (WHITESPACE.test(code)) {
        code = '\n' + code;
        this.chunkLine--;
      }
      if (this.literate) {
        code = invertLiterate(code);
      }
      return code;
    }

    // Tokenizers
    // ----------

    // Matches identifying literals: variables, keywords, method names, etc.
    // Check to ensure that JavaScript reserved words aren't being used as
    // identifiers. Because CoffeeScript reserves a handful of keywords that are
    // allowed in JavaScript, we're careful not to tag them as keywords when
    // referenced as property names here, so you can still do `jQuery.is()` even
    // though `is` means `===` otherwise.

  }, {
    key: 'identifierToken',
    value: function identifierToken() {
      var alias = void 0;var match = void 0;var needle2 = void 0;var needle3 = void 0;
      if (!(match = IDENTIFIER.exec(this.chunk))) {
        return 0;
      }

      var _Array$from3 = Array.from(match),
          _Array$from4 = _slicedToArray(_Array$from3, 3),
          input = _Array$from4[0],
          id = _Array$from4[1],
          colon = _Array$from4[2];

      // Preserve length of id for location data


      var idLength = id.length;
      var poppedToken = void 0;

      if (id === 'own' && this.tag() === 'FOR') {
        this.token('OWN', id);
        return id.length;
      }
      if (id === 'from' && this.tag() === 'YIELD') {
        this.token('FROM', id);
        return id.length;
      }
      if (id === 'as' && this.seenImport) {
        var needle = void 0;var needle1 = void 0;
        if (this.value() === '*') {
          this.tokens[this.tokens.length - 1][0] = 'IMPORT_ALL';
        } else if (needle = this.value(), Array.from(COFFEE_KEYWORDS).includes(needle)) {
          this.tokens[this.tokens.length - 1][0] = 'IDENTIFIER';
        }
        if (needle1 = this.tag(), ['DEFAULT', 'IMPORT_ALL', 'IDENTIFIER'].includes(needle1)) {
          this.token('AS', id);
          return id.length;
        }
      }
      if (id === 'as' && this.seenExport && (needle2 = this.tag(), ['IDENTIFIER', 'DEFAULT'].includes(needle2))) {
        this.token('AS', id);
        return id.length;
      }
      if (id === 'default' && this.seenExport && (needle3 = this.tag(), ['EXPORT', 'AS'].includes(needle3))) {
        this.token('DEFAULT', id);
        return id.length;
      }

      var prev = this.tokens[this.tokens.length - 1];

      var tag = colon || prev != null && (['.', '?.', '::', '?::'].includes(prev[0]) || !prev.spaced && prev[0] === '@') ? 'PROPERTY' : 'IDENTIFIER';

      if (tag === 'IDENTIFIER' && (Array.from(JS_KEYWORDS).includes(id) || Array.from(COFFEE_KEYWORDS).includes(id)) && !(this.exportSpecifierList && Array.from(COFFEE_KEYWORDS).includes(id))) {
        var needle4 = void 0;
        tag = id.toUpperCase();
        if (tag === 'WHEN' && (needle4 = this.tag(), Array.from(LINE_BREAK).includes(needle4))) {
          tag = 'LEADING_WHEN';
        } else if (tag === 'FOR') {
          this.seenFor = true;
        } else if (tag === 'UNLESS') {
          tag = 'IF';
        } else if (tag === 'IMPORT') {
          this.seenImport = true;
        } else if (tag === 'EXPORT') {
          this.seenExport = true;
        } else if (Array.from(UNARY).includes(tag)) {
          tag = 'UNARY';
        } else if (Array.from(RELATION).includes(tag)) {
          if (tag !== 'INSTANCEOF' && this.seenFor) {
            tag = 'FOR' + tag;
            this.seenFor = false;
          } else {
            tag = 'RELATION';
            if (this.value() === '!') {
              poppedToken = this.tokens.pop();
              id = '!' + id;
            }
          }
        }
      } else if (tag === 'IDENTIFIER' && this.seenFor && id === 'from' && isForFrom(prev)) {
        tag = 'FORFROM';
        this.seenFor = false;
      }

      if (tag === 'IDENTIFIER' && Array.from(RESERVED).includes(id)) {
        this.error('reserved word \'' + id + '\'', { length: id.length });
      }

      if (tag !== 'PROPERTY') {
        if (Array.from(COFFEE_ALIASES).includes(id)) {
          alias = id;
          id = COFFEE_ALIAS_MAP[id];
        }
        tag = function () {
          switch (id) {
            case '!':
              return 'UNARY';
            case '==':case '!=':
              return 'COMPARE';
            case 'true':case 'false':
              return 'BOOL';
            case 'break':case 'continue':
            case 'debugger':
              return 'STATEMENT';
            case '&&':case '||':
              return id;
            default:
              return tag;
          }
        }();
      }

      var tagToken = this.token(tag, id, 0, idLength);
      if (alias) {
        tagToken.origin = [tag, alias, tagToken[2]];
      }
      if (poppedToken) {
        var _Array$from5 = Array.from([poppedToken[2].first_line, poppedToken[2].first_column]);

        var _Array$from6 = _slicedToArray(_Array$from5, 2);

        tagToken[2].first_line = _Array$from6[0];
        tagToken[2].first_column = _Array$from6[1];
      }
      if (colon) {
        var colonOffset = input.lastIndexOf(':');
        this.token(':', ':', colonOffset, colon.length);
      }

      return input.length;
    }

    // Matches numbers, including decimals, hex, and exponential notation.
    // Be careful not to interfere with ranges-in-progress.

  }, {
    key: 'numberToken',
    value: function numberToken() {
      var match = void 0;var needle = void 0;
      if (!(match = NUMBER.exec(this.chunk))) {
        return 0;
      }

      var number = match[0];
      var lexedLength = number.length;

      switch (false) {
        case !/^0[BOX]/.test(number):
          this.error('radix prefix in \'' + number + '\' must be lowercase', { offset: 1 });
          break;
        case !/^(?!0x).*E/.test(number):
          this.error('exponential notation in \'' + number + '\' must be indicated with a lowercase \'e\'', { offset: number.indexOf('E') });
          break;
        case !/^0\d*[89]/.test(number):
          this.error('decimal literal \'' + number + '\' must not be prefixed with \'0\'', { length: lexedLength });
          break;
        case !/^0\d+/.test(number):
          this.error('octal literal \'' + number + '\' must be prefixed with \'0o\'', { length: lexedLength });
          break;
      }

      var base = function () {
        switch (number.charAt(1)) {
          case 'b':
            return 2;
          case 'o':
            return 8;
          case 'x':
            return 16;
          default:
            return null;
        }
      }();
      var numberValue = base != null ? parseInt(number.slice(2), base) : parseFloat(number);
      if (needle = number.charAt(1), ['b', 'o'].includes(needle)) {
        number = '0x' + numberValue.toString(16);
      }

      var tag = numberValue === Infinity ? 'INFINITY' : 'NUMBER';
      this.token(tag, number, 0, lexedLength);
      return lexedLength;
    }

    // Matches strings, including multi-line strings, as well as heredocs, with or without
    // interpolation.

  }, {
    key: 'stringToken',
    value: function stringToken() {
      var _this = this;

      var i = void 0;

      var _Array$from7 = Array.from(STRING_START.exec(this.chunk) || []),
          _Array$from8 = _slicedToArray(_Array$from7, 1),
          quote = _Array$from8[0];

      if (!quote) {
        return 0;
      }

      // If the preceding token is `from` and this is an import or export statement,
      // properly tag the `from`.
      if (this.tokens.length && this.value() === 'from' && (this.seenImport || this.seenExport)) {
        this.tokens[this.tokens.length - 1][0] = 'FROM';
      }

      var regex = function () {
        switch (quote) {
          case "'":
            return STRING_SINGLE;
          case '"':
            return STRING_DOUBLE;
          case "'''":
            return HEREDOC_SINGLE;
          case '"""':
            return HEREDOC_DOUBLE;
        }
      }();
      var heredoc = quote.length === 3;

      var _matchWithInterpolati = this.matchWithInterpolations(regex, quote),
          tokens = _matchWithInterpolati.tokens,
          end = _matchWithInterpolati.index;

      var $ = tokens.length - 1;

      var delimiter = quote.charAt(0);
      if (heredoc) {
        // Find the smallest indentation. It will be removed from all lines later.
        var match = void 0;
        var indentRegex = void 0;
        var indent = null;
        var doc = function () {
          var result = [];
          for (i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token[0] === 'NEOSTRING') {
              result.push(token[1]);
            }
          }
          return result;
        }().join('#{}');
        while (match = HEREDOC_INDENT.exec(doc)) {
          var attempt = match[1];
          if (indent === null || attempt.length > 0 && attempt.length < indent.length) {
            indent = attempt;
          }
        }
        if (indent) {
          indentRegex = new RegExp('\\n' + indent, 'g');
        }
        this.mergeInterpolationTokens(tokens, { delimiter: delimiter }, function (value, i) {
          value = _this.formatString(value, { delimiter: quote });
          if (indentRegex) {
            value = value.replace(indentRegex, '\n');
          }
          if (i === 0) {
            value = value.replace(LEADING_BLANK_LINE, '');
          }
          if (i === $) {
            value = value.replace(TRAILING_BLANK_LINE, '');
          }
          return value;
        });
      } else {
        this.mergeInterpolationTokens(tokens, { delimiter: delimiter }, function (value, i) {
          value = _this.formatString(value, { delimiter: quote });
          value = value.replace(SIMPLE_STRING_OMIT, function (match, offset) {
            if (i === 0 && offset === 0 || i === $ && offset + match.length === value.length) {
              return '';
            }
            return ' ';
          });
          return value;
        });
      }

      return end;
    }

    // Matches and consumes comments.

  }, {
    key: 'commentToken',
    value: function commentToken() {
      var match = void 0;
      if (!(match = this.chunk.match(COMMENT))) {
        return 0;
      }

      var _Array$from9 = Array.from(match),
          _Array$from10 = _slicedToArray(_Array$from9, 2),
          comment = _Array$from10[0],
          here = _Array$from10[1];

      if (here) {
        if (match = HERECOMMENT_ILLEGAL.exec(comment)) {
          this.error('block comments cannot contain ' + match[0], { offset: match.index, length: match[0].length });
        }
        if (here.indexOf('\n') >= 0) {
          here = here.replace(new RegExp('\\n' + repeat(' ', this.indent), 'g'), '\n');
        }
        this.token('HERECOMMENT', here, 0, comment.length);
      }
      return comment.length;
    }

    // Matches JavaScript interpolated directly into the source via backticks.

  }, {
    key: 'jsToken',
    value: function jsToken() {
      var match = void 0;
      if (this.chunk.charAt(0) !== '`' || !(match = HERE_JSTOKEN.exec(this.chunk) || JSTOKEN.exec(this.chunk))) {
        return 0;
      }
      // Convert escaped backticks to backticks, and escaped backslashes
      // just before escaped backticks to backslashes
      var script = match[1].replace(/\\+(`|$)/g, function (string) {
        return (// `string` is always a value like '\`', '\\\`', '\\\\\`', etc.
          // By reducing it to its latter half, we turn '\`' to '`', '\\\`' to '\`', etc.
          string.slice(-Math.ceil(string.length / 2))
        );
      });
      this.token('JS', script, 0, match[0].length);
      return match[0].length;
    }

    // Matches regular expression literals, as well as multiline extended ones.
    // Lexing regular expressions is difficult to distinguish from division, so we
    // borrow some basic heuristics from JavaScript and Ruby.

  }, {
    key: 'regexToken',
    value: function regexToken() {
      var closed = void 0;var match = void 0;
      var body = void 0;var index = void 0;var regex = void 0;var tokens = void 0;
      switch (false) {
        case !(match = REGEX_ILLEGAL.exec(this.chunk)):
          this.error('regular expressions cannot begin with ' + match[2], { offset: match.index + match[1].length });
          break;
        case !(match = this.matchWithInterpolations(HEREGEX, '///')):
          var _match = match;
          tokens = _match.tokens;
          index = _match.index;

          break;
        case !(match = REGEX.exec(this.chunk)):
          var _Array$from11 = Array.from(match);

          var _Array$from12 = _slicedToArray(_Array$from11, 3);

          regex = _Array$from12[0];
          body = _Array$from12[1];
          closed = _Array$from12[2];

          this.validateEscapes(body, { isRegex: true, offsetInChunk: 1 });
          body = this.formatRegex(body, { delimiter: '/' });
          index = regex.length;
          var prev = this.tokens[this.tokens.length - 1];
          if (prev) {
            if (prev.spaced && Array.from(CALLABLE).includes(prev[0])) {
              if (!closed || POSSIBLY_DIVISION.test(regex)) {
                return 0;
              }
            } else if (Array.from(NOT_REGEX).includes(prev[0])) {
              return 0;
            }
          }
          if (!closed) {
            this.error('missing / (unclosed regex)');
          }
          break;
        default:
          return 0;
      }

      var _Array$from13 = Array.from(REGEX_FLAGS.exec(this.chunk.slice(index))),
          _Array$from14 = _slicedToArray(_Array$from13, 1),
          flags = _Array$from14[0];

      var end = index + flags.length;
      var origin = this.makeToken('REGEX', null, 0, end);
      switch (false) {
        case !!VALID_FLAGS.test(flags):
          this.error('invalid regular expression flags ' + flags, { offset: index, length: flags.length });
          break;
        case !regex && tokens.length !== 1:
          if (body == null) {
            body = this.formatHeregex(tokens[0][1]);
          }
          this.token('REGEX', '' + this.makeDelimitedLiteral(body, { delimiter: '/' }) + flags, 0, end, origin);
          break;
        default:
          this.token('REGEX_START', '(', 0, 0, origin);
          this.token('IDENTIFIER', 'RegExp', 0, 0);
          this.token('CALL_START', '(', 0, 0);
          this.mergeInterpolationTokens(tokens, { delimiter: '"', double: true }, this.formatHeregex);
          if (flags) {
            this.token(',', ',', index - 1, 0);
            this.token('STRING', '"' + flags + '"', index - 1, flags.length);
          }
          this.token(')', ')', end - 1, 0);
          this.token('REGEX_END', ')', end - 1, 0);
      }

      return end;
    }

    // Matches newlines, indents, and outdents, and determines which is which.
    // If we can detect that the current line is continued onto the next line,
    // then the newline is suppressed:
    //
    //     elements
    //       .each( ... )
    //       .map( ... )
    //
    // Keeps track of the level of indentation, because a single outdent token
    // can close multiple indents, so we need to know how far in we happen to be.

  }, {
    key: 'lineToken',
    value: function lineToken() {
      var match = void 0;
      if (!(match = MULTI_DENT.exec(this.chunk))) {
        return 0;
      }
      var indent = match[0];

      this.seenFor = false;
      if (!this.importSpecifierList) {
        this.seenImport = false;
      }
      if (!this.exportSpecifierList) {
        this.seenExport = false;
      }

      var size = indent.length - 1 - indent.lastIndexOf('\n');
      var noNewlines = this.unfinished();

      if (size - this.indebt === this.indent) {
        if (noNewlines) {
          this.suppressNewlines();
        } else {
          this.newlineToken(0);
        }
        return indent.length;
      }

      if (size > this.indent) {
        if (noNewlines) {
          this.indebt = size - this.indent;
          this.suppressNewlines();
          return indent.length;
        }
        if (!this.tokens.length) {
          this.baseIndent = this.indent = size;
          return indent.length;
        }
        var diff = size - this.indent + this.outdebt;
        this.token('INDENT', diff, indent.length - size, size);
        this.indents.push(diff);
        this.ends.push({ tag: 'OUTDENT' });
        this.outdebt = this.indebt = 0;
        this.indent = size;
      } else if (size < this.baseIndent) {
        this.error('missing indentation', { offset: indent.length });
      } else {
        this.indebt = 0;
        this.outdentToken(this.indent - size, noNewlines, indent.length);
      }
      return indent.length;
    }

    // Record an outdent token or multiple tokens, if we happen to be moving back
    // inwards past several recorded indents. Sets new @indent value.

  }, {
    key: 'outdentToken',
    value: function outdentToken(moveOut, noNewlines, outdentLength) {
      var dent = void 0;
      var decreasedIndent = this.indent - moveOut;
      while (moveOut > 0) {
        var lastIndent = this.indents[this.indents.length - 1];
        if (!lastIndent) {
          moveOut = 0;
        } else if (lastIndent === this.outdebt) {
          moveOut -= this.outdebt;
          this.outdebt = 0;
        } else if (lastIndent < this.outdebt) {
          this.outdebt -= lastIndent;
          moveOut -= lastIndent;
        } else {
          dent = this.indents.pop() + this.outdebt;
          if (outdentLength && Array.from(INDENTABLE_CLOSERS).includes(this.chunk[outdentLength])) {
            decreasedIndent -= dent - moveOut;
            moveOut = dent;
          }
          this.outdebt = 0;
          // pair might call outdentToken, so preserve decreasedIndent
          this.pair('OUTDENT');
          this.token('OUTDENT', moveOut, 0, outdentLength);
          moveOut -= dent;
        }
      }
      if (dent) {
        this.outdebt -= moveOut;
      }
      while (this.value() === ';') {
        this.tokens.pop();
      }

      if (this.tag() !== 'TERMINATOR' && !noNewlines) {
        this.token('TERMINATOR', '\n', outdentLength, 0);
      }
      this.indent = decreasedIndent;
      return this;
    }

    // Matches and consumes non-meaningful whitespace. Tag the previous token
    // as being “spaced”, because there are some cases where it makes a difference.

  }, {
    key: 'whitespaceToken',
    value: function whitespaceToken() {
      var match = void 0;var nline = void 0;
      if (!(match = WHITESPACE.exec(this.chunk)) && !(nline = this.chunk.charAt(0) === '\n')) {
        return 0;
      }
      var prev = this.tokens[this.tokens.length - 1];
      if (prev) {
        prev[match ? 'spaced' : 'newLine'] = true;
      }
      if (match) {
        return match[0].length;
      }return 0;
    }

    // Generate a newline token. Consecutive newlines get merged together.

  }, {
    key: 'newlineToken',
    value: function newlineToken(offset) {
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (this.tag() !== 'TERMINATOR') {
        this.token('TERMINATOR', '\n', offset, 0);
      }
      return this;
    }

    // Use a `\` at a line-ending to suppress the newline.
    // The slash is removed here once its job is done.

  }, {
    key: 'suppressNewlines',
    value: function suppressNewlines() {
      if (this.value() === '\\') {
        this.tokens.pop();
      }
      return this;
    }

    // We treat all other single characters as a token. E.g.: `( ) , . !`
    // Multi-character operators are also literal tokens, so that Jison can assign
    // the proper order of operations. There are some symbols that we tag specially
    // here. `;` and newlines are both treated as a `TERMINATOR`, we distinguish
    // parentheses that indicate a method call from regular parentheses, and so on.

  }, {
    key: 'literalToken',
    value: function literalToken() {
      var match = void 0;var needle = void 0;var origin = void 0;var value = void 0;
      if (match = OPERATOR.exec(this.chunk)) {
        var _Array$from15 = Array.from(match);

        var _Array$from16 = _slicedToArray(_Array$from15, 1);

        value = _Array$from16[0];

        if (CODE.test(value)) {
          this.tagParameters();
        }
      } else {
        value = this.chunk.charAt(0);
      }
      var tag = value;
      var prev = this.tokens[this.tokens.length - 1];

      if (prev && (needle = value, ['='].concat(_toConsumableArray(Array.from(COMPOUND_ASSIGN))).includes(needle))) {
        var skipToken = false;
        if (value === '=' && ['||', '&&'].includes(prev[1]) && !prev.spaced) {
          prev[0] = 'COMPOUND_ASSIGN';
          prev[1] += '=';
          prev = this.tokens[this.tokens.length - 2];
          skipToken = true;
        }
        if (prev && prev[0] !== 'PROPERTY') {
          origin = prev.origin != null ? prev.origin : prev;
          var message = isUnassignable(prev[1], origin[1]);
          if (message) {
            this.error(message, origin[2]);
          }
        }
        if (skipToken) {
          return value.length;
        }
      }

      if (value === '{' && this.seenImport) {
        this.importSpecifierList = true;
      } else if (this.importSpecifierList && value === '}') {
        this.importSpecifierList = false;
      } else if (value === '{' && (prev != null ? prev[0] : undefined) === 'EXPORT') {
        this.exportSpecifierList = true;
      } else if (this.exportSpecifierList && value === '}') {
        this.exportSpecifierList = false;
      }

      if (value === ';') {
        this.seenFor = this.seenImport = this.seenExport = false;
        tag = 'TERMINATOR';
      } else if (value === '*' && prev[0] === 'EXPORT') {
        tag = 'EXPORT_ALL';
      } else if (Array.from(MATH).includes(value)) {
        tag = 'MATH';
      } else if (Array.from(COMPARE).includes(value)) {
        tag = 'COMPARE';
      } else if (Array.from(COMPOUND_ASSIGN).includes(value)) {
        tag = 'COMPOUND_ASSIGN';
      } else if (Array.from(UNARY).includes(value)) {
        tag = 'UNARY';
      } else if (Array.from(UNARY_MATH).includes(value)) {
        tag = 'UNARY_MATH';
      } else if (Array.from(SHIFT).includes(value)) {
        tag = 'SHIFT';
      } else if (value === '?' && (prev != null ? prev.spaced : undefined)) {
        tag = 'BIN?';
      } else if (prev && !prev.spaced) {
        if (value === '(' && Array.from(CALLABLE).includes(prev[0])) {
          if (prev[0] === '?') {
            prev[0] = 'FUNC_EXIST';
          }
          tag = 'CALL_START';
        } else if (value === '[' && Array.from(INDEXABLE).includes(prev[0])) {
          tag = 'INDEX_START';
          switch (prev[0]) {
            case '?':
              prev[0] = 'INDEX_SOAK';break;
          }
        }
      }
      var token = this.makeToken(tag, value);
      switch (value) {
        case '(':case '{':case '[':
          this.ends.push({ tag: INVERSES[value], origin: token });break;
        case ')':case '}':case ']':
          this.pair(value);break;
      }
      this.tokens.push(token);
      return value.length;
    }

    // Token Manipulators
    // ------------------

    // A source of ambiguity in our grammar used to be parameter lists in function
    // definitions versus argument lists in function calls. Walk backwards, tagging
    // parameters specially in order to make things easier for the parser.

  }, {
    key: 'tagParameters',
    value: function tagParameters() {
      var tok = void 0;
      if (this.tag() !== ')') {
        return this;
      }
      var stack = [];
      var tokens = this.tokens;

      var i = tokens.length;
      tokens[--i][0] = 'PARAM_END';
      while (tok = tokens[--i]) {
        switch (tok[0]) {
          case ')':
            stack.push(tok);
            break;
          case '(':case 'CALL_START':
            if (stack.length) {
              stack.pop();
            } else if (tok[0] === '(') {
              tok[0] = 'PARAM_START';
              return this;
            } else {
              return this;
            }
            break;
        }
      }
      return this;
    }

    // Close up all remaining open blocks at the end of the file.

  }, {
    key: 'closeIndentation',
    value: function closeIndentation() {
      return this.outdentToken(this.indent);
    }

    // Match the contents of a delimited token and expand variables and expressions
    // inside it using Ruby-like notation for substitution of arbitrary
    // expressions.
    //
    //     "Hello #{name.capitalize()}."
    //
    // If it encounters an interpolation, this method will recursively create a new
    // Lexer and tokenize until the `{` of `#{` is balanced with a `}`.
    //
    //  - `regex` matches the contents of a token (but not `delimiter`, and not
    //    `#{` if interpolations are desired).
    //  - `delimiter` is the delimiter of the token. Examples are `'`, `"`, `'''`,
    //    `"""` and `///`.
    //
    // This method allows us to have strings within interpolations within strings,
    // ad infinitum.

  }, {
    key: 'matchWithInterpolations',
    value: function matchWithInterpolations(regex, delimiter) {
      var index = void 0;
      var tokens = [];
      var offsetInChunk = delimiter.length;
      if (this.chunk.slice(0, offsetInChunk) !== delimiter) {
        return null;
      }
      var str = this.chunk.slice(offsetInChunk);
      while (true) {
        var nested = void 0;

        var _Array$from17 = Array.from(regex.exec(str)),
            _Array$from18 = _slicedToArray(_Array$from17, 1),
            strPart = _Array$from18[0];

        this.validateEscapes(strPart, { isRegex: delimiter.charAt(0) === '/', offsetInChunk: offsetInChunk });

        // Push a fake 'NEOSTRING' token, which will get turned into a real string later.
        tokens.push(this.makeToken('NEOSTRING', strPart, offsetInChunk));

        str = str.slice(strPart.length);
        offsetInChunk += strPart.length;

        if (str.slice(0, 2) !== '#{') {
          break;
        }

        // The `1`s are to remove the `#` in `#{`.

        var _Array$from19 = Array.from(this.getLineAndColumnFromChunk(offsetInChunk + 1)),
            _Array$from20 = _slicedToArray(_Array$from19, 2),
            line = _Array$from20[0],
            column = _Array$from20[1];

        // Skip the trailing `}`.
        var _tokenize = new Lexer().tokenize(str.slice(1), { line: line, column: column, untilBalanced: true });

        nested = _tokenize.tokens;
        index = _tokenize.index;
        index += 1;

        // Turn the leading and trailing `{` and `}` into parentheses. Unnecessary
        // parentheses will be removed later.
        var open = nested[0];var close = nested[nested.length - 1];
        open[0] = open[1] = '(';
        close[0] = close[1] = ')';
        close.origin = ['', 'end of interpolation', close[2]];

        // Remove leading 'TERMINATOR' (if any).
        if ((nested[1] != null ? nested[1][0] : undefined) === 'TERMINATOR') {
          nested.splice(1, 1);
        }

        // Push a fake 'TOKENS' token, which will get turned into real tokens later.
        tokens.push(['TOKENS', nested]);

        str = str.slice(index);
        offsetInChunk += index;
      }

      if (str.slice(0, delimiter.length) !== delimiter) {
        this.error('missing ' + delimiter, { length: delimiter.length });
      }

      var firstToken = tokens[0];var lastToken = tokens[tokens.length - 1];
      firstToken[2].first_column -= delimiter.length;
      if (lastToken[1].substr(-1) === '\n') {
        lastToken[2].last_line += 1;
        lastToken[2].last_column = delimiter.length - 1;
      } else {
        lastToken[2].last_column += delimiter.length;
      }
      if (lastToken[1].length === 0) {
        lastToken[2].last_column -= 1;
      }

      return { tokens: tokens, index: offsetInChunk + delimiter.length };
    }

    // Merge the array `tokens` of the fake token types 'TOKENS' and 'NEOSTRING'
    // (as returned by `matchWithInterpolations`) into the token stream. The value
    // of 'NEOSTRING's are converted using `fn` and turned into strings using
    // `options` first.

  }, {
    key: 'mergeInterpolationTokens',
    value: function mergeInterpolationTokens(tokens, options, fn) {
      var lparen = void 0;var token = void 0;
      if (tokens.length > 1) {
        lparen = this.token('STRING_START', '(', 0, 0);
      }

      var firstIndex = this.tokens.length;
      for (var i = 0; i < tokens.length; i++) {
        var _tokens;

        var locationToken;var tokensToPush;
        var firstEmptyStringIndex;
        token = tokens[i];

        var _Array$from21 = Array.from(token),
            _Array$from22 = _slicedToArray(_Array$from21, 2),
            tag = _Array$from22[0],
            value = _Array$from22[1];

        switch (tag) {
          case 'TOKENS':
            // Optimize out empty interpolations (an empty pair of parentheses).
            if (value.length === 2) {
              continue;
            }
            // Push all the tokens in the fake 'TOKENS' token. These already have
            // sane location data.
            locationToken = value[0];
            tokensToPush = value;
            break;
          case 'NEOSTRING':
            // Convert 'NEOSTRING' into 'STRING'.
            var converted = fn.call(this, token[1], i);
            // Optimize out empty strings. We ensure that the tokens stream always
            // starts with a string token, though, to make sure that the result
            // really is a string.
            if (converted.length === 0) {
              if (i === 0) {
                firstEmptyStringIndex = this.tokens.length;
              } else {
                continue;
              }
            }
            // However, there is one case where we can optimize away a starting
            // empty string.
            if (i === 2 && firstEmptyStringIndex != null) {
              this.tokens.splice(firstEmptyStringIndex, 2); // Remove empty string and the plus.
            }
            token[0] = 'STRING';
            token[1] = this.makeDelimitedLiteral(converted, options);
            locationToken = token;
            tokensToPush = [token];
            break;
        }
        if (this.tokens.length > firstIndex) {
          // Create a 0-length "+" token.
          var plusToken = this.token('+', '+');
          plusToken[2] = {
            first_line: locationToken[2].first_line,
            first_column: locationToken[2].first_column,
            last_line: locationToken[2].first_line,
            last_column: locationToken[2].first_column
          };
        }
        (_tokens = this.tokens).push.apply(_tokens, _toConsumableArray(Array.from(tokensToPush || [])));
      }

      if (lparen) {
        var lastToken = tokens[tokens.length - 1];
        lparen.origin = ['STRING', null, {
          first_line: lparen[2].first_line,
          first_column: lparen[2].first_column,
          last_line: lastToken[2].last_line,
          last_column: lastToken[2].last_column
        }];
        var rparen = this.token('STRING_END', ')');
        return rparen[2] = {
          first_line: lastToken[2].last_line,
          first_column: lastToken[2].last_column,
          last_line: lastToken[2].last_line,
          last_column: lastToken[2].last_column
        };
      }
    }

    // Pairs up a closing token, ensuring that all listed pairs of tokens are
    // correctly balanced throughout the course of the token stream.

  }, {
    key: 'pair',
    value: function pair(tag) {
      var wanted = void 0;
      var prev = this.ends[this.ends.length - 1];
      if (tag !== (wanted = prev != null ? prev.tag : undefined)) {
        if (wanted !== 'OUTDENT') {
          this.error('unmatched ' + tag);
        }
        // Auto-close INDENT to support syntax like this:
        //
        //     el.click((event) ->
        //       el.hide())
        //
        var lastIndent = this.indents[this.indents.length - 1];
        this.outdentToken(lastIndent, true);
        return this.pair(tag);
      }
      return this.ends.pop();
    }

    // Helpers
    // -------

    // Returns the line and column number from an offset into the current chunk.
    //
    // `offset` is a number of characters into @chunk.

  }, {
    key: 'getLineAndColumnFromChunk',
    value: function getLineAndColumnFromChunk(offset) {
      var string = void 0;
      if (offset === 0) {
        return [this.chunkLine, this.chunkColumn];
      }

      if (offset >= this.chunk.length) {
        string = this.chunk;
      } else {
        string = this.chunk.slice(0, +(offset - 1) + 1 || undefined);
      }

      var lineCount = count(string, '\n');

      var column = this.chunkColumn;
      if (lineCount > 0) {
        var array = string.split('\n');var lastLine = array[array.length - 1];
        column = lastLine.length;
      } else {
        column += string.length;
      }

      return [this.chunkLine + lineCount, column];
    }

    // Same as "token", exception this just returns the token without adding it
    // to the results.

  }, {
    key: 'makeToken',
    value: function makeToken(tag, value, offsetInChunk, length) {
      if (offsetInChunk == null) {
        offsetInChunk = 0;
      }
      if (length == null) {
        length = value.length;
      }
      var locationData = {};

      // Use length - 1 for the final offset - we're supplying the last_line and the last_column,
      // so if last_column == first_column, then we're looking at a character of length 1.
      var _Array$from23 = Array.from(this.getLineAndColumnFromChunk(offsetInChunk));

      var _Array$from24 = _slicedToArray(_Array$from23, 2);

      locationData.first_line = _Array$from24[0];
      locationData.first_column = _Array$from24[1];
      var lastCharacter = length > 0 ? length - 1 : 0;

      var _Array$from25 = Array.from(this.getLineAndColumnFromChunk(offsetInChunk + lastCharacter));

      var _Array$from26 = _slicedToArray(_Array$from25, 2);

      locationData.last_line = _Array$from26[0];
      locationData.last_column = _Array$from26[1];


      var token = [tag, value, locationData];

      return token;
    }

    // Add a token to the results.
    // `offset` is the offset into the current @chunk where the token starts.
    // `length` is the length of the token in the @chunk, after the offset.  If
    // not specified, the length of `value` will be used.
    //
    // Returns the new token.

  }, {
    key: 'token',
    value: function token(tag, value, offsetInChunk, length, origin) {
      var token = this.makeToken(tag, value, offsetInChunk, length);
      if (origin) {
        token.origin = origin;
      }
      this.tokens.push(token);
      return token;
    }

    // Peek at the last tag in the token stream.

  }, {
    key: 'tag',
    value: function tag() {
      var token = this.tokens[this.tokens.length - 1];
      return token != null ? token[0] : undefined;
    }

    // Peek at the last value in the token stream.

  }, {
    key: 'value',
    value: function value() {
      var token = this.tokens[this.tokens.length - 1];
      return token != null ? token[1] : undefined;
    }

    // Are we in the midst of an unfinished expression?

  }, {
    key: 'unfinished',
    value: function unfinished() {
      var needle = void 0;
      return LINE_CONTINUER.test(this.chunk) || (needle = this.tag(), Array.from(UNFINISHED).includes(needle));
    }
  }, {
    key: 'formatString',
    value: function formatString(str, options) {
      return this.replaceUnicodeCodePointEscapes(str.replace(STRING_OMIT, '$1'), options);
    }
  }, {
    key: 'formatHeregex',
    value: function formatHeregex(str) {
      return this.formatRegex(str.replace(HEREGEX_OMIT, '$1$2'), { delimiter: '///' });
    }
  }, {
    key: 'formatRegex',
    value: function formatRegex(str, options) {
      return this.replaceUnicodeCodePointEscapes(str, options);
    }
  }, {
    key: 'unicodeCodePointToUnicodeEscapes',
    value: function unicodeCodePointToUnicodeEscapes(codePoint) {
      var toUnicodeEscape = function toUnicodeEscape(val) {
        var str = val.toString(16);
        return '\\u' + repeat('0', 4 - str.length) + str;
      };
      if (codePoint < 0x10000) {
        return toUnicodeEscape(codePoint);
      }
      // surrogate pair
      var high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
      var low = (codePoint - 0x10000) % 0x400 + 0xDC00;
      return '' + toUnicodeEscape(high) + toUnicodeEscape(low);
    }

    // Replace \u{...} with \uxxxx[\uxxxx] in strings and regexes

  }, {
    key: 'replaceUnicodeCodePointEscapes',
    value: function replaceUnicodeCodePointEscapes(str, options) {
      var _this2 = this;

      return str.replace(UNICODE_CODE_POINT_ESCAPE, function (match, escapedBackslash, codePointHex, offset) {
        if (escapedBackslash) {
          return escapedBackslash;
        }

        var codePointDecimal = parseInt(codePointHex, 16);
        if (codePointDecimal > 0x10ffff) {
          _this2.error('unicode code point escapes greater than \\u{10ffff} are not allowed', {
            offset: offset + options.delimiter.length,
            length: codePointHex.length + 4
          });
        }

        return _this2.unicodeCodePointToUnicodeEscapes(codePointDecimal);
      });
    }

    // Validates escapes in strings and regexes.

  }, {
    key: 'validateEscapes',
    value: function validateEscapes(str, options) {
      if (options == null) {
        options = {};
      }
      var invalidEscapeRegex = options.isRegex ? REGEX_INVALID_ESCAPE : STRING_INVALID_ESCAPE;
      var match = invalidEscapeRegex.exec(str);
      if (!match) {
        return;
      }
      var array = match[0];var before = match[1];var octal = match[2];var hex = match[3];var unicodeCodePoint = match[4];var unicode = match[5];
      var message = octal ? 'octal escape sequences are not allowed' : 'invalid escape sequence';
      var invalidEscape = '\\' + (octal || hex || unicodeCodePoint || unicode);
      return this.error(message + ' ' + invalidEscape, {
        offset: (options.offsetInChunk != null ? options.offsetInChunk : 0) + match.index + before.length,
        length: invalidEscape.length
      });
    }

    // Constructs a string or regex by escaping certain characters.

  }, {
    key: 'makeDelimitedLiteral',
    value: function makeDelimitedLiteral(body, options) {
      if (options == null) {
        options = {};
      }
      if (body === '' && options.delimiter === '/') {
        body = '(?:)';
      }
      var regex = new RegExp('(\\\\\\\\)|(\\\\0(?=[1-7]))|\\\\?(' + options.delimiter + ')|\\\\?(?:(\\n)|(\\r)|(\\u2028)|(\\u2029))|(\\\\.)', 'g');
      body = body.replace(regex, function (match, backslash, nul, delimiter, lf, cr, ls, ps, other) {
        switch (false) {
          // Ignore escaped backslashes.
          case !backslash:
            if (options.double) {
              return backslash + backslash;
            }return backslash;
          case !nul:
            return '\\x00';
          case !delimiter:
            return '\\' + delimiter;
          case !lf:
            return '\\n';
          case !cr:
            return '\\r';
          case !ls:
            return '\\u2028';
          case !ps:
            return '\\u2029';
          case !other:
            if (options.double) {
              return '\\' + other;
            }return other;
        }
      });
      return '' + options.delimiter + body + options.delimiter;
    }

    // Throws an error at either a given offset from the current chunk or at the
    // location of a token (`token[2]`).

  }, {
    key: 'error',
    value: function error(message, options) {
      var _this3 = this;

      if (options == null) {
        options = {};
      }
      var location = function () {
        if ('first_line' in options) {
          return options;
        }

        var _Array$from27 = Array.from(_this3.getLineAndColumnFromChunk(options.offset != null ? options.offset : 0)),
            _Array$from28 = _slicedToArray(_Array$from27, 2),
            first_line = _Array$from28[0],
            first_column = _Array$from28[1];

        return { first_line: first_line, first_column: first_column, last_column: first_column + (options.length != null ? options.length : 1) - 1 };
      }();
      return throwSyntaxError(message, location);
    }
  }]);

  return Lexer;
}();

// Helper functions
// ----------------

var isUnassignable = function isUnassignable(name, displayName) {
  var needle = void 0;
  if (displayName == null) {
    displayName = name;
  }switch (false) {
    case (needle = name, ![].concat(_toConsumableArray(Array.from(JS_KEYWORDS)), _toConsumableArray(Array.from(COFFEE_KEYWORDS))).includes(needle)):
      return 'keyword \'' + displayName + '\' can\'t be assigned';
    case !Array.from(STRICT_PROSCRIBED).includes(name):
      return '\'' + displayName + '\' can\'t be assigned';
    case !Array.from(RESERVED).includes(name):
      return 'reserved word \'' + displayName + '\' can\'t be assigned';
    default:
      return false;
  }
};

exports.isUnassignable = isUnassignable;

// `from` isn’t a CoffeeScript keyword, but it behaves like one in `import` and
// `export` statements (handled above) and in the declaration line of a `for`
// loop. Try to detect when `from` is a variable identifier and when it is this
// “sometimes” keyword.
var isForFrom = function isForFrom(prev) {
  if (prev[0] === 'IDENTIFIER') {
    // `for i from from`, `for from from iterable`
    if (prev[1] === 'from') {
      prev[1][0] = 'IDENTIFIER';
      true;
    }
    // `for i from iterable`
    return true;
    // `for from…`
  }if (prev[0] === 'FOR') {
    return false;
    // `for {from}…`, `for [from]…`, `for {a, from}…`, `for {a: from}…`
  }if (['{', '[', ',', ':'].includes(prev[1])) {
    return false;
  }
  return true;
};

// Constants
// ---------

// Keywords that CoffeeScript shares in common with JavaScript.
var JS_KEYWORDS = ['true', 'false', 'null', 'this', 'new', 'delete', 'typeof', 'in', 'instanceof', 'return', 'throw', 'break', 'continue', 'debugger', 'yield', 'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally', 'class', 'extends', 'super', 'import', 'export', 'default'];

// CoffeeScript-only keywords.
var COFFEE_KEYWORDS = ['undefined', 'Infinity', 'NaN', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when'];

var COFFEE_ALIAS_MAP = {
  and: '&&',
  or: '||',
  is: '==',
  isnt: '!=',
  not: '!',
  yes: 'true',
  no: 'false',
  on: 'true',
  off: 'false'
};

var COFFEE_ALIASES = function () {
  var result = [];
  for (var key in COFFEE_ALIAS_MAP) {
    result.push(key);
  }
  return result;
}();
COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);

// The list of keywords that are reserved by JavaScript, but not used, or are
// used by CoffeeScript internally. We throw an error when these are encountered,
// to avoid having a JavaScript error at runtime.
var RESERVED = ['case', 'function', 'var', 'void', 'with', 'const', 'let', 'enum', 'native', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'static'];

var STRICT_PROSCRIBED = ['arguments', 'eval'];

// The superset of both JavaScript keywords and reserved words, none of which may
// be used as identifiers or properties.
exports.JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED).concat(STRICT_PROSCRIBED);

// The character code of the nasty Microsoft madness otherwise known as the BOM.
var BOM = 65279;

// Token matching regexes.
var IDENTIFIER = new RegExp('^(?!\\d)((?:(?!\\s)[$\\w\\x7f-\\uffff])+)([^\\n\\S]*:(?!:))?');

var NUMBER = new RegExp('\
^0b[01]+|\
^0o[0-7]+|\
^0x[\\da-f]+|\
^\\d*\\.?\\d+(?:e[+-]?\\d+)?\
', 'i');

var OPERATOR = new RegExp('^(\
?:[-=]>\
|[-+*/%<>&|^!?=]=\
|>>>=?\
|([-+:])\\1\
|([&|<>*/%])\\2=?\
|\\?(\\.|::)\
|\\.{2,3}\
)');

var WHITESPACE = /^[^\n\S]+/;

var COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|###$)|^(?:\s*#(?!##[^#]).*)+/;

var CODE = /^[-=]>/;

var MULTI_DENT = /^(?:\n[^\n\S]*)+/;

var JSTOKEN = new RegExp('^`(?!``)((?:[^`\\\\]|\\\\[\\s\\S])*)`');
var HERE_JSTOKEN = new RegExp('^```((?:[^`\\\\]|\\\\[\\s\\S]|`(?!``))*)```');

// String-matching-regexes.
var STRING_START = /^(?:'''|"""|'|")/;

var STRING_SINGLE = new RegExp('^(?:[^\\\\\']|\\\\[\\s\\S])*');
var STRING_DOUBLE = new RegExp('^(?:[^\\\\"#]|\\\\[\\s\\S]|\\#(?!\\{))*');
var HEREDOC_SINGLE = new RegExp('^(?:[^\\\\\']|\\\\[\\s\\S]|\'(?!\'\'))*');
var HEREDOC_DOUBLE = new RegExp('^(?:[^\\\\"#]|\\\\[\\s\\S]|"(?!"")|\\#(?!\\{))*');

var STRING_OMIT = new RegExp('\
((?:\\\\\\\\)+)\
|\\\\[^\\S\\n]*\\n\\s*\
', 'g');
var SIMPLE_STRING_OMIT = /\s*\n\s*/g;
var HEREDOC_INDENT = /\n+([^\n\S]*)(?=\S)/g;

// Regex-matching-regexes.
var REGEX = new RegExp('^\
/(?!/)((\
?:[^[/\\n\\\\]\
|\\\\[^\\n]\
|\\[\
(?:\\\\[^\\n]|[^\\]\\n\\\\])*\
\\]\
)*)(/)?\
');

var REGEX_FLAGS = /^\w*/;
var VALID_FLAGS = /^(?!.*(.).*\1)[imguy]*$/;

var HEREGEX = new RegExp('^(?:[^\\\\/#]|\\\\[\\s\\S]|/(?!//)|\\#(?!\\{))*');

var HEREGEX_OMIT = new RegExp('\
((?:\\\\\\\\)+)\
|\\\\(\\s)\
|\\s+(?:#.*)?\
', 'g');

var REGEX_ILLEGAL = new RegExp('^(/|/{3}\\s*)(\\*)');

var POSSIBLY_DIVISION = new RegExp('^/=?\\s');

// Other regexes.
var HERECOMMENT_ILLEGAL = /\*\//;

var LINE_CONTINUER = new RegExp('^\\s*(?:,|\\??\\.(?![.\\d])|::)');

var STRING_INVALID_ESCAPE = new RegExp('\
((?:^|[^\\\\])(?:\\\\\\\\)*)\
\\\\(\
?:(0[0-7]|[1-7])\
|(x(?![\\da-fA-F]{2}).{0,2})\
|(u\\{(?![\\da-fA-F]{1,}\\})[^}]*\\}?)\
|(u(?!\\{|[\\da-fA-F]{4}).{0,4})\
)\
');
var REGEX_INVALID_ESCAPE = new RegExp('\
((?:^|[^\\\\])(?:\\\\\\\\)*)\
\\\\(\
?:(0[0-7])\
|(x(?![\\da-fA-F]{2}).{0,2})\
|(u\\{(?![\\da-fA-F]{1,}\\})[^}]*\\}?)\
|(u(?!\\{|[\\da-fA-F]{4}).{0,4})\
)\
');

var UNICODE_CODE_POINT_ESCAPE = new RegExp('(\\\\\\\\)|\\\\u\\{([\\da-fA-F]+)\\}', 'g');

var LEADING_BLANK_LINE = /^[^\n\S]*\n/;
var TRAILING_BLANK_LINE = /\n[^\n\S]*$/;

var TRAILING_SPACES = /\s+$/;

// Compound assignment tokens.
var COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|=', '**=', '//=', '%%='];

// Unary tokens.
var UNARY = ['NEW', 'TYPEOF', 'DELETE', 'DO'];

var UNARY_MATH = ['!', '~'];

// Bit-shifting tokens.
var SHIFT = ['<<', '>>', '>>>'];

// Comparison tokens.
var COMPARE = ['==', '!=', '<', '>', '<=', '>='];

// Mathematical tokens.
var MATH = ['*', '/', '%', '//', '%%'];

// Relational tokens that are negatable with `not` prefix.
var RELATION = ['IN', 'OF', 'INSTANCEOF'];

// Boolean tokens.
var BOOL = ['TRUE', 'FALSE'];

// Tokens which could legitimately be invoked or indexed. An opening
// parentheses or bracket following these tokens will be recorded as the start
// of a function invocation or indexing operation.
var CALLABLE = ['IDENTIFIER', 'PROPERTY', ')', ']', '?', '@', 'THIS', 'SUPER'];
var INDEXABLE = CALLABLE.concat(['NUMBER', 'INFINITY', 'NAN', 'STRING', 'STRING_END', 'REGEX', 'REGEX_END', 'BOOL', 'NULL', 'UNDEFINED', '}', '::']);

// Tokens which a regular expression will never immediately follow (except spaced
// CALLABLEs in some cases), but which a division operator can.
//
// See: http://www-archive.mozilla.org/js/language/js20-2002-04/rationale/syntax.html#regular-expressions
var NOT_REGEX = INDEXABLE.concat(['++', '--']);

// Tokens that, when immediately preceding a `WHEN`, indicate that the `WHEN`
// occurs at the start of a line. We disambiguate these from trailing whens to
// avoid an ambiguity in the grammar.
var LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];

// Additional indent in front of these is ignored.
var INDENTABLE_CLOSERS = [')', '}', ']'];

// Tokens that, when appearing at the end of a line, suppress a following TERMINATOR/INDENT token
var UNFINISHED = ['\\', '.', '?.', '?::', 'UNARY', 'MATH', 'UNARY_MATH', '+', '-', '**', 'SHIFT', 'RELATION', 'COMPARE', '&', '^', '|', '&&', '||', 'BIN?', 'THROW', 'EXTENDS', 'DEFAULT'];