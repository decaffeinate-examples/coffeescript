var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/* eslint-disable
    consistent-return,
    func-names,
    global-require,
    no-buffer-constructor,
    no-console,
    no-empty,
    no-param-reassign,
    no-return-assign,
    no-underscore-dangle,
    no-unused-vars,
    no-use-before-define,
    no-var,
    prefer-destructuring,
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
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var nodeREPL = require('repl');
var CoffeeScript = require('./coffee-script');

var _require = require('./helpers'),
    merge = _require.merge,
    updateSyntaxError = _require.updateSyntaxError;

var replDefaults = {
  prompt: 'coffee> ',
  historyFile: process.env.HOME ? path.join(process.env.HOME, '.coffee_history') : undefined,
  historyMaxInputSize: 10240,
  eval: function _eval(input, context, filename, cb) {
    // XXX: multiline hack.
    input = input.replace(/\uFF00/g, '\n');
    // Node's REPL sends the input ending with a newline and then wrapped in
    // parens. Unwrap all that.
    input = input.replace(/^\(([\s\S]*)\n\)$/m, '$1');
    // Node's REPL v6.9.1+ sends the input wrapped in a try/catch statement.
    // Unwrap that too.
    input = input.replace(/^\s*try\s*{([\s\S]*)}\s*catch.*$/m, '$1');

    // Require AST nodes to do some AST manipulation.

    var _require2 = require('./nodes'),
        Block = _require2.Block,
        Assign = _require2.Assign,
        Value = _require2.Value,
        Literal = _require2.Literal;

    try {
      // Tokenize the clean input.
      var tokens = CoffeeScript.tokens(input);
      // Collect referenced variable names just like in `CoffeeScript.compile`.
      var referencedVars = Array.from(tokens).filter(function (token) {
        return token[0] === 'IDENTIFIER';
      }).map(function (token) {
        return token[1];
      });
      // Generate the AST of the tokens.
      var ast = CoffeeScript.nodes(tokens);
      // Add assignment to `_` variable to force the input to be an expression.
      ast = new Block([new Assign(new Value(new Literal('__')), ast, '=')]);
      var js = ast.compile({ bare: true, locals: Object.keys(context), referencedVars: referencedVars });
      return cb(null, runInContext(js, context, filename));
    } catch (err) {
      // AST's `compile` does not add source code information to syntax errors.
      updateSyntaxError(err, input);
      return cb(err);
    }
  }
};

var runInContext = function runInContext(js, context, filename) {
  if (context === global) {
    return vm.runInThisContext(js, filename);
  }
  return vm.runInContext(js, context, filename);
};

var addMultilineHandler = function addMultilineHandler(repl) {
  var rli = repl.rli,
      inputStream = repl.inputStream,
      outputStream = repl.outputStream;
  // Node 0.11.12 changed API, prompt is now _prompt.

  var origPrompt = repl._prompt != null ? repl._prompt : repl.prompt;

  var multiline = {
    enabled: false,
    initialPrompt: origPrompt.replace(/^[^> ]*/, function (x) {
      return x.replace(/./g, '-');
    }),
    prompt: origPrompt.replace(/^[^> ]*>?/, function (x) {
      return x.replace(/./g, '.');
    }),
    buffer: ''
  };

  // Proxy node's line listener
  var nodeLineListener = rli.listeners('line')[0];
  rli.removeListener('line', nodeLineListener);
  rli.on('line', function (cmd) {
    if (multiline.enabled) {
      multiline.buffer += cmd + '\n';
      rli.setPrompt(multiline.prompt);
      rli.prompt(true);
    } else {
      rli.setPrompt(origPrompt);
      nodeLineListener(cmd);
    }
  });

  // Handle Ctrl-v
  return inputStream.on('keypress', function (char, key) {
    if (!key || !key.ctrl || !!key.meta || !!key.shift || key.name !== 'v') {
      return;
    }
    if (multiline.enabled) {
      // allow arbitrarily switching between modes any time before multiple lines are entered
      if (!multiline.buffer.match(/\n/)) {
        multiline.enabled = !multiline.enabled;
        rli.setPrompt(origPrompt);
        rli.prompt(true);
        return;
      }
      // no-op unless the current line is empty
      if (rli.line != null && !rli.line.match(/^\s*$/)) {
        return;
      }
      // eval, print, loop
      multiline.enabled = !multiline.enabled;
      rli.line = '';
      rli.cursor = 0;
      rli.output.cursorTo(0);
      rli.output.clearLine(1);
      // XXX: multiline hack
      multiline.buffer = multiline.buffer.replace(/\n/g, '\uFF00');
      rli.emit('line', multiline.buffer);
      multiline.buffer = '';
    } else {
      multiline.enabled = !multiline.enabled;
      rli.setPrompt(multiline.initialPrompt);
      rli.prompt(true);
    }
  });
};

