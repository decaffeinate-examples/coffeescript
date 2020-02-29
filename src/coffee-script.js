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

let compile;
const fs            = require('fs');
const vm            = require('vm');
const path          = require('path');
const {Lexer}       = require('./lexer');
const {parser}      = require('./parser');
const helpers       = require('./helpers');
const SourceMap     = require('./sourcemap');
// Require `package.json`, which is two levels above this file, as this file is
// evaluated from `lib/coffee-script`.
const packageJson   = require('../../package.json');

// The current CoffeeScript version number.
exports.VERSION = packageJson.version;

exports.FILE_EXTENSIONS = ['.coffee', '.litcoffee', '.coffee.md'];

// Expose helpers for testing.
exports.helpers = helpers;

// Function that allows for btoa in both nodejs and the browser.
const base64encode = function(src) { switch (false) {
  case typeof Buffer !== 'function':
    return new Buffer(src).toString('base64');
  case typeof btoa !== 'function':
    // The contents of a `<script>` block are encoded via UTF-16, so if any extended
    // characters are used in the block, btoa will fail as it maxes out at UTF-8.
    // See https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
    // for the gory details, and for the solution implemented here.
    return btoa(encodeURIComponent(src).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1))
    );
  default:
    throw new Error('Unable to base64 encode inline sourcemap.');
} };

// Function wrapper to add source file information to SyntaxErrors thrown by the
// lexer/parser/compiler.
const withPrettyErrors = fn => (function(code, options) {
  if (options == null) { options = {}; }
  try {
    return fn.call(this, code, options);
  } catch (err) {
    if (typeof code !== 'string') { throw err; } // Support `CoffeeScript.nodes(tokens)`.
    throw helpers.updateSyntaxError(err, code, options.filename);
  }
});

// For each compiled file, save its source in memory in case we need to
// recompile it later. We might need to recompile if the first compilation
// didn’t create a source map (faster) but something went wrong and we need
// a stack trace. Assuming that most of the time, code isn’t throwing
// exceptions, it’s probably more efficient to compile twice only when we
// need a stack trace, rather than always generating a source map even when
// it’s not likely to be used. Save in form of `filename`: `(source)`
const sources = {};
// Also save source maps if generated, in form of `filename`: `(source map)`.
const sourceMaps = {};

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
exports.compile = (compile = withPrettyErrors(function(code, options) {
  let map, v3SourceMap;
  let token;
  const {merge, extend} = helpers;
  options = extend({}, options);
  // Always generate a source map if no filename is passed in, since without a
  // a filename we have no way to retrieve this source later in the event that
  // we need to recompile it to get a source map for `prepareStackTrace`.
  const generateSourceMap = options.sourceMap || options.inlineMap || (options.filename == null);
  const filename = options.filename || '<anonymous>';

  sources[filename] = code;
  if (generateSourceMap) { map = new SourceMap; }

  const tokens = lexer.tokenize(code, options);

  // Pass a list of referenced variables, so that generated variables won't get
  // the same name.
  options.referencedVars = ((() => {
    const result = [];
    
    for (token of Array.from(tokens)) {       if (token[0] === 'IDENTIFIER') {
        result.push(token[1]);
      }
    }
  
    return result;
  })());

  // Check for import or export; if found, force bare mode.
  if ((options.bare == null) || (options.bare !== true)) {
    for (token of Array.from(tokens)) {
      if (['IMPORT', 'EXPORT'].includes(token[0])) {
        options.bare = true;
        break;
      }
    }
  }

  const fragments = parser.parse(tokens).compileToFragments(options);

  let currentLine = 0;
  if (options.header) { currentLine += 1; }
  if (options.shiftLine) { currentLine += 1; }
  let currentColumn = 0;
  let js = "";
  for (let fragment of Array.from(fragments)) {
    // Update the sourcemap with data from each fragment.
    if (generateSourceMap) {
      // Do not include empty, whitespace, or semicolon-only fragments.
      if (fragment.locationData && !/^[;\s]*$/.test(fragment.code)) {
        map.add(
          [fragment.locationData.first_line, fragment.locationData.first_column],
          [currentLine, currentColumn],
          {noReplace: true});
      }
      const newLines = helpers.count(fragment.code, "\n");
      currentLine += newLines;
      if (newLines) {
        currentColumn = fragment.code.length - (fragment.code.lastIndexOf("\n") + 1);
      } else {
        currentColumn += fragment.code.length;
      }
    }

    // Copy the code from each fragment into the final JavaScript.
    js += fragment.code;
  }

  if (options.header) {
    const header = `Generated by CoffeeScript ${this.VERSION}`;
    js = `// ${header}\n${js}`;
  }

  if (generateSourceMap) {
    v3SourceMap = map.generate(options, code);
    sourceMaps[filename] = map;
  }

  if (options.inlineMap) {
    const encoded = base64encode(JSON.stringify(v3SourceMap));
    const sourceMapDataURI = `//# sourceMappingURL=data:application/json;base64,${encoded}`;
    const sourceURL = `//# sourceURL=${options.filename != null ? options.filename : 'coffeescript'}`;
    js = `${js}\n${sourceMapDataURI}\n${sourceURL}`;
  }

  if (options.sourceMap) {
    return {
      js,
      sourceMap: map,
      v3SourceMap: JSON.stringify(v3SourceMap, null, 2)
    };
  } else {
    return js;
  }
}));

