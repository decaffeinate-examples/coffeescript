var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/* eslint-disable
    consistent-return,
    func-names,
    global-require,
    import/no-unresolved,
    max-len,
    no-buffer-constructor,
    no-cond-assign,
    no-multi-assign,
    no-param-reassign,
    no-plusplus,
    no-restricted-syntax,
    no-return-assign,
    no-shadow,
    no-undef,
    no-underscore-dangle,
    no-unused-vars,
    no-use-before-define,
    no-var,
    prefer-const,
    vars-on-top,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS203: Remove `|| {}` from converted for-own loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// CoffeeScript can be used both on the server, as a command-line compiler based
// on Node.js/V8, or to run CoffeeScript directly in the browser. This module
// contains the main entry functions for tokenizing, parsing, and compiling
// source CoffeeScript into JavaScript.

var compile = void 0;
var fs = require('fs');
var vm = require('vm');
var path = require('path');

var _require2 = require('./lexer'),
    Lexer = _require2.Lexer;

var _require3 = require('./parser'),
    parser = _require3.parser;

var helpers = require('./helpers');
var SourceMap = require('./sourcemap');
// Require `package.json`, which is two levels above this file, as this file is
// evaluated from `lib/coffee-script`.
var packageJson = require('../../package.json');

// The current CoffeeScript version number.
exports.VERSION = packageJson.version;

exports.FILE_EXTENSIONS = ['.coffee', '.litcoffee', '.coffee.md'];

// Expose helpers for testing.
exports.helpers = helpers;

// Function that allows for btoa in both nodejs and the browser.
var base64encode = function base64encode(src) {
  switch (false) {
    case typeof Buffer !== 'function':
      return new Buffer(src).toString('base64');
    case typeof btoa !== 'function':
      // The contents of a `<script>` block are encoded via UTF-16, so if any extended
      // characters are used in the block, btoa will fail as it maxes out at UTF-8.
      // See https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
      // for the gory details, and for the solution implemented here.
      return btoa(encodeURIComponent(src).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
      }));
    default:
      throw new Error('Unable to base64 encode inline sourcemap.');
  }
};

// Function wrapper to add source file information to SyntaxErrors thrown by the
// lexer/parser/compiler.
var withPrettyErrors = function withPrettyErrors(fn) {
  return function (code, options) {
    if (options == null) {
      options = {};
    }
    try {
      return fn.call(this, code, options);
    } catch (err) {
      if (typeof code !== 'string') {
        throw err;
      } // Support `CoffeeScript.nodes(tokens)`.
      throw helpers.updateSyntaxError(err, code, options.filename);
    }
  };
};

// For each compiled file, save its source in memory in case we need to
// recompile it later. We might need to recompile if the first compilation
// didn’t create a source map (faster) but something went wrong and we need
// a stack trace. Assuming that most of the time, code isn’t throwing
// exceptions, it’s probably more efficient to compile twice only when we
// need a stack trace, rather than always generating a source map even when
// it’s not likely to be used. Save in form of `filename`: `(source)`
var sources = {};
// Also save source maps if generated, in form of `filename`: `(source map)`.
var sourceMaps = {};

// Compile CoffeeScript code to JavaScript, using the Coffee/Jison compiler.
//
// If `options.sourceMap` is specified, then `options.filename` must also be
// specified. All options that can be passed to `SourceMap#generate` may also
// be passed here.
//
// This returns a javascript string, unless `options.sourceMap` is passed,
// in which case this returns a `{js, v3SourceMap, sourceMap}`
// object, where sourceMap is a sourcemap.coffee#SourceMap object, handy for
// doing programmatic lookups.
exports.compile = compile = withPrettyErrors(function (code, options) {
  var map = void 0;var v3SourceMap = void 0;
  var token = void 0;
  var merge = helpers.merge,
      extend = helpers.extend;

  options = extend({}, options);
  // Always generate a source map if no filename is passed in, since without a
  // a filename we have no way to retrieve this source later in the event that
  // we need to recompile it to get a source map for `prepareStackTrace`.
  var generateSourceMap = options.sourceMap || options.inlineMap || options.filename == null;
  var filename = options.filename || '<anonymous>';

  sources[filename] = code;
  if (generateSourceMap) {
    map = new SourceMap();
  }

  var tokens = lexer.tokenize(code, options);

  // Pass a list of referenced variables, so that generated variables won't get
  // the same name.
  options.referencedVars = function () {
    var result = [];

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Array.from(tokens)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        token = _step.value;

        if (token[0] === 'IDENTIFIER') {
          result.push(token[1]);
        }
      }
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

    return result;
  }();

  // Check for import or export; if found, force bare mode.
  if (options.bare == null || options.bare !== true) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = Array.from(tokens)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        token = _step2.value;

        if (['IMPORT', 'EXPORT'].includes(token[0])) {
          options.bare = true;
          break;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  var fragments = parser.parse(tokens).compileToFragments(options);

  var currentLine = 0;
  if (options.header) {
    currentLine += 1;
  }
  if (options.shiftLine) {
    currentLine += 1;
  }
  var currentColumn = 0;
  var js = '';
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = Array.from(fragments)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var fragment = _step3.value;

      // Update the sourcemap with data from each fragment.
      if (generateSourceMap) {
        // Do not include empty, whitespace, or semicolon-only fragments.
        if (fragment.locationData && !/^[;\s]*$/.test(fragment.code)) {
          map.add([fragment.locationData.first_line, fragment.locationData.first_column], [currentLine, currentColumn], { noReplace: true });
        }
        var newLines = helpers.count(fragment.code, '\n');
        currentLine += newLines;
        if (newLines) {
          currentColumn = fragment.code.length - (fragment.code.lastIndexOf('\n') + 1);
        } else {
          currentColumn += fragment.code.length;
        }
      }

      // Copy the code from each fragment into the final JavaScript.
      js += fragment.code;
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  if (options.header) {
    var header = 'Generated by CoffeeScript ' + this.VERSION;
    js = '// ' + header + '\n' + js;
  }

  if (generateSourceMap) {
    v3SourceMap = map.generate(options, code);
    sourceMaps[filename] = map;
  }

  if (options.inlineMap) {
    var encoded = base64encode(JSON.stringify(v3SourceMap));
    var sourceMapDataURI = '//# sourceMappingURL=data:application/json;base64,' + encoded;
    var sourceURL = '//# sourceURL=' + (options.filename != null ? options.filename : 'coffeescript');
    js = js + '\n' + sourceMapDataURI + '\n' + sourceURL;
  }

  if (options.sourceMap) {
    return {
      js: js,
      sourceMap: map,
      v3SourceMap: JSON.stringify(v3SourceMap, null, 2)
    };
  }
  return js;
});

// Tokenize a string of CoffeeScript code, and return the array of tokens.
exports.tokens = withPrettyErrors(function (code, options) {
  return lexer.tokenize(code, options);
});

// Parse a string of CoffeeScript code or an array of lexed tokens, and
// return the AST. You can then compile it by calling `.compile()` on the root,
// or traverse it by using `.traverseChildren()` with a callback.
exports.nodes = withPrettyErrors(function (source, options) {
  if (typeof source === 'string') {
    return parser.parse(lexer.tokenize(source, options));
  }
  return parser.parse(source);
});

// Compile and execute a string of CoffeeScript (on the server), correctly
// setting `__filename`, `__dirname`, and relative `require()`.
exports.run = function (code, options) {
  if (options == null) {
    options = {};
  }
  var mainModule = require.main;

  // Set the filename.
  mainModule.filename = process.argv[1] = options.filename ? fs.realpathSync(options.filename) : '<anonymous>';

  // Clear the module cache.
  if (mainModule.moduleCache) {
    mainModule.moduleCache = {};
  }

  // Assign paths for node_modules loading
  var dir = options.filename != null ? path.dirname(fs.realpathSync(options.filename)) : fs.realpathSync('.');
  mainModule.paths = require('module')._nodeModulePaths(dir);

  // Compile.
  if (!helpers.isCoffee(mainModule.filename) || require.extensions) {
    var answer = compile(code, options);
    code = answer.js != null ? answer.js : answer;
  }

  return mainModule._compile(code, mainModule.filename);
};

// Compile and evaluate a string of CoffeeScript (in a Node.js-like environment).
// The CoffeeScript REPL uses this to run the input.
exports.eval = function (code, options) {
  var k = void 0;var sandbox = void 0;var v = void 0;
  if (options == null) {
    options = {};
  }
  if (!(code = code.trim())) {
    return;
  }
  var createContext = vm.Script.createContext != null ? vm.Script.createContext : vm.createContext;

  var isContext = vm.isContext != null ? vm.isContext : function (ctx) {
    return options.sandbox instanceof createContext().constructor;
  };

  if (createContext) {
    if (options.sandbox != null) {
      if (isContext(options.sandbox)) {
        var _options = options;
        sandbox = _options.sandbox;
      } else {
        sandbox = createContext();
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = Object.keys(options.sandbox || {})[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            k = _step4.value;
            v = options.sandbox[k];sandbox[k] = v;
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
      sandbox.global = sandbox.root = sandbox.GLOBAL = sandbox;
    } else {
      sandbox = global;
    }
    sandbox.__filename = options.filename || 'eval';
    sandbox.__dirname = path.dirname(sandbox.__filename);
    // define module/require only if they chose not to specify their own
    if (sandbox === global && !sandbox.module && !sandbox.require) {
      var _module = void 0;var _require = void 0;
      var Module = require('module');
      sandbox.module = _module = new Module(options.modulename || 'eval');
      sandbox.require = _require = function _require(path) {
        return Module._load(path, _module, true);
      };
      _module.filename = sandbox.__filename;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = Array.from(Object.getOwnPropertyNames(require))[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var r = _step5.value;

          if (!['paths', 'arguments', 'caller'].includes(r)) {
            _require[r] = require[r];
          }
        }
        // use the same hack node currently uses for their own REPL
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      _require.paths = _module.paths = Module._nodeModulePaths(process.cwd());
      _require.resolve = function (request) {
        return Module._resolveFilename(request, _module);
      };
    }
  }
  var o = {};
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = Object.keys(options || {})[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      k = _step6.value;
      v = options[k];o[k] = v;
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  o.bare = true; // ensure return value
  var js = compile(code, o);
  if (sandbox === global) {
    return vm.runInThisContext(js);
  }
  return vm.runInContext(js, sandbox);
};

exports.register = function () {
  return require('./register');
};

// Throw error with deprecation warning when depending upon implicit `require.extensions` registration
if (require.extensions) {
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = Array.from(exports.FILE_EXTENSIONS)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var ext = _step7.value;

      (function (ext) {
        return require.extensions[ext] != null ? require.extensions[ext] : require.extensions[ext] = function () {
          throw new Error('Use CoffeeScript.register() or require the coffee-script/register module to require ' + ext + ' files.');
        };
      })(ext);
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7.return) {
        _iterator7.return();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }
}

exports._compileFile = function (filename, sourceMap, inlineMap) {
  var answer = void 0;
  if (sourceMap == null) {
    sourceMap = false;
  }
  if (inlineMap == null) {
    inlineMap = false;
  }
  var raw = fs.readFileSync(filename, 'utf8');
  // Strip the Unicode byte order mark, if this file begins with one.
  var stripped = raw.charCodeAt(0) === 0xFEFF ? raw.substring(1) : raw;

  try {
    answer = compile(stripped, {
      filename: filename,
      sourceMap: sourceMap,
      inlineMap: inlineMap,
      sourceFiles: [filename],
      literate: helpers.isLiterate(filename)
    });
  } catch (err) {
    // As the filename and code of a dynamically loaded file will be different
    // from the original file compiled with CoffeeScript.run, add that
    // information to error so it can be pretty-printed later.
    throw helpers.updateSyntaxError(err, stripped, filename);
  }

  return answer;
};

// Instantiate a Lexer for our use here.
var lexer = new Lexer();

// The real Lexer produces a generic stream of tokens. This object provides a
// thin wrapper around it, compatible with the Jison API. We can then pass it
// directly as a "Jison lexer".
parser.lexer = {
  lex: function lex() {
    var tag = void 0;
    var token = parser.tokens[this.pos++];
    if (token) {
      var _Array$from = Array.from(token);

      var _Array$from2 = _slicedToArray(_Array$from, 3);

      tag = _Array$from2[0];
      this.yytext = _Array$from2[1];
      this.yylloc = _Array$from2[2];

      parser.errorToken = token.origin || token;
      this.yylineno = this.yylloc.first_line;
    } else {
      tag = '';
    }

    return tag;
  },
  setInput: function setInput(tokens) {
    parser.tokens = tokens;
    return this.pos = 0;
  },
  upcomingInput: function upcomingInput() {
    return '';
  }
};
// Make all the AST nodes visible to the parser.
parser.yy = require('./nodes');

// Override Jison's default error handling function.
parser.yy.parseError = function (message, _ref) {
  var token = _ref.token;

  // Disregard Jison's message, it contains redundant line number information.
  // Disregard the token, we take its value directly from the lexer in case
  // the error is caused by a generated token which might refer to its origin.
  var errorToken = parser.errorToken,
      tokens = parser.tokens;

  var _Array$from3 = Array.from(errorToken),
      _Array$from4 = _slicedToArray(_Array$from3, 3),
      errorTag = _Array$from4[0],
      errorText = _Array$from4[1],
      errorLoc = _Array$from4[2];

  errorText = function () {
    switch (false) {
      case errorToken !== tokens[tokens.length - 1]:
        return 'end of input';
      case !['INDENT', 'OUTDENT'].includes(errorTag):
        return 'indentation';
      case !['IDENTIFIER', 'NUMBER', 'INFINITY', 'STRING', 'STRING_START', 'REGEX', 'REGEX_START'].includes(errorTag):
        return errorTag.replace(/_START$/, '').toLowerCase();
      default:
        return helpers.nameWhitespaceCharacter(errorText);
    }
  }();

  // The second argument has a `loc` property, which should have the location
  // data for this token. Unfortunately, Jison seems to send an outdated `loc`
  // (from the previous token), so we take the location information directly
  // from the lexer.
  return helpers.throwSyntaxError('unexpected ' + errorText, errorLoc);
};

// Based on http://v8.googlecode.com/svn/branches/bleeding_edge/src/messages.js
// Modified to handle sourceMap
var formatSourcePosition = function formatSourcePosition(frame, getSourceMapping) {
  var filename = void 0;
  var fileLocation = '';

  if (frame.isNative()) {
    fileLocation = 'native';
  } else {
    if (frame.isEval()) {
      filename = frame.getScriptNameOrSourceURL();
      if (!filename) {
        fileLocation = frame.getEvalOrigin() + ', ';
      }
    } else {
      filename = frame.getFileName();
    }

    if (!filename) {
      filename = '<anonymous>';
    }

    var line = frame.getLineNumber();
    var column = frame.getColumnNumber();

    // Check for a sourceMap position
    var source = getSourceMapping(filename, line, column);
    fileLocation = source ? filename + ':' + source[0] + ':' + source[1] : filename + ':' + line + ':' + column;
  }

  var functionName = frame.getFunctionName();
  var isConstructor = frame.isConstructor();
  var isMethodCall = !(frame.isToplevel() || isConstructor);

  if (isMethodCall) {
    var methodName = frame.getMethodName();
    var typeName = frame.getTypeName();

    if (functionName) {
      var as = void 0;
      var tp = as = '';
      if (typeName && functionName.indexOf(typeName)) {
        tp = typeName + '.';
      }
      if (methodName && functionName.indexOf('.' + methodName) !== functionName.length - methodName.length - 1) {
        as = ' [as ' + methodName + ']';
      }

      return '' + tp + functionName + as + ' (' + fileLocation + ')';
    }
    return typeName + '.' + (methodName || '<anonymous>') + ' (' + fileLocation + ')';
  }if (isConstructor) {
    return 'new ' + (functionName || '<anonymous>') + ' (' + fileLocation + ')';
  }if (functionName) {
    return functionName + ' (' + fileLocation + ')';
  }
  return fileLocation;
};

var getSourceMap = function getSourceMap(filename) {
  if (sourceMaps[filename] != null) {
    return sourceMaps[filename];
    // CoffeeScript compiled in a browser may get compiled with `options.filename`
    // of `<anonymous>`, but the browser may request the stack trace with the
    // filename of the script file.
  }if (sourceMaps['<anonymous>'] != null) {
    return sourceMaps['<anonymous>'];
  }if (sources[filename] != null) {
    var answer = compile(sources[filename], {
      filename: filename,
      sourceMap: true,
      literate: helpers.isLiterate(filename)
    });
    return answer.sourceMap;
  }
  return null;
};

// Based on [michaelficarra/CoffeeScriptRedux](http://goo.gl/ZTx1p)
// NodeJS / V8 have no support for transforming positions in stack traces using
// sourceMap, so we must monkey-patch Error to display CoffeeScript source
// positions.
Error.prepareStackTrace = function (err, stack) {
  var getSourceMapping = function getSourceMapping(filename, line, column) {
    var answer = void 0;
    var sourceMap = getSourceMap(filename);
    if (sourceMap != null) {
      answer = sourceMap.sourceLocation([line - 1, column - 1]);
    }
    if (answer != null) {
      return [answer[0] + 1, answer[1] + 1];
    }return null;
  };

  var frames = function () {
    var result = [];
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = Array.from(stack)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        var frame = _step8.value;

        if (frame.getFunction() === exports.run) {
          break;
        }
        result.push('    at ' + formatSourcePosition(frame, getSourceMapping));
      }
    } catch (err) {
      _didIteratorError8 = true;
      _iteratorError8 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion8 && _iterator8.return) {
          _iterator8.return();
        }
      } finally {
        if (_didIteratorError8) {
          throw _iteratorError8;
        }
      }
    }

    return result;
  }();

  return err.toString() + '\n' + frames.join('\n') + '\n';
};