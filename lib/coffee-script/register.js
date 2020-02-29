/* eslint-disable
    camelcase,
    func-names,
    global-require,
    no-param-reassign,
    no-restricted-syntax,
    no-return-assign,
    no-shadow,
    no-underscore-dangle,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var child_process = require('child_process');
var path = require('path');
var CoffeeScript = require('./coffee-script');
var helpers = require('./helpers');

// Load and run a CoffeeScript file for Node, stripping any `BOM`s.
var loadFile = function loadFile(module, filename) {
  var answer = CoffeeScript._compileFile(filename, false, true);
  return module._compile(answer, filename);
};

// If the installed version of Node supports `require.extensions`, register
// CoffeeScript as an extension.
if (require.extensions) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Array.from(CoffeeScript.FILE_EXTENSIONS)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var ext = _step.value;

      require.extensions[ext] = loadFile;
    }

    // Patch Node's module loader to be able to handle multi-dot extensions.
    // This is a horrible thing that should not be required.
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

  var Module = require('module');

  var findExtension = function findExtension(filename) {
    var extensions = path.basename(filename).split('.');
    // Remove the initial dot from dotfiles.
    if (extensions[0] === '') {
      extensions.shift();
    }
    // Start with the longest possible extension and work our way shortwards.
    while (extensions.shift()) {
      var curExtension = '.' + extensions.join('.');
      if (Module._extensions[curExtension]) {
        return curExtension;
      }
    }
    return '.js';
  };

  Module.prototype.load = function (filename) {
    this.filename = filename;
    this.paths = Module._nodeModulePaths(path.dirname(filename));
    var extension = findExtension(filename);
    Module._extensions[extension](this, filename);
    return this.loaded = true;
  };
}

// If we're on Node, patch `child_process.fork` so that Coffee scripts are able
// to fork both CoffeeScript files, and JavaScript files, directly.
if (child_process) {
  var fork = child_process.fork;

  var binary = require.resolve('../../bin/coffee');
  child_process.fork = function (path, args, options) {
    if (helpers.isCoffee(path)) {
      if (!Array.isArray(args)) {
        options = args || {};
        args = [];
      }
      args = [path].concat(args);
      path = binary;
    }
    return fork(path, args, options);
  };
}