// Tokenize a string of CoffeeScript code, and return the array of tokens.
exports.tokens = withPrettyErrors((code, options) => lexer.tokenize(code, options));

// Parse a string of CoffeeScript code or an array of lexed tokens, and
// return the AST. You can then compile it by calling `.compile()` on the root,
// or traverse it by using `.traverseChildren()` with a callback.
exports.nodes = withPrettyErrors(function(source, options) {
  if (typeof source === 'string') {
    return parser.parse(lexer.tokenize(source, options));
  } else {
    return parser.parse(source);
  }
});

// Compile and execute a string of CoffeeScript (on the server), correctly
// setting `__filename`, `__dirname`, and relative `require()`.
exports.run = function(code, options) {
  if (options == null) { options = {}; }
  const mainModule = require.main;

  // Set the filename.
  mainModule.filename = (process.argv[1] =
    options.filename ? fs.realpathSync(options.filename) : '<anonymous>');

  // Clear the module cache.
  if (mainModule.moduleCache) { mainModule.moduleCache = {}; }

  // Assign paths for node_modules loading
  const dir = (options.filename != null) ?
    path.dirname(fs.realpathSync(options.filename))
  :
    fs.realpathSync('.');
  mainModule.paths = require('module')._nodeModulePaths(dir);

  // Compile.
  if (!helpers.isCoffee(mainModule.filename) || require.extensions) {
    const answer = compile(code, options);
    code = answer.js != null ? answer.js : answer;
  }

  return mainModule._compile(code, mainModule.filename);
};

