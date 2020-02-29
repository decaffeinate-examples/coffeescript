/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// The `coffee` utility. Handles command-line compilation of CoffeeScript
// into various forms: saved into `.js` files or printed to stdout
// or recompiled every time the source is saved,
// printed as a token stream or as the syntax tree, or launch an
// interactive REPL.

// External dependencies.
const fs             = require('fs');
const path           = require('path');
const helpers        = require('./helpers');
const optparse       = require('./optparse');
const CoffeeScript   = require('./coffee-script');
const {spawn, exec}  = require('child_process');
const {EventEmitter} = require('events');

const useWinPathSep  = path.sep === '\\';

// Allow CoffeeScript to emit Node.js events.
helpers.extend(CoffeeScript, new EventEmitter);

const printLine = line => process.stdout.write(line + '\n');
const printWarn = line => process.stderr.write(line + '\n');

const hidden = file => /^\.|~$/.test(file);

// The help banner that is printed in conjunction with `-h`/`--help`.
const BANNER = `\
Usage: coffee [options] path/to/script.coffee -- [args]

If called without options, \`coffee\` will run your script.\
`;

// The list of all the valid option flags that `coffee` knows how to handle.
const SWITCHES = [
  ['-b', '--bare',            'compile without a top-level function wrapper'],
  ['-c', '--compile',         'compile to JavaScript and save as .js files'],
  ['-e', '--eval',            'pass a string from the command line as input'],
  ['-h', '--help',            'display this help message'],
  ['-i', '--interactive',     'run an interactive CoffeeScript REPL'],
  ['-j', '--join [FILE]',     'concatenate the source CoffeeScript before compiling'],
  ['-m', '--map',             'generate source map and save as .js.map files'],
  ['-M', '--inline-map',      'generate source map and include it directly in output'],
  ['-n', '--nodes',           'print out the parse tree that the parser produces'],
  [      '--nodejs [ARGS]',   'pass options directly to the "node" binary'],
  [      '--no-header',       'suppress the "Generated by" header'],
  ['-o', '--output [DIR]',    'set the output directory for compiled JavaScript'],
  ['-p', '--print',           'print out the compiled JavaScript'],
  ['-r', '--require [MODULE*]', 'require the given module before eval or REPL'],
  ['-s', '--stdio',           'listen for and compile scripts over stdio'],
  ['-l', '--literate',        'treat stdio as literate style coffee-script'],
  ['-t', '--tokens',          'print out the tokens that the lexer/rewriter produce'],
  ['-v', '--version',         'display the version number'],
  ['-w', '--watch',           'watch scripts for changes and rerun commands']
];

// Top-level objects shared by all the functions.
let opts         = {};
const sources      = [];
const sourceCode   = [];
const notSources   = {};
const watchedDirs  = {};
let optionParser = null;

// Run `coffee` by parsing passed options and determining what action to take.
// Many flags cause us to divert before compiling anything. Flags passed after
// `--` will be passed verbatim to your script as arguments in `process.argv`
exports.run = function() {
  parseOptions();
  // Make the REPL *CLI* use the global context so as to (a) be consistent with the
  // `node` REPL CLI and, therefore, (b) make packages that modify native prototypes
  // (such as 'colors' and 'sugar') work as expected.
  const replCliOpts = {useGlobal: true};
  if (opts.require) { opts.prelude = makePrelude(opts.require); }
  replCliOpts.prelude = opts.prelude;
  if (opts.nodejs) { return forkNode(); }
  if (opts.help) { return usage(); }
  if (opts.version) { return version(); }
  if (opts.interactive) { return require('./repl').start(replCliOpts); }
  if (opts.stdio) { return compileStdio(); }
  if (opts.eval) { return compileScript(null, opts.arguments[0]); }
  if (!opts.arguments.length) { return require('./repl').start(replCliOpts); }
  const literals = opts.run ? opts.arguments.splice(1) : [];
  process.argv = process.argv.slice(0, 2).concat(literals);
  process.argv[0] = 'coffee';

  if (opts.output) { opts.output = path.resolve(opts.output); }
  if (opts.join) {
    opts.join = path.resolve(opts.join);
    console.error(`\

The --join option is deprecated and will be removed in a future version.

If for some reason it's necessary to share local variables between files,
replace...

    $ coffee --compile --join bundle.js -- a.coffee b.coffee c.coffee

with...

    $ cat a.coffee b.coffee c.coffee | coffee --compile --stdio > bundle.js
\
`
    );
  }
  return (() => {
    const result = [];
    for (let source of Array.from(opts.arguments)) {
      source = path.resolve(source);
      result.push(compilePath(source, true, source));
    }
    return result;
  })();
};

