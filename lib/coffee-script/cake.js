var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/* eslint-disable
    consistent-return,
    func-names,
    guard-for-in,
    no-console,
    no-param-reassign,
    no-restricted-syntax,
    no-return-assign,
    no-undef,
    no-underscore-dangle,
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
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// `cake` is a simplified version of [Make](http://www.gnu.org/software/make/)
// ([Rake](http://rake.rubyforge.org/), [Jake](https://github.com/280north/jake))
// for CoffeeScript. You define tasks with names and descriptions in a Cakefile,
// and can call them from the command line, or invoke them from other tasks.
//
// Running `cake` with no arguments will print out a list of all the tasks in the
// current directory's Cakefile.

// External dependencies.
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');
var optparse = require('./optparse');
var CoffeeScript = require('./coffee-script');

// Register .coffee extension
CoffeeScript.register();

// Keep track of the list of defined tasks, the accepted options, and so on.
var tasks = {};
var options = {};
var switches = [];
var oparse = null;

// Mixin the top-level Cake functions for Cakefiles to use directly.
helpers.extend(global, {

  // Define a Cake task with a short name, an optional sentence description,
  // and the function to run as the action itself.
  task: function task(name, description, action) {
    if (!action) {
      var _Array$from = Array.from([description, action]);

      var _Array$from2 = _slicedToArray(_Array$from, 2);

      action = _Array$from2[0];
      description = _Array$from2[1];
    }
    return tasks[name] = { name: name, description: description, action: action };
  },


  // Define an option that the Cakefile accepts. The parsed options hash,
  // containing all of the command-line options passed, will be made available
  // as the first argument to the action.
  option: function option(letter, flag, description) {
    return switches.push([letter, flag, description]);
  },


  // Invoke another task in the current Cakefile.
  invoke: function invoke(name) {
    if (!tasks[name]) {
      missingTask(name);
    }
    return tasks[name].action(options);
  }
});

// Run `cake`. Executes all of the tasks you pass, in order. Note that Node's
// asynchrony may cause tasks to execute in a different order than you'd expect.
// If no tasks are passed, print the help screen. Keep a reference to the
// original directory name, when running Cake tasks from subdirectories.
exports.run = function () {
  global.__originalDirname = fs.realpathSync('.');
  process.chdir(cakefileDirectory(__originalDirname));
  var args = process.argv.slice(2);
  CoffeeScript.run(fs.readFileSync('Cakefile').toString(), { filename: 'Cakefile' });
  oparse = new optparse.OptionParser(switches);
  if (!args.length) {
    return printTasks();
  }
  try {
    options = oparse.parse(args);
  } catch (e) {
    return fatalError('' + e);
  }
  return Array.from(options.arguments).map(function (arg) {
    return invoke(arg);
  });
};

// Display the list of Cake tasks in a format similar to `rake -T`
var printTasks = function printTasks() {
  var relative = path.relative || path.resolve;
  var cakefilePath = path.join(relative(__originalDirname, process.cwd()), 'Cakefile');
  console.log(cakefilePath + ' defines the following tasks:\n');
  for (var name in tasks) {
    var task = tasks[name];
    var spaces = 20 - name.length;
    spaces = spaces > 0 ? Array(spaces + 1).join(' ') : '';
    var desc = task.description ? '# ' + task.description : '';
    console.log('cake ' + name + spaces + ' ' + desc);
  }
  if (switches.length) {
    return console.log(oparse.help());
  }
};

// Print an error and exit when attempting to use an invalid task/option.
var fatalError = function fatalError(message) {
  console.error(message + '\n');
  console.log('To see a list of all tasks/options, run "cake"');
  return process.exit(1);
};

var missingTask = function missingTask(task) {
  return fatalError('No such task: ' + task);
};

// When `cake` is invoked, search in the current and all parent directories
// to find the relevant Cakefile.
var cakefileDirectory = function cakefileDirectory(dir) {
  if (fs.existsSync(path.join(dir, 'Cakefile'))) {
    return dir;
  }
  var parent = path.normalize(path.join(dir, '..'));
  if (parent !== dir) {
    return cakefileDirectory(parent);
  }
  throw new Error('Cakefile not found in ' + process.cwd());
};