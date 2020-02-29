var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* eslint-disable
    camelcase,
    func-names,
    guard-for-in,
    max-len,
    no-bitwise,
    no-cond-assign,
    no-multi-assign,
    no-nested-ternary,
    no-param-reassign,
    no-plusplus,
    no-restricted-syntax,
    no-return-assign,
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
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// This file contains the common helper functions that we'd like to share among
// the **Lexer**, **Rewriter**, and the **Nodes**. Merge objects, flatten
// arrays, count characters, that sort of thing.

// Peek at the beginning of a given string to see if it matches a sequence.
var _flatten = void 0;var repeat = void 0;
exports.starts = function (string, literal, start) {
  return literal === string.substr(start, literal.length);
};

// Peek at the end of a given string to see if it matches a sequence.
exports.ends = function (string, literal, back) {
  var len = literal.length;
  return literal === string.substr(string.length - len - (back || 0), len);
};

// Repeat a string `n` times.
exports.repeat = repeat = function repeat(str, n) {
  // Use clever algorithm to have O(log(n)) string concatenation operations.
  var res = '';
  while (n > 0) {
    if (n & 1) {
      res += str;
    }
    n >>>= 1;
    str += str;
  }
  return res;
};

// Trim out all falsy values from an array.
exports.compact = function (array) {
  return Array.from(array).filter(function (item) {
    return item;
  });
};

// Count the number of occurrences of a string in a string.
exports.count = function (string, substr) {
  var pos = void 0;
  var num = pos = 0;
  if (!substr.length) {
    return 1 / 0;
  }
  while (pos = 1 + string.indexOf(substr, pos)) {
    num++;
  }
  return num;
};

// Merge objects, returning a fresh copy with attributes from both sides.
// Used every time `Base#compile` is called, to allow properties in the
// options hash to propagate down the tree without polluting other branches.
exports.merge = function (options, overrides) {
  return extend(extend({}, options), overrides);
};

// Extend a source object with the properties of another object (shallow copy).
var extend = exports.extend = function (object, properties) {
  for (var key in properties) {
    var val = properties[key];
    object[key] = val;
  }
  return object;
};

// Return a flattened version of an array.
// Handy for getting a list of `children` from the nodes.
exports.flatten = _flatten = function flatten(array) {
  var flattened = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Array.from(array)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var element = _step.value;

      if (Object.prototype.toString.call(element) === '[object Array]') {
        flattened = flattened.concat(_flatten(element));
      } else {
        flattened.push(element);
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

  return flattened;
};

// Delete a key from an object, returning the value. Useful when a node is
// looking for a particular method in an options hash.
exports.del = function (obj, key) {
  var val = obj[key];
  delete obj[key];
  return val;
};

// Typical Array::some
exports.some = Array.prototype.some != null ? Array.prototype.some : function (fn) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = Array.from(this)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var e = _step2.value;
      if (fn(e)) {
        return true;
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

  return false;
};

// Simple function for inverting Literate CoffeeScript code by putting the
// documentation in comments, producing a string of CoffeeScript code that
// can be compiled "normally".
exports.invertLiterate = function (code) {
  var maybe_code = true;
  var lines = Array.from(code.split('\n')).map(function (line) {
    return maybe_code && /^([ ]{4}|[ ]{0,3}\t)/.test(line) ? line : (maybe_code = /^\s*$/.test(line)) ? line : '# ' + line;
  });
  return lines.join('\n');
};

// Merge two jison-style location data objects together.
// If `last` is not provided, this will simply return `first`.
var buildLocationData = function buildLocationData(first, last) {
  if (!last) {
    return first;
  }
  return {
    first_line: first.first_line,
    first_column: first.first_column,
    last_line: last.last_line,
    last_column: last.last_column
  };
};

// This returns a function which takes an object as a parameter, and if that
// object is an AST node, updates that object's locationData.
// The object is returned either way.
exports.addLocationDataFn = function (first, last) {
  return function (obj) {
    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && !!obj.updateLocationDataIfMissing) {
      obj.updateLocationDataIfMissing(buildLocationData(first, last));
    }

    return obj;
  };
};