var makePrelude = requires => requires.map(function(module) {
  let match, name;
  if (match = module.match(/^(.*)=(.*)$/)) { let _;
  [_, name, module] = Array.from(match); }
  if (!name) { name = helpers.baseFileName(module, true, useWinPathSep); }
  return `${name} = require('${module}')`;}).join(';');

// Compile a path, which could be a script or a directory. If a directory
// is passed, recursively compile all '.coffee', '.litcoffee', and '.coffee.md'
// extension source files in it and all subdirectories.
var compilePath = function(source, topLevel, base) {
  let err, stats;
  if (Array.from(sources).includes(source)   ||
            watchedDirs[source] ||
            (!topLevel && (notSources[source] || hidden(source)))) { return; }
  try {
    stats = fs.statSync(source);
  } catch (error) {
    err = error;
    if (err.code === 'ENOENT') {
      console.error(`File not found: ${source}`);
      process.exit(1);
    }
    throw err;
  }
  if (stats.isDirectory()) {
    let files;
    if (path.basename(source) === 'node_modules') {
      notSources[source] = true;
      return;
    }
    if (opts.run) {
      compilePath(findDirectoryIndex(source), topLevel, base);
      return;
    }
    if (opts.watch) { watchDir(source, base); }
    try {
      files = fs.readdirSync(source);
    } catch (error1) {
      err = error1;
      if (err.code === 'ENOENT') { return; } else { throw err; }
    }
    return Array.from(files).map((file) =>
      compilePath((path.join(source, file)), false, base));
  } else if (topLevel || helpers.isCoffee(source)) {
    let code;
    sources.push(source);
    sourceCode.push(null);
    delete notSources[source];
    if (opts.watch) { watch(source, base); }
    try {
      code = fs.readFileSync(source);
    } catch (error2) {
      err = error2;
      if (err.code === 'ENOENT') { return; } else { throw err; }
    }
    return compileScript(source, code.toString(), base);
  } else {
    return notSources[source] = true;
  }
};

var findDirectoryIndex = function(source) {
  for (let ext of Array.from(CoffeeScript.FILE_EXTENSIONS)) {
    const index = path.join(source, `index${ext}`);
    try {
      if ((fs.statSync(index)).isFile()) { return index; }
    } catch (err) {
      if (err.code !== 'ENOENT') { throw err; }
    }
  }
  console.error(`Missing index.coffee or index.litcoffee in ${source}`);
  return process.exit(1);
};

// Compile a single source script, containing the given code, according to the
// requested options. If evaluating the script directly sets `__filename`,
// `__dirname` and `module.filename` to be correct relative to the script's path.
var compileScript = function(file, input, base = null) {
  let task;
  const o = opts;
  const options = compileOptions(file, base);
  try {
    const t = (task = {file, input, options});
    CoffeeScript.emit('compile', task);
    if (o.tokens) {
      return printTokens(CoffeeScript.tokens(t.input, t.options));
    } else if (o.nodes) {
      return printLine(CoffeeScript.nodes(t.input, t.options).toString().trim());
    } else if (o.run) {
      CoffeeScript.register();
      if (opts.prelude) { CoffeeScript.eval(opts.prelude, t.options); }
      return CoffeeScript.run(t.input, t.options);
    } else if (o.join && (t.file !== o.join)) {
      if (helpers.isLiterate(file)) { t.input = helpers.invertLiterate(t.input); }
      sourceCode[sources.indexOf(t.file)] = t.input;
      return compileJoin();
    } else {
      const compiled = CoffeeScript.compile(t.input, t.options);
      t.output = compiled;
      if (o.map) {
        t.output = compiled.js;
        t.sourceMap = compiled.v3SourceMap;
      }

      CoffeeScript.emit('success', task);
      if (o.print) {
        return printLine(t.output.trim());
      } else if (o.compile || o.map) {
        return writeJs(base, t.file, t.output, options.jsPath, t.sourceMap);
      }
    }
  } catch (err) {
    CoffeeScript.emit('failure', err, task);
    if (CoffeeScript.listeners('failure').length) { return; }
    const message = (err != null ? err.stack : undefined) || `${err}`;
    if (o.watch) {
      return printLine(message + '\x07');
    } else {
      printWarn(message);
      return process.exit(1);
    }
  }
};

// Attach the appropriate listeners to compile scripts incoming over **stdin**,
// and write them back to **stdout**.
var compileStdio = function() {
  const buffers = [];
  const stdin = process.openStdin();
  stdin.on('data', function(buffer) {
    if (buffer) { return buffers.push(buffer); }
  });
  return stdin.on('end', () => compileScript(null, Buffer.concat(buffers).toString()));
};

