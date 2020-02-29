var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable
    class-methods-use-this,
    consistent-return,
    func-names,
    max-classes-per-file,
    no-bitwise,
    no-cond-assign,
    no-param-reassign,
    no-plusplus,
    no-restricted-syntax,
    no-return-assign,
    no-shadow,
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
 * DS201: Simplify complex destructure assignments
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Source maps allow JavaScript runtimes to match running JavaScript back to
// the original source code that corresponds to it. This can be minified
// JavaScript, but in our case, we're concerned with mapping pretty-printed
// JavaScript back to CoffeeScript.
//
// In order to produce maps, we must keep track of positions (line number, column number)
// that originated every node in the syntax tree, and be able to generate a
// [map file](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit)
// — which is a compact, VLQ-encoded representation of the JSON serialization
// of this information — to write out alongside the generated JavaScript.
//
//
// LineMap
// -------
//
// A **LineMap** object keeps track of information about original line and column
// positions for a single line of output JavaScript code.
// **SourceMaps** are implemented in terms of **LineMaps**.
var LineMap = function () {
  function LineMap(line) {
    _classCallCheck(this, LineMap);

    this.line = line;
    this.columns = [];
  }

  _createClass(LineMap, [{
    key: 'add',
    value: function add(column) {
      var _Array$from = Array.from(arguments.length <= 1 ? undefined : arguments[1]),
          _Array$from2 = _slicedToArray(_Array$from, 2),
          sourceLine = _Array$from2[0],
          sourceColumn = _Array$from2[1];

      var val = arguments.length <= 2 ? undefined : arguments[2];var options = val != null ? val : {};
      if (this.columns[column] && options.noReplace) {
        return;
      }
      return this.columns[column] = {
        line: this.line, column: column, sourceLine: sourceLine, sourceColumn: sourceColumn
      };
    }
  }, {
    key: 'sourceLocation',
    value: function sourceLocation(column) {
      var mapping = void 0;
      while (!(mapping = this.columns[column]) && !(column <= 0)) {
        column--;
      }
      return mapping && [mapping.sourceLine, mapping.sourceColumn];
    }
  }]);

  return LineMap;
}();

// SourceMap
// ---------
//
// Maps locations in a single generated JavaScript file back to locations in
// the original CoffeeScript source file.
//
// This is intentionally agnostic towards how a source map might be represented on
// disk. Once the compiler is ready to produce a "v3"-style source map, we can walk
// through the arrays of line and column buffer to produce it.


