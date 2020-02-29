/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let green, red, reset;
const fs                        = require('fs');
const path                      = require('path');
const _                         = require('underscore');
const { spawn, exec, execSync } = require('child_process');
const CoffeeScript              = require('./lib/coffee-script');
const helpers                   = require('./lib/coffee-script/helpers');

// ANSI Terminal Colors.
let bold = (red = (green = (reset = '')));
if (!process.env.NODE_DISABLE_COLORS) {
  bold  = '\x1B[0;1m';
  red   = '\x1B[0;31m';
  green = '\x1B[0;32m';
  reset = '\x1B[0m';
}

// Built file header.
const header = `\
/**
 * CoffeeScript Compiler v${CoffeeScript.VERSION}
 * http://coffeescript.org
 *
 * Copyright 2011, Jeremy Ashkenas
 * Released under the MIT License
 */\
`;

// Used in folder names like `docs/v1`.
const majorVersion = parseInt(CoffeeScript.VERSION.split('.')[0], 10);


// Log a message with a color.
const log = (message, color, explanation) => console.log(color + message + reset + ' ' + (explanation || ''));


const spawnNodeProcess = function(args, output, callback) {
  if (output == null) { output = 'stderr'; }
  const relayOutput = buffer => console.log(buffer.toString());
  const proc =         spawn('node', args);
  if ((output === 'both') || (output === 'stdout')) { proc.stdout.on('data', relayOutput); }
  if ((output === 'both') || (output === 'stderr')) { proc.stderr.on('data', relayOutput); }
  return proc.on('exit', function(status) { if (typeof callback === 'function') { return callback(status); } });
};

// Run a CoffeeScript through our node/coffee interpreter.
const run = (args, callback) => spawnNodeProcess(['bin/coffee'].concat(args), 'stderr', function(status) {
  if (status !== 0) { process.exit(1); }
  if (typeof callback === 'function') { return callback(); }
});


// Build the CoffeeScript language from source.
const buildParser = function() {
  helpers.extend(global, require('util'));
  require('jison');
  let parser = require('./lib/coffee-script/grammar').parser.generate();
  // Patch Jison’s output, until https://github.com/zaach/jison/pull/339 is accepted,
  // to ensure that require('fs') is only called where it exists.
  parser = parser.replace("var source = require('fs')", `\
var source = '';
    var fs = require('fs');
    if (typeof fs !== 'undefined' && fs !== null)
        source = fs`
  );
  return fs.writeFileSync('lib/coffee-script/parser.js', parser);
};

const buildExceptParser = function(callback) {
  let files = fs.readdirSync('src');
  files = ((() => {
    const result = [];
    for (let file of Array.from(files)) {       if (file.match(/\.(lit)?coffee$/)) {
        result.push('src/' + file);
      }
    }
    return result;
  })());
  return run(['-c', '-o', 'lib/coffee-script'].concat(files), callback);
};

const build = function(callback) {
  buildParser();
  return buildExceptParser(callback);
};

const testBuiltCode = function(watch) {
  if (watch == null) { watch = false; }
  const csPath = './lib/coffee-script';
  const csDir  = path.dirname(require.resolve(csPath));

  for (let mod in require.cache) {
    if (csDir === mod.slice(0 ,  csDir.length)) {
      delete require.cache[mod];
    }
  }

  const testResults = runTests(require(csPath));
  if (!watch) {
    if (!testResults) { return process.exit(1); }
  }
};

const buildAndTest = function(includingParser, harmony) {
  if (includingParser == null) { includingParser = true; }
  if (harmony == null) { harmony = false; }
  process.stdout.write('\x1Bc'); // Clear terminal screen.
  execSync('git checkout lib/*', {stdio: [0,1,2]}); // Reset the generated compiler.

  const buildArgs = ['bin/cake'];
  buildArgs.push(includingParser ? 'build' : 'build:except-parser');
  log(`building${includingParser ? ', including parser' : ''}...`, green);
  return spawnNodeProcess(buildArgs, 'both', function() {
    log('testing...', green);
    let testArgs = harmony ? ['--harmony'] : [];
    testArgs = testArgs.concat(['bin/cake', 'test']);
    return spawnNodeProcess(testArgs, 'both');
  });
};