// Convert jison location data to a string.
// `obj` can be a token, or a locationData.
exports.locationDataToString = function (obj) {
  var locationData = void 0;
  if ('2' in obj && 'first_line' in obj[2]) {
    locationData = obj[2];
  } else if ('first_line' in obj) {
    locationData = obj;
  }

  if (locationData) {
    return locationData.first_line + 1 + ':' + (locationData.first_column + 1) + '-' + (locationData.last_line + 1 + ':' + (locationData.last_column + 1));
  }
  return 'No location data';
};

// A `.coffee.md` compatible version of `basename`, that returns the file sans-extension.
exports.baseFileName = function (file, stripExt, useWinPathSep) {
  if (stripExt == null) {
    stripExt = false;
  }
  if (useWinPathSep == null) {
    useWinPathSep = false;
  }
  var pathSep = useWinPathSep ? /\\|\// : /\//;
  var parts = file.split(pathSep);
  file = parts[parts.length - 1];
  if (!stripExt || !(file.indexOf('.') >= 0)) {
    return file;
  }
  parts = file.split('.');
  parts.pop();
  if (parts[parts.length - 1] === 'coffee' && parts.length > 1) {
    parts.pop();
  }
  return parts.join('.');
};

// Determine if a filename represents a CoffeeScript file.
exports.isCoffee = function (file) {
  return (/\.((lit)?coffee|coffee\.md)$/.test(file)
  );
};

// Determine if a filename represents a Literate CoffeeScript file.
exports.isLiterate = function (file) {
  return (/\.(litcoffee|coffee\.md)$/.test(file)
  );
};

// Throws a SyntaxError from a given location.
// The error's `toString` will return an error message following the "standard"
// format `<filename>:<line>:<col>: <message>` plus the line with the error and a
// marker showing where the error is.
exports.throwSyntaxError = function (message, location) {
  var error = new SyntaxError(message);
  error.location = location;
  error.toString = syntaxErrorToString;

  // Instead of showing the compiler's stacktrace, show our custom error message
  // (this is useful when the error bubbles up in Node.js applications that
  // compile CoffeeScript for example).
  error.stack = error.toString();

  throw error;
};

// Update a compiler SyntaxError with source code information if it didn't have
// it already.
exports.updateSyntaxError = function (error, code, filename) {
  // Avoid screwing up the `stack` property of other errors (i.e. possible bugs).
  if (error.toString === syntaxErrorToString) {
    if (!error.code) {
      error.code = code;
    }
    if (!error.filename) {
      error.filename = filename;
    }
    error.stack = error.toString();
  }
  return error;
};

var syntaxErrorToString = function syntaxErrorToString() {
  var colorsEnabled = void 0;
  if (!this.code || !this.location) {
    return Error.prototype.toString.call(this);
  }

  var _location = this.location,
      first_line = _location.first_line,
      first_column = _location.first_column,
      last_line = _location.last_line,
      last_column = _location.last_column;

  if (last_line == null) {
    last_line = first_line;
  }
  if (last_column == null) {
    last_column = first_column;
  }

  var filename = this.filename || '[stdin]';
  var codeLine = this.code.split('\n')[first_line];
  var start = first_column;
  // Show only the first line on multi-line errors.
  var end = first_line === last_line ? last_column + 1 : codeLine.length;
  var marker = codeLine.slice(0, start).replace(/[^\s]/g, ' ') + repeat('^', end - start);

  // Check to see if we're running on a color-enabled TTY.
  if (typeof process !== 'undefined' && process !== null) {
    colorsEnabled = (process.stdout != null ? process.stdout.isTTY : undefined) && !(process.env != null ? process.env.NODE_DISABLE_COLORS : undefined);
  }

  if (this.colorful != null ? this.colorful : colorsEnabled) {
    var colorize = function colorize(str) {
      return '\x1B[1;31m' + str + '\x1B[0m';
    };
    codeLine = codeLine.slice(0, start) + colorize(codeLine.slice(start, end)) + codeLine.slice(end);
    marker = colorize(marker);
  }

  return filename + ':' + (first_line + 1) + ':' + (first_column + 1) + ': error: ' + this.message + '\n' + codeLine + '\n' + marker;
};

exports.nameWhitespaceCharacter = function (string) {
  switch (string) {
    case ' ':
      return 'space';
    case '\n':
      return 'newline';
    case '\r':
      return 'carriage return';
    case '\t':
      return 'tab';
    default:
      return string;
  }
};