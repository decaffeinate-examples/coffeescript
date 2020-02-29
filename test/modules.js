/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Modules, a.k.a. ES2015 import/export
// ------------------------------------
//
// Remember, we’re not *resolving* modules, just outputting valid ES2015 syntax.


// This is the CoffeeScript import and export syntax, closely modeled after the ES2015 syntax
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export

// import "module-name"
// import defaultMember from "module-name"
// import * as name from "module-name"
// import { } from "module-name"
// import { member } from "module-name"
// import { member as alias } from "module-name"
// import { member1, member2 as alias2, … } from "module-name"
// import defaultMember, * as name from "module-name"
// import defaultMember, { … } from "module-name"

// export default expression
// export class name
// export { }
// export { name }
// export { name as exportedName }
// export { name as default }
// export { name1, name2 as exportedName2, name3 as default, … }
//
// export * from "module-name"
// export { … } from "module-name"
//
// As a subsitute for `export var name = …` and `export function name {}`,
// CoffeeScript also supports:
// export name = …

// CoffeeScript also supports optional commas within `{ … }`.


// Import statements

test('backticked import statement', () => {
  const input = `\
if Meteor.isServer
  \`import { foo, bar as baz } from 'lib'\``;
  const output = `\
if (Meteor.isServer) {
  import { foo, bar as baz } from 'lib';
}`;
  return eq(toJS(input), output);
});

test('import an entire module for side effects only, without importing any bindings', () => {
  const input = "import 'lib'";
  const output = "import 'lib';";
  return eq(toJS(input), output);
});

test('import default member from module, adding the member to the current scope', () => {
  const input = `\
import foo from 'lib'
foo.fooMethod()`;
  const output = `\
import foo from 'lib';

foo.fooMethod();`;
  return eq(toJS(input), output);
});

test("import an entire module's contents as an alias, adding the alias to the current scope", () => {
  const input = `\
import * as foo from 'lib'
foo.fooMethod()`;
  const output = `\
import * as foo from 'lib';

foo.fooMethod();`;
  return eq(toJS(input), output);
});

test('import empty object', () => {
  const input = "import { } from 'lib'";
  const output = "import {} from 'lib';";
  return eq(toJS(input), output);
});

test('import empty object', () => {
  const input = "import {} from 'lib'";
  const output = "import {} from 'lib';";
  return eq(toJS(input), output);
});

test('import a single member of a module, adding the member to the current scope', () => {
  const input = `\
import { foo } from 'lib'
foo.fooMethod()`;
  const output = `\
import {
  foo
} from 'lib';

foo.fooMethod();`;
  return eq(toJS(input), output);
});

test('import a single member of a module as an alias, adding the alias to the current scope', () => {
  const input = `\
import { foo as bar } from 'lib'
bar.barMethod()`;
  const output = `\
import {
  foo as bar
} from 'lib';

bar.barMethod();`;
  return eq(toJS(input), output);
});

test('import multiple members of a module, adding the members to the current scope', () => {
  const input = `\
import { foo, bar } from 'lib'
foo.fooMethod()
bar.barMethod()`;
  const output = `\
import {
  foo,
  bar
} from 'lib';

foo.fooMethod();

bar.barMethod();`;
  return eq(toJS(input), output);
});

test('import multiple members of a module where some are aliased, adding the members or aliases to the current scope', () => {
  const input = `\
import { foo, bar as baz } from 'lib'
foo.fooMethod()
baz.bazMethod()`;
  const output = `\
import {
  foo,
  bar as baz
} from 'lib';

foo.fooMethod();

baz.bazMethod();`;
  return eq(toJS(input), output);
});

test('import default member and other members of a module, adding the members to the current scope', () => {
  const input = `\
import foo, { bar, baz as qux } from 'lib'
foo.fooMethod()
bar.barMethod()
qux.quxMethod()`;
  const output = `\
import foo, {
  bar,
  baz as qux
} from 'lib';

foo.fooMethod();

bar.barMethod();

qux.quxMethod();`;
  return eq(toJS(input), output);
});