const watchAndBuildAndTest = function(harmony) {
  if (harmony == null) { harmony = false; }
  buildAndTest(true, harmony);
  fs.watch('src/', {interval: 200}, function(eventType, filename) {
    if (eventType === 'change') {
      log(`src/${filename} changed, rebuilding...`);
      return buildAndTest((filename === 'grammar.coffee'), harmony);
    }
  });
  return fs.watch('test/', {interval: 200, recursive: true}, function(eventType, filename) {
    if (eventType === 'change') {
      log(`test/${filename} changed, rebuilding...`);
      return buildAndTest(false, harmony);
    }
  });
};


task('build', 'build the CoffeeScript compiler from source', build);

task('build:parser', 'build the Jison parser only', buildParser);

task('build:except-parser', 'build the CoffeeScript compiler, except for the Jison parser', buildExceptParser);

task('build:full', 'build the CoffeeScript compiler from source twice, and run the tests', () => build(() => build(testBuiltCode)));

task('build:browser', 'merge the built scripts into a single file for use in a browser', function() {
  let code = `\
require['../../package.json'] = (function() {
  return ${fs.readFileSync("./package.json")};
})();\
`;
  for (let name of ['helpers', 'rewriter', 'lexer', 'parser', 'scope', 'nodes', 'sourcemap', 'coffee-script', 'browser']) {
    code += `\
require['./${name}'] = (function() {
  var exports = {}, module = {exports: exports};
  ${fs.readFileSync(`lib/coffee-script/${name}.js`)}
  return module.exports;
})();\
`;
  }
  code = `\
(function(root) {
  var CoffeeScript = function() {
    function require(path){ return require[path]; }
    ${code}
    return require['./coffee-script'];
  }();

  if (typeof define === 'function' && define.amd) {
    define(function() { return CoffeeScript; });
  } else {
    root.CoffeeScript = CoffeeScript;
  }
}(this));\
`;
  if (process.env.MINIFY !== 'false') {
    ({compiledCode: code} = require('google-closure-compiler-js').compile({
      jsCode: [{
        src: code,
        languageOut: majorVersion === 1 ? 'ES5' : 'ES6'
      }
      ]}));
  }
  const outputFolder = `docs/v${majorVersion}/browser-compiler`;
  if (!fs.existsSync(outputFolder)) { fs.mkdirSync(outputFolder); }
  return fs.writeFileSync(`${outputFolder}/coffee-script.js`, header + '\n' + code);
});

task('build:browser:full', 'merge the built scripts into a single file for use in a browser, and test it', function() {
  invoke('build:browser');
  console.log("built ... running browser tests:");
  return invoke('test:browser');
});

task('build:watch', 'watch and continually rebuild the CoffeeScript compiler, running tests on each build', () => watchAndBuildAndTest());

task('build:watch:harmony', 'watch and continually rebuild the CoffeeScript compiler, running harmony tests on each build', () => watchAndBuildAndTest(true));