// Store and load command history from a file
var addHistory = function addHistory(repl, filename, maxSize) {
  var lastLine = null;
  try {
    // Get file info and at most maxSize of command history
    var stat = fs.statSync(filename);
    var size = Math.min(maxSize, stat.size);
    // Read last `size` bytes from the file
    var readFd = fs.openSync(filename, 'r');
    var buffer = new Buffer(size);
    fs.readSync(readFd, buffer, 0, size, stat.size - size);
    fs.closeSync(readFd);
    // Set the history on the interpreter
    repl.rli.history = buffer.toString().split('\n').reverse();
    // If the history file was truncated we should pop off a potential partial line
    if (stat.size > maxSize) {
      repl.rli.history.pop();
    }
    // Shift off the final blank newline
    if (repl.rli.history[0] === '') {
      repl.rli.history.shift();
    }
    repl.rli.historyIndex = -1;
    lastLine = repl.rli.history[0];
  } catch (error) {}

  var fd = fs.openSync(filename, 'a');

  repl.rli.addListener('line', function (code) {
    if (code && code.length && code !== '.history' && code !== '.exit' && lastLine !== code) {
      // Save the latest command in the file
      fs.writeSync(fd, code + '\n');
      return lastLine = code;
    }
  });

  repl.on('exit', function () {
    return fs.closeSync(fd);
  });

  // Add a command to show the history stack
  return repl.commands[getCommandId(repl, 'history')] = {
    help: 'Show command history',
    action: function action() {
      repl.outputStream.write(repl.rli.history.slice().reverse().join('\n') + '\n');
      return repl.displayPrompt();
    }
  };
};

var getCommandId = function getCommandId(repl, commandName) {
  // Node 0.11 changed API, a command such as '.help' is now stored as 'help'
  var commandsHaveLeadingDot = repl.commands['.help'] != null;
  if (commandsHaveLeadingDot) {
    return '.' + commandName;
  }return commandName;
};

module.exports = {
  start: function start(opts) {
    if (opts == null) {
      opts = {};
    }

    var _Array$from = Array.from(process.versions.node.split('.').map(function (n) {
      return parseInt(n, 10);
    })),
        _Array$from2 = _slicedToArray(_Array$from, 3),
        major = _Array$from2[0],
        minor = _Array$from2[1],
        build = _Array$from2[2];

    if (major === 0 && minor < 8) {
      console.warn('Node 0.8.0+ required for CoffeeScript REPL');
      process.exit(1);
    }

    CoffeeScript.register();
    process.argv = ['coffee'].concat(process.argv.slice(2));
    opts = merge(replDefaults, opts);
    var repl = nodeREPL.start(opts);
    if (opts.prelude) {
      runInContext(opts.prelude, repl.context, 'prelude');
    }
    repl.on('exit', function () {
      if (!repl.rli.closed) {
        return repl.outputStream.write('\n');
      }
    });
    addMultilineHandler(repl);
    if (opts.historyFile) {
      addHistory(repl, opts.historyFile, opts.historyMaxInputSize);
    }
    // Adapt help inherited from the node REPL
    repl.commands[getCommandId(repl, 'load')].help = 'Load code from a file into this REPL session';
    return repl;
  }
};