test("import default member from a module as well as the entire module's contents as an alias, adding the member and alias to the current scope", () => {
  const input = `\
import foo, * as bar from 'lib'
foo.fooMethod()
bar.barMethod()`;
  const output = `\
import foo, * as bar from 'lib';

foo.fooMethod();

bar.barMethod();`;
  return eq(toJS(input), output);
});

test('multiline simple import', () => {
  const input = `\
import {
  foo,
  bar as baz
} from 'lib'`;
  const output = `\
import {
  foo,
  bar as baz
} from 'lib';`;
  return eq(toJS(input), output);
});

test('multiline complex import', () => {
  const input = `\
import foo, {
  bar,
  baz as qux
} from 'lib'`;
  const output = `\
import foo, {
  bar,
  baz as qux
} from 'lib';`;
  return eq(toJS(input), output);
});

test('import with optional commas', () => {
  const input = "import { foo, bar, } from 'lib'";
  const output = `\
import {
  foo,
  bar
} from 'lib';`;
  return eq(toJS(input), output);
});

test('multiline import without commas', () => {
  const input = `\
import {
  foo
  bar
} from 'lib'`;
  const output = `\
import {
  foo,
  bar
} from 'lib';`;
  return eq(toJS(input), output);
});

test('multiline import with optional commas', () => {
  const input = `\
import {
  foo,
  bar,
} from 'lib'`;
  const output = `\
import {
  foo,
  bar
} from 'lib';`;
  return eq(toJS(input), output);
});

test('a variable can be assigned after an import', () => {
  const input = `\
import { foo } from 'lib'
bar = 5`;
  const output = `\
var bar;

import {
  foo
} from 'lib';

bar = 5;`;
  return eq(toJS(input), output);
});

test('variables can be assigned before and after an import', () => {
  const input = `\
foo = 5
import { bar } from 'lib'
baz = 7`;
  const output = `\
var baz, foo;

foo = 5;

import {
  bar
} from 'lib';

baz = 7;`;
  return eq(toJS(input), output);
});

// Export statements

test('export empty object', () => {
  const input = 'export { }';
  const output = 'export {};';
  return eq(toJS(input), output);
});

test('export empty object', () => {
  const input = 'export {}';
  const output = 'export {};';
  return eq(toJS(input), output);
});

test('export named members within an object', () => {
  const input = 'export { foo, bar }';
  const output = `\
export {
  foo,
  bar
};`;
  return eq(toJS(input), output);
});

test('export named members as aliases, within an object', () => {
  const input = 'export { foo as bar, baz as qux }';
  const output = `\
export {
  foo as bar,
  baz as qux
};`;
  return eq(toJS(input), output);
});

test('export named members within an object, with an optional comma', () => {
  const input = 'export { foo, bar, }';
  const output = `\
export {
  foo,
  bar
};`;
  return eq(toJS(input), output);
});

test('multiline export named members within an object', () => {
  const input = `\
export {
  foo,
  bar
}`;
  const output = `\
export {
  foo,
  bar
};`;
  return eq(toJS(input), output);
});

test('multiline export named members within an object, with an optional comma', () => {
  const input = `\
export {
  foo,
  bar,
}`;
  const output = `\
export {
  foo,
  bar
};`;
  return eq(toJS(input), output);
});

test('export default string', () => {
  const input = "export default 'foo'";
  const output = "export default 'foo';";
  return eq(toJS(input), output);
});

test('export default number', () => {
  const input = 'export default 5';
  const output = 'export default 5;';
  return eq(toJS(input), output);
});

test('export default object', () => {
  const input = "export default { foo: 'bar', baz: 'qux' }";
  const output = `\
export default {
  foo: 'bar',
  baz: 'qux'
};`;
  return eq(toJS(input), output);
});