var SourceMap = function () {
  var VLQ_SHIFT = void 0;
  var VLQ_CONTINUATION_BIT = void 0;
  var VLQ_VALUE_MASK = void 0;
  var BASE64_CHARS = void 0;
  SourceMap = function () {
    _createClass(SourceMap, null, [{
      key: 'initClass',
      value: function initClass() {
        // Base64 VLQ Encoding
        // -------------------
        //
        // Note that SourceMap VLQ encoding is "backwards".  MIDI-style VLQ encoding puts
        // the most-significant-bit (MSB) from the original value into the MSB of the VLQ
        // encoded value (see [Wikipedia](https://en.wikipedia.org/wiki/File:Uintvar_coding.svg)).
        // SourceMap VLQ does things the other way around, with the least significat four
        // bits of the original value encoded into the first byte of the VLQ encoded value.
        VLQ_SHIFT = 5;
        VLQ_CONTINUATION_BIT = 1 << VLQ_SHIFT; // 0010 0000
        VLQ_VALUE_MASK = VLQ_CONTINUATION_BIT - 1;

        // Regular Base64 Encoding
        // -----------------------
        BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      }
    }]);

    function SourceMap() {
      _classCallCheck(this, SourceMap);

      this.lines = [];
    }

    // Adds a mapping to this SourceMap. `sourceLocation` and `generatedLocation`
    // are both `[line, column]` arrays. If `options.noReplace` is true, then if there
    // is already a mapping for the specified `line` and `column`, this will have no
    // effect.


    _createClass(SourceMap, [{
      key: 'add',
      value: function add(sourceLocation, generatedLocation, options) {
        if (options == null) {
          options = {};
        }

        var _Array$from3 = Array.from(generatedLocation),
            _Array$from4 = _slicedToArray(_Array$from3, 2),
            line = _Array$from4[0],
            column = _Array$from4[1];

        var lineMap = this.lines[line] || (this.lines[line] = new LineMap(line));
        return lineMap.add(column, sourceLocation, options);
      }

      // Look up the original position of a given `line` and `column` in the generated
      // code.

    }, {
      key: 'sourceLocation',
      value: function sourceLocation() {
        var lineMap = void 0;

        var _Array$from5 = Array.from(arguments.length <= 0 ? undefined : arguments[0]),
            _Array$from6 = _slicedToArray(_Array$from5, 2),
            line = _Array$from6[0],
            column = _Array$from6[1];

        while (!(lineMap = this.lines[line]) && !(line <= 0)) {
          line--;
        }
        return lineMap && lineMap.sourceLocation(column);
      }

      // V3 SourceMap Generation
      // -----------------------
      //
      // Builds up a V3 source map, returning the generated JSON as a string.
      // `options.sourceRoot` may be used to specify the sourceRoot written to the source
      // map.  Also, `options.sourceFiles` and `options.generatedFile` may be passed to
      // set "sources" and "file", respectively.

    }, {
      key: 'generate',
      value: function generate(options) {
        var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        if (options == null) {
          options = {};
        }
        var writingline = 0;
        var lastColumn = 0;
        var lastSourceLine = 0;
        var lastSourceColumn = 0;
        var needComma = false;
        var buffer = '';

        for (var lineNumber = 0; lineNumber < this.lines.length; lineNumber++) {
          var lineMap = this.lines[lineNumber];
          if (lineMap) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = Array.from(lineMap.columns)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var mapping = _step.value;

                if (mapping) {
                  while (writingline < mapping.line) {
                    lastColumn = 0;
                    needComma = false;
                    buffer += ';';
                    writingline++;
                  }

                  // Write a comma if we've already written a segment on this line.
                  if (needComma) {
                    buffer += ',';
                    needComma = false;
                  }

                  // Write the next segment. Segments can be 1, 4, or 5 values.  If just one, then it
                  // is a generated column which doesn't match anything in the source code.
                  //
                  // The starting column in the generated source, relative to any previous recorded
                  // column for the current line:
                  buffer += this.encodeVlq(mapping.column - lastColumn);
                  lastColumn = mapping.column;

                  // The index into the list of sources:
                  buffer += this.encodeVlq(0);

                  // The starting line in the original source, relative to the previous source line.
                  buffer += this.encodeVlq(mapping.sourceLine - lastSourceLine);
                  lastSourceLine = mapping.sourceLine;

                  // The starting column in the original source, relative to the previous column.
                  buffer += this.encodeVlq(mapping.sourceColumn - lastSourceColumn);
                  lastSourceColumn = mapping.sourceColumn;
                  needComma = true;
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
          }
        }

        // Produce the canonical JSON object format for a "v3" source map.
        var v3 = {
          version: 3,
          file: options.generatedFile || '',
          sourceRoot: options.sourceRoot || '',
          sources: options.sourceFiles || [''],
          names: [],
          mappings: buffer
        };

        if (options.inlineMap) {
          v3.sourcesContent = [code];
        }

        return v3; // 0001 1111
      }
    }, {
      key: 'encodeVlq',
      value: function encodeVlq(value) {
        var answer = '';

        // Least significant bit represents the sign.
        var signBit = value < 0 ? 1 : 0;

        // The next bits are the actual value.
        var valueToEncode = (Math.abs(value) << 1) + signBit;

        // Make sure we encode at least one character, even if valueToEncode is 0.
        while (valueToEncode || !answer) {
          var nextChunk = valueToEncode & VLQ_VALUE_MASK;
          valueToEncode >>= VLQ_SHIFT;
          if (valueToEncode) {
            nextChunk |= VLQ_CONTINUATION_BIT;
          }
          answer += this.encodeBase64(nextChunk);
        }

        return answer;
      }
    }, {
      key: 'encodeBase64',
      value: function encodeBase64(value) {
        return BASE64_CHARS[value] || function () {
          throw new Error('Cannot Base64 encode value: ' + value);
        }();
      }
    }]);

    return SourceMap;
  }();
  SourceMap.initClass();
  return SourceMap;
}();

// Our API for source maps is just the `SourceMap` class.
module.exports = SourceMap;