// If all of the source files are done being read, concatenate and compile
// them together.
let joinTimeout = null;
var compileJoin = function() {
  if (!opts.join) { return; }
  if (!sourceCode.some(code => code === null)) {
    clearTimeout(joinTimeout);
    return joinTimeout = wait(100, () => compileScript(opts.join, sourceCode.join('\n'), opts.join));
  }
};

// Watch a source CoffeeScript file using `fs.watch`, recompiling it every
// time the file is updated. May be used in combination with other options,
// such as `--print`.
var watch = function(source, base) {
  let watcher        = null;
  let prevStats      = null;
  let compileTimeout = null;

  const watchErr = function(err) {
    if (err.code !== 'ENOENT') { throw err; }
    if (!Array.from(sources).includes(source)) { return; }
    try {
      rewatch();
      return compile();
    } catch (error1) {
      removeSource(source, base);
      return compileJoin();
    }
  };

  var compile = function() {
    clearTimeout(compileTimeout);
    return compileTimeout = wait(25, () => fs.stat(source, function(err, stats) {
      if (err) { return watchErr(err); }
      if (prevStats &&
                          (stats.size === prevStats.size) &&
                          (stats.mtime.getTime() === prevStats.mtime.getTime())) { return rewatch(); }
      prevStats = stats;
      return fs.readFile(source, function(err, code) {
        if (err) { return watchErr(err); }
        compileScript(source, code.toString(), base);
        return rewatch();
      });
    }));
  };

  const startWatcher = () => watcher = fs.watch(source)
  .on('change', compile)
  .on('error', function(err) {
    if (err.code !== 'EPERM') { throw err; }
    return removeSource(source, base);
  });

  var rewatch = function() {
    if (watcher != null) {
      watcher.close();
    }
    return startWatcher();
  };

  try {
    return startWatcher();
  } catch (error) {
    const err = error;
    return watchErr(err);
  }
};

// Watch a directory of files for new additions.
var watchDir = function(source, base) {
  let watcher        = null;
  let readdirTimeout = null;

  const startWatcher = () => watcher = fs.watch(source)
  .on('error', function(err) {
    if (err.code !== 'EPERM') { throw err; }
    return stopWatcher();
}).on('change', function() {
    clearTimeout(readdirTimeout);
    return readdirTimeout = wait(25, function() {
      let files;
      try {
        files = fs.readdirSync(source);
      } catch (err) {
        if (err.code !== 'ENOENT') { throw err; }
        return stopWatcher();
      }
      return Array.from(files).map((file) =>
        compilePath((path.join(source, file)), false, base));
    });
  });

  var stopWatcher = function() {
    watcher.close();
    return removeSourceDir(source, base);
  };

  watchedDirs[source] = true;
  try {
    return startWatcher();
  } catch (error) {
    const err = error;
    if (err.code !== 'ENOENT') { throw err; }
  }
};

var removeSourceDir = function(source, base) {
  delete watchedDirs[source];
  let sourcesChanged = false;
  for (let file of Array.from(sources)) {
    if (source === path.dirname(file)) {
      removeSource(file, base);
      sourcesChanged = true;
    }
  }
  if (sourcesChanged) { return compileJoin(); }
};

// Remove a file from our source list, and source code cache. Optionally remove
// the compiled JS version as well.
var removeSource = function(source, base) {
  const index = sources.indexOf(source);
  sources.splice(index, 1);
  sourceCode.splice(index, 1);
  if (!opts.join) {
    silentUnlink(outputPath(source, base));
    silentUnlink(outputPath(source, base, '.js.map'));
    return timeLog(`removed ${source}`);
  }
};

var silentUnlink = function(path) {
  try {
    return fs.unlinkSync(path);
  } catch (err) {
    if (!['ENOENT', 'EPERM'].includes(err.code)) { throw err; }
  }
};

// Get the corresponding output JavaScript path for a source file.
var outputPath = function(source, base, extension) {
  let dir;
  if (extension == null) { extension = ".js"; }
  const basename  = helpers.baseFileName(source, true, useWinPathSep);
  const srcDir    = path.dirname(source);
  if (!opts.output) {
    dir = srcDir;
  } else if (source === base) {
    dir = opts.output;
  } else {
    dir = path.join(opts.output, path.relative(base, srcDir));
  }
  return path.join(dir, basename + extension);
};

// Recursively mkdir, like `mkdir -p`.
const mkdirp = function(dir, fn) {
  let mkdirs;
  const mode = 0o777 & ~process.umask();

  return (mkdirs = (p, fn) => fs.exists(p, function(exists) {
    if (exists) {
      return fn();
    } else {
      return mkdirs(path.dirname(p), () => fs.mkdir(p, mode, function(err) {
        if (err) { return fn(err); }
        return fn();
      }));
    }
  }))(dir, fn);
};