// Compile and evaluate a string of CoffeeScript (in a Node.js-like environment).
// The CoffeeScript REPL uses this to run the input.
exports.eval = function(code, options) {
  let k, sandbox, v;
  if (options == null) { options = {}; }
  if (!(code = code.trim())) { return; }
  const createContext = vm.Script.createContext != null ? vm.Script.createContext : vm.createContext;

  const isContext = vm.isContext != null ? vm.isContext : ctx => options.sandbox instanceof createContext().constructor;

  if (createContext) {
    if (options.sandbox != null) {
      if (isContext(options.sandbox)) {
        ({
          sandbox
        } = options);
      } else {
        sandbox = createContext();
        for (k of Object.keys(options.sandbox || {})) { v = options.sandbox[k]; sandbox[k] = v; }
      }
      sandbox.global = (sandbox.root = (sandbox.GLOBAL = sandbox));
    } else {
      sandbox = global;
    }
    sandbox.__filename = options.filename || 'eval';
    sandbox.__dirname  = path.dirname(sandbox.__filename);
    // define module/require only if they chose not to specify their own
    if ((sandbox === global) && !sandbox.module && !sandbox.require) {
      let _module, _require;
      const Module = require('module');
      sandbox.module  = (_module  = new Module(options.modulename || 'eval'));
      sandbox.require = (_require = path => Module._load(path, _module, true));
      _module.filename = sandbox.__filename;
      for (let r of Array.from(Object.getOwnPropertyNames(require))) {
        if (!['paths', 'arguments', 'caller'].includes(r)) {
          _require[r] = require[r];
        }
      }
      // use the same hack node currently uses for their own REPL
      _require.paths = (_module.paths = Module._nodeModulePaths(process.cwd()));
      _require.resolve = request => Module._resolveFilename(request, _module);
    }
  }
  const o = {};
  for (k of Object.keys(options || {})) { v = options[k]; o[k] = v; }
  o.bare = true; // ensure return value
  const js = compile(code, o);
  if (sandbox === global) {
    return vm.runInThisContext(js);
  } else {
    return vm.runInContext(js, sandbox);
  }
};

exports.register = () => require('./register');

// Throw error with deprecation warning when depending upon implicit `require.extensions` registration
if (require.extensions) {
  for (let ext of Array.from(this.FILE_EXTENSIONS)) { ((ext => require.extensions[ext] != null ? require.extensions[ext] : (require.extensions[ext] = function() {
    throw new Error(`\
Use CoffeeScript.register() or require the coffee-script/register module to require ${ext} files.\
`
    );
  })))(ext); }
}