test('export default implicit object', () => {
  const input = "export default foo: 'bar', baz: 'qux'";
  const output = `\
export default {
  foo: 'bar',
  baz: 'qux'
};`;
  return eq(toJS(input), output);
});

test('export default multiline implicit object', () => {
  const input = `\
export default
  foo: 'bar',
  baz: 'qux'\
`;
  const output = `\
export default {
  foo: 'bar',
  baz: 'qux'
};`;
  return eq(toJS(input), output);
});

test('export default assignment expression', () => {
  const input = "export default foo = 'bar'";
  const output = `\
var foo;

export default foo = 'bar';`;
  return eq(toJS(input), output);
});

test('export assignment expression', () => {
  const input = "export foo = 'bar'";
  const output = "export var foo = 'bar';";
  return eq(toJS(input), output);
});

test('export multiline assignment expression', () => {
  const input = `\
export foo =
'bar'`;
  const output = "export var foo = 'bar';";
  return eq(toJS(input), output);
});

test('export multiline indented assignment expression', () => {
  const input = `\
export foo =
  'bar'`;
  const output = "export var foo = 'bar';";
  return eq(toJS(input), output);
});

test('export default function', () => {
  const input = 'export default ->';
  const output = 'export default function() {};';
  return eq(toJS(input), output);
});

test('export default multiline function', () => {
  const input = `\
export default (foo) ->
  console.log foo`;
  const output = `\
export default function(foo) {
  return console.log(foo);
};`;
  return eq(toJS(input), output);
});

test('export assignment function', () => {
  const input = `\
export foo = (bar) ->
  console.log bar`;
  const output = `\
export var foo = function(bar) {
  return console.log(bar);
};`;
  return eq(toJS(input), output);
});

test('export assignment function which contains assignments in its body', () => {
  const input = `\
export foo = (bar) ->
  baz = '!'
  console.log bar + baz`;
  const output = `\
export var foo = function(bar) {
  var baz;
  baz = '!';
  return console.log(bar + baz);
};`;
  return eq(toJS(input), output);
});

test('export default predefined function', () => {
  const input = `\
foo = (bar) ->
  console.log bar
export default foo`;
  const output = `\
var foo;

foo = function(bar) {
  return console.log(bar);
};

export default foo;`;
  return eq(toJS(input), output);
});

// Uncomment this test once ES2015+ `class` support is added

// test "export default class", ->
//   input = """
//     export default class foo extends bar
//       baz: ->
//         console.log 'hello, world!'"""
//   output = """
//     export default class foo extends bar {
//       baz: function {
//         return console.log('hello, world!');
//       }
//     }"""
//   eq toJS(input), output