// Write out a JavaScript source file with the compiled code. By default, files
// are written out in `cwd` as `.js` files with the same name, but the output
// directory can be customized with `--output`.
//
// If `generatedSourceMap` is provided, this will write a `.js.map` file into the
// same directory as the `.js` file.
var writeJs = function(base, sourcePath, js, jsPath, generatedSourceMap = null) {
  const sourceMapPath = outputPath(sourcePath, base, ".js.map");
  const jsDir  = path.dirname(jsPath);
  const compile = function() {
    if (opts.compile) {
      if (js.length <= 0) { js = ' '; }
      if (generatedSourceMap) { js = `${js}\n//# sourceMappingURL=${helpers.baseFileName(sourceMapPath, false, useWinPathSep)}\n`; }
      fs.writeFile(jsPath, js, function(err) {
        if (err) {
          printLine(err.message);
          return process.exit(1);
        } else if (opts.compile && opts.watch) {
          return timeLog(`compiled ${sourcePath}`);
        }
      });
    }
    if (generatedSourceMap) {
      return fs.writeFile(sourceMapPath, generatedSourceMap, function(err) {
        if (err) {
          printLine(`Could not write source map: ${err.message}`);
          return process.exit(1);
        }
      });
    }
  };
  return fs.exists(jsDir, function(itExists) {
    if (itExists) { return compile(); } else { return mkdirp(jsDir, compile); }
  });
};

// Convenience for cleaner setTimeouts.
var wait = (milliseconds, func) => setTimeout(func, milliseconds);

// When watching scripts, it's useful to log changes with the timestamp.
var timeLog = message => console.log(`${(new Date).toLocaleTimeString()} - ${message}`);

// Pretty-print a stream of tokens, sans location data.
var printTokens = function(tokens) {
  const strings = (() => {
    const result = [];
    for (let token of Array.from(tokens)) {
      const tag = token[0];
      const value = token[1].toString().replace(/\n/, '\\n');
      result.push(`[${tag} ${value}]`);
    }
    return result;
  })();
  return printLine(strings.join(' '));
};

// Use the [OptionParser module](optparse.html) to extract all options from
// `process.argv` that are specified in `SWITCHES`.
var parseOptions = function() {
  optionParser  = new optparse.OptionParser(SWITCHES, BANNER);
  const o = (opts      = optionParser.parse(process.argv.slice(2)));
  if (!o.compile) { o.compile = !!o.output; }
  o.run         = !(o.compile || o.print || o.map);
  return o.print       = !!(o.print || (o.eval || (o.stdio && o.compile)));
};

// The compile-time options to pass to the CoffeeScript compiler.
var compileOptions = function(filename, base) {
  let answer = {
    filename,
    literate: opts.literate || helpers.isLiterate(filename),
    bare: opts.bare,
    header: opts.compile && !opts['no-header'],
    sourceMap: opts.map,
    inlineMap: opts['inline-map']
  };
  if (filename) {
    if (base) {
      const cwd = process.cwd();
      const jsPath = outputPath(filename, base);
      const jsDir = path.dirname(jsPath);
      answer = helpers.merge(answer, {
        jsPath,
        sourceRoot: path.relative(jsDir, cwd),
        sourceFiles: [path.relative(cwd, filename)],
        generatedFile: helpers.baseFileName(jsPath, false, useWinPathSep)
      });
    } else {
      answer = helpers.merge(answer, {
        sourceRoot: "",
        sourceFiles: [helpers.baseFileName(filename, false, useWinPathSep)],
        generatedFile: helpers.baseFileName(filename, true, useWinPathSep) + ".js"
      }
      );
    }
  }
  return answer;
};

// Start up a new Node.js instance with the arguments in `--nodejs` passed to
// the `node` binary, preserving the other options.
var forkNode = function() {
  const nodeArgs = opts.nodejs.split(/\s+/);
  const args     = process.argv.slice(1);
  args.splice(args.indexOf('--nodejs'), 2);
  const p = spawn(process.execPath, nodeArgs.concat(args), {
    cwd:        process.cwd(),
    env:        process.env,
    stdio:      [0, 1, 2]
  });
  return p.on('exit', code => process.exit(code));
};

// Print the `--help` usage message and exit. Deprecated switches are not
// shown.
var usage = () => printLine((new optparse.OptionParser(SWITCHES, BANNER)).help());

// Print the `--version` message and exit.
var version = () => printLine(`CoffeeScript version ${CoffeeScript.VERSION}`);
