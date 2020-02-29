var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable
    func-names,
    no-cond-assign,
    no-continue,
    no-multi-assign,
    no-param-reassign,
    no-plusplus,
    no-restricted-syntax,
    no-shadow,
    no-unused-vars,
    no-use-before-define,
    no-useless-escape,
    no-var,
    prefer-destructuring,
    vars-on-top,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var OptionParser = void 0;

var _require = require('./helpers'),
    repeat = _require.repeat;

// A simple **OptionParser** class to parse option flags from the command-line.
// Use it like so:
//
//     parser  = new OptionParser switches, helpBanner
//     options = parser.parse process.argv
//
// The first non-option is considered to be the start of the file (and file
// option) list, and all subsequent arguments are left unparsed.


exports.OptionParser = OptionParser = function () {
  // Initialize with a list of valid options, in the form:
  //
  //     [short-flag, long-flag, description]
  //
  // Along with an optional banner for the usage help.
  function OptionParser(rules, banner) {
    _classCallCheck(this, OptionParser);

    this.banner = banner;
    this.rules = buildRules(rules);
  }

  // Parse the list of arguments, populating an `options` object with all of the
  // specified options, and return it. Options after the first non-option
  // argument are treated as arguments. `options.arguments` will be an array
  // containing the remaining arguments. This is a simpler API than many option
  // parsers that allow you to attach callback actions for every flag. Instead,
  // you're responsible for interpreting the options object.


  _createClass(OptionParser, [{
    key: 'parse',
    value: function parse(args) {
      var options = { arguments: [] };
      var skippingArgument = false;
      var originalArgs = args;
      args = normalizeArguments(args);
      for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (skippingArgument) {
          skippingArgument = false;
          continue;
        }
        if (arg === '--') {
          var pos = originalArgs.indexOf('--');
          options.arguments = options.arguments.concat(originalArgs.slice(pos + 1));
          break;
        }
        var isOption = !!(arg.match(LONG_FLAG) || arg.match(SHORT_FLAG));
        // the CS option parser is a little odd; options after the first
        // non-option argument are treated as non-option arguments themselves
        var seenNonOptionArg = options.arguments.length > 0;
        if (!seenNonOptionArg) {
          var matchedRule = false;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = Array.from(this.rules)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var rule = _step.value;

              if (rule.shortFlag === arg || rule.longFlag === arg) {
                var value = true;
                if (rule.hasArgument) {
                  skippingArgument = true;
                  value = args[i + 1];
                }
                options[rule.name] = rule.isList ? (options[rule.name] || []).concat(value) : value;
                matchedRule = true;
                break;
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

          if (isOption && !matchedRule) {
            throw new Error('unrecognized option: ' + arg);
          }
        }
        if (seenNonOptionArg || !isOption) {
          options.arguments.push(arg);
        }
      }
      return options;
    }

    // Return the help text for this **OptionParser**, listing and describing all
    // of the valid options, for `--help` and such.

  }, {
    key: 'help',
    value: function help() {
      var lines = [];
      if (this.banner) {
        lines.unshift(this.banner + '\n');
      }
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Array.from(this.rules)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var rule = _step2.value;

          var spaces = 15 - rule.longFlag.length;
          spaces = spaces > 0 ? repeat(' ', spaces) : '';
          var letPart = rule.shortFlag ? rule.shortFlag + ', ' : '    ';
          lines.push('  ' + letPart + rule.longFlag + spaces + rule.description);
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

      return '\n' + lines.join('\n') + '\n';
    }
  }]);

  return OptionParser;
}();

// Helpers
// -------

// Regex matchers for option flags.
var LONG_FLAG = /^(--\w[\w\-]*)/;
var SHORT_FLAG = /^(-\w)$/;
var MULTI_FLAG = /^-(\w{2,})/;
var OPTIONAL = /\[(\w+(\*?))\]/;

// Build and return the list of option rules. If the optional *short-flag* is
// unspecified, leave it out by padding with `null`.
var buildRules = function buildRules(rules) {
  return function () {
    var result = [];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = Array.from(rules)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var tuple = _step3.value;

        if (tuple.length < 3) {
          tuple.unshift(null);
        }
        result.push(buildRule.apply(undefined, _toConsumableArray(Array.from(tuple || []))));
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

    return result;
  }();
};

// Build a rule from a `-o` short flag, a `--output [DIR]` long flag, and the
// description of what the option does.
var buildRule = function buildRule(shortFlag, longFlag, description, options) {
  if (options == null) {
    options = {};
  }
  var match = longFlag.match(OPTIONAL);
  longFlag = longFlag.match(LONG_FLAG)[1];
  return {
    name: longFlag.substr(2),
    shortFlag: shortFlag,
    longFlag: longFlag,
    description: description,
    hasArgument: !!(match && match[1]),
    isList: !!(match && match[2])
  };
};

// Normalize arguments by expanding merged flags into multiple flags. This allows
// you to have `-wl` be the same as `--watch --lint`.
var normalizeArguments = function normalizeArguments(args) {
  args = args.slice();
  var result = [];
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = Array.from(args)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var arg = _step4.value;

      var match;
      if (match = arg.match(MULTI_FLAG)) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = Array.from(match[1].split(''))[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var l = _step5.value;
            result.push('-' + l);
          }
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
      } else {
        result.push(arg);
      }
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

  return result;
};