// Very limited tests for now, testing that `export class foo` either compiles
// identically (ES2015+) or at least into some function, leaving the specifics
// vague in case the CoffeeScript `class` interpretation changes
test('export class', () => {
  const input = `\
export class foo
  baz: ->
    console.log 'hello, world!'`;
  const output = toJS(input);
  return ok(/^export (class foo|var foo = \(function)/.test(toJS(input)));
});

test('export class that extends', () => {
  const input = `\
export class foo extends bar
  baz: ->
    console.log 'hello, world!'`;
  const output = toJS(input);
  return ok(/export (class foo|var foo = \(function)/.test(output)
    && !/var foo(;|,)/.test(output));
});

test('export default class that extends', () => {
  const input = `\
export default class foo extends bar
  baz: ->
    console.log 'hello, world!'`;
  return ok(/export default (class foo|foo = \(function)/.test(toJS(input)));
});

test('export default named member, within an object', () => {
  const input = 'export { foo as default, bar }';
  const output = `\
export {
  foo as default,
  bar
};`;
  return eq(toJS(input), output);
});


// Import and export in the same statement

test("export an entire module's contents", () => {
  const input = "export * from 'lib'";
  const output = "export * from 'lib';";
  return eq(toJS(input), output);
});

test('export members imported from another module', () => {
  const input = "export { foo, bar } from 'lib'";
  const output = `\
export {
  foo,
  bar
} from 'lib';`;
  return eq(toJS(input), output);
});

test('export as aliases members imported from another module', () => {
  const input = "export { foo as bar, baz as qux } from 'lib'";
  const output = `\
export {
  foo as bar,
  baz as qux
} from 'lib';`;
  return eq(toJS(input), output);
});

test('export list can contain CoffeeScript keywords', () => {
  const input = "export { unless } from 'lib'";
  const output = `\
export {
  unless
} from 'lib';`;
  return eq(toJS(input), output);
});

test('export list can contain CoffeeScript keywords when aliasing', () => {
  const input = "export { when as bar, baz as unless } from 'lib'";
  const output = `\
export {
  when as bar,
  baz as unless
} from 'lib';`;
  return eq(toJS(input), output);
});


// Edge cases

test('multiline import with comments', () => {
  const input = `\
import {
  foo, # Not as good as bar
  bar as baz # I prefer qux
} from 'lib'`;
  const output = `\
import {
  foo,
  bar as baz
} from 'lib';`;
  return eq(toJS(input), output);
});

test('`from` not part of an import or export statement can still be assigned', () => {
  const from = 5;
  return eq(5, from);
});

test('a variable named `from` can be assigned after an import', () => {
  const input = `\
import { foo } from 'lib'
from = 5`;
  const output = `\
var from;

import {
  foo
} from 'lib';

from = 5;`;
  return eq(toJS(input), output);
});

test('`from` can be assigned after a multiline import', () => {
  const input = `\
import {
  foo
} from 'lib'
from = 5`;
  const output = `\
var from;

import {
  foo
} from 'lib';

from = 5;`;
  return eq(toJS(input), output);
});

test('`from` can be imported as a member name', () => {
  const input = "import { from } from 'lib'";
  const output = `\
import {
  from
} from 'lib';`;
  return eq(toJS(input), output);
});

test('`from` can be imported as a member name and aliased', () => {
  const input = "import { from as foo } from 'lib'";
  const output = `\
import {
  from as foo
} from 'lib';`;
  return eq(toJS(input), output);
});

test('`from` can be used as an alias name', () => {
  const input = "import { foo as from } from 'lib'";
  const output = `\
import {
  foo as from
} from 'lib';`;
  return eq(toJS(input), output);
});

test('`as` can be imported as a member name', () => {
  const input = "import { as } from 'lib'";
  const output = `\
import {
  as
} from 'lib';`;
  return eq(toJS(input), output);
});

test('`as` can be imported as a member name and aliased', () => {
  const input = "import { as as foo } from 'lib'";
  const output = `\
import {
  as as foo
} from 'lib';`;
  return eq(toJS(input), output);
});

test('`as` can be used as an alias name', () => {
  const input = "import { foo as as } from 'lib'";
  const output = `\
import {
  foo as as
} from 'lib';`;
  return eq(toJS(input), output);
});

test('CoffeeScript keywords can be used as imported names in import lists', () => {
  const input = `\
import { unless as bar } from 'lib'
bar.barMethod()`;
  const output = `\
import {
  unless as bar
} from 'lib';

bar.barMethod();`;
  return eq(toJS(input), output);
});

test('`*` can be used in an expression on the same line as an export keyword', () => {
  let input = 'export foo = (x) -> x * x';
  let output = `\
export var foo = function(x) {
  return x * x;
};`;
  eq(toJS(input), output);
  input = 'export default foo = (x) -> x * x';
  output = `\
var foo;

export default foo = function(x) {
  return x * x;
};`;
  return eq(toJS(input), output);
});

test('`*` and `from` can be used in an export default expression', () => {
  const input = `\
export default foo.extend
  bar: ->
    from = 5
    from = from * 3`;
  const output = `\
export default foo.extend({
  bar: function() {
    var from;
    from = 5;
    return from = from * 3;
  }
});`;
  return eq(toJS(input), output);
});

test('wrapped members can be imported multiple times if aliased', () => {
  const input = "import { foo, foo as bar } from 'lib'";
  const output = `\
import {
  foo,
  foo as bar
} from 'lib';`;
  return eq(toJS(input), output);
});

test('default and wrapped members can be imported multiple times if aliased', () => {
  const input = "import foo, { foo as bar } from 'lib'";
  const output = `\
import foo, {
  foo as bar
} from 'lib';`;
  return eq(toJS(input), output);
});

test('import a member named default', () => {
  const input = "import { default } from 'lib'";
  const output = `\
import {
  default
} from 'lib';`;
  return eq(toJS(input), output);
});

test('import an aliased member named default', () => {
  const input = "import { default as def } from 'lib'";
  const output = `\
import {
  default as def
} from 'lib';`;
  return eq(toJS(input), output);
});

test('export a member named default', () => {
  const input = 'export { default }';
  const output = `\
export {
  default
};`;
  return eq(toJS(input), output);
});

test('export an aliased member named default', () => {
  const input = 'export { def as default }';
  const output = `\
export {
  def as default
};`;
  return eq(toJS(input), output);
});

test('import an imported member named default', () => {
  const input = "import { default } from 'lib'";
  const output = `\
import {
  default
} from 'lib';`;
  return eq(toJS(input), output);
});

test('import an imported aliased member named default', () => {
  const input = "import { default as def } from 'lib'";
  const output = `\
import {
  default as def
} from 'lib';`;
  return eq(toJS(input), output);
});

test('export an imported member named default', () => {
  const input = "export { default } from 'lib'";
  const output = `\
export {
  default
} from 'lib';`;
  return eq(toJS(input), output);
});

test('export an imported aliased member named default', () => {
  const input = "export { default as def } from 'lib'";
  const output = `\
export {
  default as def
} from 'lib';`;
  return eq(toJS(input), output);
});

test("#4394: export shouldn't prevent variable declarations", () => {
  const input = `\
x = 1
export { x }\
`;
  const output = `\
var x;

x = 1;

export {
  x
};\
`;
  return eq(toJS(input), output);
});

test('#4451: `default` in an export statement is only treated as a keyword when it follows `export` or `as`', () => {
  const input = 'export default { default: 1 }';
  const output = `\
export default {
  "default": 1
};\
`;
  return eq(toJS(input), output);
});

test('#4491: import- and export-specific lexing should stop after import/export statement', () => {
  let input = `\
import {
  foo,
  bar as baz
} from 'lib'

foo as
3 * as 4
from 'foo'\
`;
  let output = `\
import {
  foo,
  bar as baz
} from 'lib';

foo(as);

3 * as(4);

from('foo');\
`;
  eq(toJS(input), output);

  input = `\
import { foo, bar as baz } from 'lib'

foo as
3 * as 4
from 'foo'\
`;
  output = `\
import {
  foo,
  bar as baz
} from 'lib';

foo(as);

3 * as(4);

from('foo');\
`;
  eq(toJS(input), output);

  input = `\
import * as lib from 'lib'

foo as
3 * as 4
from 'foo'\
`;
  output = `\
import * as lib from 'lib';

foo(as);

3 * as(4);

from('foo');\
`;
  eq(toJS(input), output);

  input = `\
export {
  foo,
  bar
}

foo as
3 * as 4
from 'foo'\
`;
  output = `\
export {
  foo,
  bar
};

foo(as);

3 * as(4);

from('foo');\
`;
  eq(toJS(input), output);

  input = `\
export * from 'lib'

foo as
3 * as 4
from 'foo'\
`;
  output = `\
export * from 'lib';

foo(as);

3 * as(4);

from('foo');\
`;
  return eq(toJS(input), output);
});