exports._compileFile = function(filename, sourceMap, inlineMap) {
  let answer;
  if (sourceMap == null) { sourceMap = false; }
  if (inlineMap == null) { inlineMap = false; }
  const raw = fs.readFileSync(filename, 'utf8');
  // Strip the Unicode byte order mark, if this file begins with one.
  const stripped = raw.charCodeAt(0) === 0xFEFF ? raw.substring(1) : raw;

  try {
    answer = compile(stripped, {
      filename, sourceMap, inlineMap,
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
var lexer = new Lexer;

// The real Lexer produces a generic stream of tokens. This object provides a
// thin wrapper around it, compatible with the Jison API. We can then pass it
// directly as a "Jison lexer".
parser.lexer = {
  lex() {
    let tag;
    const token = parser.tokens[this.pos++];
    if (token) {
      [tag, this.yytext, this.yylloc] = Array.from(token);
      parser.errorToken = token.origin || token;
      this.yylineno = this.yylloc.first_line;
    } else {
      tag = '';
    }

    return tag;
  },
  setInput(tokens) {
    parser.tokens = tokens;
    return this.pos = 0;
  },
  upcomingInput() {
    return "";
  }
};
// Make all the AST nodes visible to the parser.
parser.yy = require('./nodes');

// Override Jison's default error handling function.
parser.yy.parseError = function(message, {token}) {
  // Disregard Jison's message, it contains redundant line number information.
  // Disregard the token, we take its value directly from the lexer in case
  // the error is caused by a generated token which might refer to its origin.
  const {errorToken, tokens} = parser;
  let [errorTag, errorText, errorLoc] = Array.from(errorToken);

  errorText = (() => { switch (false) {
    case errorToken !== tokens[tokens.length - 1]:
      return 'end of input';
    case !['INDENT', 'OUTDENT'].includes(errorTag):
      return 'indentation';
    case !['IDENTIFIER', 'NUMBER', 'INFINITY', 'STRING', 'STRING_START', 'REGEX', 'REGEX_START'].includes(errorTag):
      return errorTag.replace(/_START$/, '').toLowerCase();
    default:
      return helpers.nameWhitespaceCharacter(errorText);
  } })();

  // The second argument has a `loc` property, which should have the location
  // data for this token. Unfortunately, Jison seems to send an outdated `loc`
  // (from the previous token), so we take the location information directly
  // from the lexer.
  return helpers.throwSyntaxError(`unexpected ${errorText}`, errorLoc);
};

// Based on http://v8.googlecode.com/svn/branches/bleeding_edge/src/messages.js
// Modified to handle sourceMap
const formatSourcePosition = function(frame, getSourceMapping) {
  let filename = undefined;
  let fileLocation = '';

  if (frame.isNative()) {
    fileLocation = "native";
  } else {
    if (frame.isEval()) {
      filename = frame.getScriptNameOrSourceURL();
      if (!filename) { fileLocation = `${frame.getEvalOrigin()}, `; }
    } else {
      filename = frame.getFileName();
    }

    if (!filename) { filename = "<anonymous>"; }

    const line = frame.getLineNumber();
    const column = frame.getColumnNumber();

    // Check for a sourceMap position
    const source = getSourceMapping(filename, line, column);
    fileLocation =
      source ?
        `${filename}:${source[0]}:${source[1]}`
      :
        `${filename}:${line}:${column}`;
  }

  const functionName = frame.getFunctionName();
  const isConstructor = frame.isConstructor();
  const isMethodCall = !(frame.isToplevel() || isConstructor);

  if (isMethodCall) {
    const methodName = frame.getMethodName();
    const typeName = frame.getTypeName();

    if (functionName) {
      let as;
      let tp = (as = '');
      if (typeName && functionName.indexOf(typeName)) {
        tp = `${typeName}.`;
      }
      if (methodName && (functionName.indexOf(`.${methodName}`) !== (functionName.length - methodName.length - 1))) {
        as = ` [as ${methodName}]`;
      }

      return `${tp}${functionName}${as} (${fileLocation})`;
    } else {
      return `${typeName}.${methodName || '<anonymous>'} (${fileLocation})`;
    }
  } else if (isConstructor) {
    return `new ${functionName || '<anonymous>'} (${fileLocation})`;
  } else if (functionName) {
    return `${functionName} (${fileLocation})`;
  } else {
    return fileLocation;
  }
};

const getSourceMap = function(filename) {
  if (sourceMaps[filename] != null) {
    return sourceMaps[filename];
  // CoffeeScript compiled in a browser may get compiled with `options.filename`
  // of `<anonymous>`, but the browser may request the stack trace with the
  // filename of the script file.
  } else if (sourceMaps['<anonymous>'] != null) {
    return sourceMaps['<anonymous>'];
  } else if (sources[filename] != null) {
    const answer = compile(sources[filename], {
      filename,
      sourceMap: true,
      literate: helpers.isLiterate(filename)
    }
    );
    return answer.sourceMap;
  } else {
    return null;
  }
};

// Based on [michaelficarra/CoffeeScriptRedux](http://goo.gl/ZTx1p)
// NodeJS / V8 have no support for transforming positions in stack traces using
// sourceMap, so we must monkey-patch Error to display CoffeeScript source
// positions.
Error.prepareStackTrace = function(err, stack) {
  const getSourceMapping = function(filename, line, column) {
    let answer;
    const sourceMap = getSourceMap(filename);
    if (sourceMap != null) { answer = sourceMap.sourceLocation([line - 1, column - 1]); }
    if (answer != null) { return [answer[0] + 1, answer[1] + 1]; } else { return null; }
  };

  const frames = (() => {
    const result = [];
    for (let frame of Array.from(stack)) {
      if (frame.getFunction() === exports.run) { break; }
      result.push(`    at ${formatSourcePosition(frame, getSourceMapping)}`);
    }
    return result;
  })();

  return `${err.toString()}\n${frames.join('\n')}\n`;
};
