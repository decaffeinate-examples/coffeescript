// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * DS209: Avoid top-level return
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
if (global.testingBrowser) { return; }

const os = require('os');
const fs = require('fs');
const path = require('path');

// REPL
// ----
const Stream = require('stream');

class MockInputStream extends Stream {
  constructor() {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.readable = true;
  }

  resume() {}

  emitLine(val) {
    return this.emit('data', new Buffer(`${val}\n`));
  }
}

class MockOutputStream extends Stream {
  constructor() {
    {
      // Hack: trick Babel/TypeScript into allowing this before super.
      if (false) { super(); }
      let thisFn = (() => { return this; }).toString();
      let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
      eval(`${thisName} = this;`);
    }
    this.writable = true;
    this.written = [];
  }

  write(data) {
    //console.log 'output write', arguments
    return this.written.push(data);
  }

  lastWrite(fromEnd) {
    if (fromEnd == null) { fromEnd = -1; }
    return this.written[(this.written.length - 1) + fromEnd].replace(/\r?\n$/, '');
  }
}

// Create a dummy history file
const historyFile = path.join(os.tmpdir(), '.coffee_history_test');
fs.writeFileSync(historyFile, '1 + 2\n');

const testRepl = function(desc, fn) {
  const input = new MockInputStream;
  const output = new MockOutputStream;
  const repl = Repl.start({input, output, historyFile});
  return test(desc, () => fn(input, output, repl));
};

const ctrlV = { ctrl: true, name: 'v'};


testRepl('reads history file', function(input, output, repl) {
  input.emitLine(repl.rli.history[0]);
  return eq('3', output.lastWrite());
});

testRepl("starts with coffee prompt", (input, output) => eq('coffee> ', output.lastWrite(0)));

testRepl("writes eval to output", function(input, output) {
  input.emitLine('1+1');
  return eq('2', output.lastWrite());
});

testRepl("comments are ignored", function(input, output) {
  input.emitLine('1 + 1 #foo');
  return eq('2', output.lastWrite());
});

testRepl("output in inspect mode", function(input, output) {
  input.emitLine('"1 + 1\\n"');
  return eq("'1 + 1\\n'", output.lastWrite());
});

testRepl("variables are saved", function(input, output) {
  input.emitLine("foo = 'foo'");
  input.emitLine('foobar = "#{foo}bar"');
  return eq("'foobar'", output.lastWrite());
});

testRepl("empty command evaluates to undefined", function(input, output) {
  // A regression fixed in Node 5.11.0 broke the handling of pressing enter in
  // the Node REPL; see https://github.com/nodejs/node/pull/6090 and
  // https://github.com/jashkenas/coffeescript/issues/4502.
  // Just skip this test for versions of Node < 6.
  if (parseInt(process.versions.node.split('.')[0], 10) < 6) { return; }
  input.emitLine('');
  return eq('undefined', output.lastWrite());
});

testRepl("ctrl-v toggles multiline prompt", function(input, output) {
  input.emit('keypress', null, ctrlV);
  eq('------> ', output.lastWrite(0));
  input.emit('keypress', null, ctrlV);
  return eq('coffee> ', output.lastWrite(0));
});

testRepl("multiline continuation changes prompt", function(input, output) {
  input.emit('keypress', null, ctrlV);
  input.emitLine('');
  return eq('....... ', output.lastWrite(0));
});

testRepl("evaluates multiline", function(input, output) {
  // Stubs. Could assert on their use.
  output.cursorTo = function(pos) {};
  output.clearLine = function() {};

  input.emit('keypress', null, ctrlV);
  input.emitLine('do ->');
  input.emitLine('  1 + 1');
  input.emit('keypress', null, ctrlV);
  return eq('2', output.lastWrite());
});

testRepl("variables in scope are preserved", function(input, output) {
  input.emitLine('a = 1');
  input.emitLine('do -> a = 2');
  input.emitLine('a');
  return eq('2', output.lastWrite());
});

testRepl("existential assignment of previously declared variable", function(input, output) {
  input.emitLine('a = null');
  input.emitLine('a ?= 42');
  return eq('42', output.lastWrite());
});

testRepl("keeps running after runtime error", function(input, output) {
  input.emitLine('a = b');
  input.emitLine('a');
  return eq('undefined', output.lastWrite());
});

process.on('exit', function() {
  try {
    return fs.unlinkSync(historyFile);
  } catch (exception) {}
}); // Already deleted, nothing else to do.