const buildDocs = function(watch) {
  // Constants
  let renderIndex;
  if (watch == null) { watch = false; }
  const indexFile = 'documentation/index.html';
  const versionedSourceFolder = `documentation/v${majorVersion}`;
  const sectionsSourceFolder = 'documentation/sections';
  const examplesSourceFolder = 'documentation/examples';
  const outputFolder = `docs/v${majorVersion}`;

  // Helpers
  const releaseHeader = function(date, version, prevVersion) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const formatDate = date => date.replace(/^(\d\d\d\d)-(\d\d)-(\d\d)$/, (match, $1, $2, $3) => `${monthNames[$2 - 1]} ${+$3}, ${$1}`);

    return `\
<div class="anchor" id="${version}"></div>
<h2 class="header">
  ${(prevVersion && `<a href=\"https://github.com/jashkenas/coffeescript/compare/${prevVersion}...${version}\">${version}</a>`) || version}
  <span class="timestamp"> &mdash; <time datetime="${date}">${formatDate(date)}</time></span>
</h2>\
`;
  };

  const codeFor = require(`./documentation/v${majorVersion}/code.coffee`);

  const htmlFor = function() {
    const markdownRenderer = require('markdown-it')({
      html: true,
      typographer: true
    });

    // Add some custom overrides to Markdown-It’s rendering, per
    // https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
    const defaultFence = markdownRenderer.renderer.rules.fence;
    markdownRenderer.renderer.rules.fence = function(tokens, idx, options, env, slf) {
      const code = tokens[idx].content;
      if ((code.indexOf('codeFor(') === 0) || (code.indexOf('releaseHeader(') === 0)) {
        return `<%= ${code} %>`;
      } else {
        return `<blockquote class=\"uneditable-code-block\">${defaultFence.apply(this, arguments)}</blockquote>`;
      }
    };

    return function(file, bookmark) {
      let md = fs.readFileSync(`${sectionsSourceFolder}/${file}.md`, 'utf-8');
      md = md.replace(/<%= releaseHeader %>/g, releaseHeader);
      md = md.replace(/<%= majorVersion %>/g, majorVersion);
      md = md.replace(/<%= fullVersion %>/g, CoffeeScript.VERSION);
      let html = markdownRenderer.render(md);
      return html = _.template(html)({
        codeFor: codeFor(),
        releaseHeader
      });
    };
  };

  var include = () => (function(file) {
    if (file.indexOf('/') === -1) { file = `${versionedSourceFolder}/${file}`; }
    let output = fs.readFileSync(file, 'utf-8');
    if (/\.html$/.test(file)) {
      const render = _.template(output);
      output = render({
        releaseHeader,
        majorVersion,
        fullVersion: CoffeeScript.VERSION,
        htmlFor: htmlFor(),
        codeFor: codeFor(),
        include: include()
      });
    }
    return output;
  });

  // Task
  (renderIndex = function() {
    const render = _.template(fs.readFileSync(indexFile, 'utf-8'));
    const output = render({
      include: include()});
    fs.writeFileSync(`${outputFolder}/index.html`, output);
    return log('compiled', green, `${indexFile} → ${outputFolder}/index.html`);
  })();
  try {
    fs.symlinkSync(`v${majorVersion}/index.html`, 'docs/index.html');
  } catch (exception) {}

  if (watch) {
    for (let target of [indexFile, versionedSourceFolder, examplesSourceFolder, sectionsSourceFolder]) {
      fs.watch(target, {interval: 200}, renderIndex);
    }
    return log('watching...', green);
  }
};

task('doc:site', 'build the documentation for the website', () => buildDocs());

task('doc:site:watch', 'watch and continually rebuild the documentation for the website', () => buildDocs(true));


const buildDocTests = function(watch) {
  // Constants
  let renderTest;
  if (watch == null) { watch = false; }
  const testFile = 'documentation/test.html';
  const testsSourceFolder = 'test';
  const outputFolder = `docs/v${majorVersion}`;

  // Included in test.html
  const testHelpers = fs.readFileSync('test/support/helpers.coffee', 'utf-8').replace(/exports\./g, '@');

  // Helpers
  const testsInScriptBlocks = function() {
    let output = '';
    for (let filename of Array.from(fs.readdirSync(testsSourceFolder))) {
      var type;
      if (filename.indexOf('.coffee') !== -1) {
        type = 'coffeescript';
      } else if (filename.indexOf('.litcoffee') !== -1) {
        type = 'literate-coffeescript';
      } else {
        continue;
      }

      // Set the type to text/x-coffeescript or text/x-literate-coffeescript
      // to prevent the browser compiler from automatically running the script
      output += `\
<script type="text/x-${type}" class="test" id="${filename.split('.')[0]}">
${fs.readFileSync(`test/${filename}`, 'utf-8')}
</script>\n\
`;
    }
    return output;
  };

  // Task
  (renderTest = function() {
    const render = _.template(fs.readFileSync(testFile, 'utf-8'));
    const output = render({
      testHelpers,
      tests: testsInScriptBlocks()
    });
    fs.writeFileSync(`${outputFolder}/test.html`, output);
    return log('compiled', green, `${testFile} → ${outputFolder}/test.html`);
  })();

  if (watch) {
    for (let target of [testFile, testsSourceFolder]) {
      fs.watch(target, {interval: 200}, renderTest);
    }
    return log('watching...', green);
  }
};

task('doc:test', 'build the browser-based tests', () => buildDocTests());

task('doc:test:watch', 'watch and continually rebuild the browser-based tests', () => buildDocTests(true));


const buildAnnotatedSource = function(watch) {
  let generateAnnotatedSource;
  if (watch == null) { watch = false; }
  (generateAnnotatedSource = function() {
    exec(`node_modules/docco/bin/docco src/*.*coffee --output docs/v${majorVersion}/annotated-source`, function(err) { if (err) { throw err; } });
    return log('generated', green, `annotated source in docs/v${majorVersion}/annotated-source/`);
  })();

  if (watch) {
    fs.watch('src/', {interval: 200}, generateAnnotatedSource);
    return log('watching...', green);
  }
};

task('doc:source', 'build the annotated source documentation', () => buildAnnotatedSource());

task('doc:source:watch', 'watch and continually rebuild the annotated source documentation', () => buildAnnotatedSource(true));


task('release', 'build and test the CoffeeScript source, and build the documentation', function() {
  invoke('build:full');
  invoke('build:browser:full');
  invoke('doc:site');
  invoke('doc:test');
  return invoke('doc:source');
});

task('bench', 'quick benchmark of compilation time', function() {
  const {Rewriter} = require('./lib/coffee-script/rewriter');
  const sources = ['coffee-script', 'grammar', 'helpers', 'lexer', 'nodes', 'rewriter'];
  const coffee  = sources.map(name => fs.readFileSync(`src/${name}.coffee`)).join('\n');
  const litcoffee = fs.readFileSync("src/scope.litcoffee").toString();
  const fmt    = ms => ` ${bold}${ `   ${ms}`.slice(-4) }${reset} ms`;
  let total  = 0;
  let now    = Date.now();
  const time   = function() { let ms;
  total += (ms = -(now - (now = Date.now()))); return fmt(ms); };
  let tokens = CoffeeScript.tokens(coffee, {rewrite: false});
  const littokens = CoffeeScript.tokens(litcoffee, {rewrite: false, literate: true});
  tokens = tokens.concat(littokens);
  console.log(`Lex    ${time()} (${tokens.length} tokens)`);
  tokens = new Rewriter().rewrite(tokens);
  console.log(`Rewrite${time()} (${tokens.length} tokens)`);
  const nodes  = CoffeeScript.nodes(tokens);
  console.log(`Parse  ${time()}`);
  const js     = nodes.compile({bare: true});
  console.log(`Compile${time()} (${js.length} chars)`);
  return console.log(`total  ${ fmt(total) }`);
});


// Run the CoffeeScript test suite.
var runTests = function(CoffeeScript) {
  CoffeeScript.register();
  const startTime   = Date.now();
  let currentFile = null;
  let passedTests = 0;
  const failures    = [];

  const object = require('assert');
  for (let name in object) { const func = object[name]; global[name] = func; }

  // Convenience aliases.
  global.CoffeeScript = CoffeeScript;
  global.Repl = require('./lib/coffee-script/repl');

  // Our test helper function for delimiting different test cases.
  global.test = function(description, fn) {
    try {
      fn.test = {description, currentFile};
      fn.call(fn);
      return ++passedTests;
    } catch (e) {
      return failures.push({
        filename: currentFile,
        error: e,
        description: ((description != null) ? description : undefined),
        source: ((fn.toString != null) ? fn.toString() : undefined)
      });
    }
  };

  helpers.extend(global, require('./test/support/helpers'));

  // When all the tests have run, collect and print errors.
  // If a stacktrace is available, output the compiled function source.
  process.on('exit', function() {
    const time = ((Date.now() - startTime) / 1000).toFixed(2);
    const message = `passed ${passedTests} tests in ${time} seconds${reset}`;
    if (!failures.length) { return log(message, green); }
    log(`failed ${failures.length} and ${message}`, red);
    for (let fail of Array.from(failures)) {
      const {error, filename, description, source}  = fail;
      console.log('');
      if (description) { log(`  ${description}`, red); }
      log(`  ${error.stack}`, red);
      if (source) { console.log(`  ${source}`); }
    }
  });

  // Run every test in the `test` folder, recording failures.
  const files = fs.readdirSync('test');

  for (let file of Array.from(files)) {
    if (helpers.isCoffee(file)) {var filename;
    
      const literate = helpers.isLiterate(file);
      currentFile = (filename = path.join('test', file));
      const code = fs.readFileSync(filename);
      try {
        CoffeeScript.run(code.toString(), {filename, literate});
      } catch (error1) {
        const error = error1;
        failures.push({filename, error});
      }
    }
  }
  return !failures.length;
};


task('test', 'run the CoffeeScript language test suite', function() {
  const testResults = runTests(CoffeeScript);
  if (!testResults) { return process.exit(1); }
});


task('test:browser', 'run the test suite against the merged browser script', function() {
  const source = fs.readFileSync(`docs/v${majorVersion}/browser-compiler/coffee-script.js`, 'utf-8');
  const result = {};
  global.testingBrowser = true;
  ((() => eval(source))).call(result);
  const testResults = runTests(result.CoffeeScript);
  if (!testResults) { return process.exit(1); }
});
