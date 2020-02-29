/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS204: Change includes calls to have a more natural evaluation order
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// `nodes.coffee` contains all of the node classes for the syntax tree. Most
// nodes are created as the result of actions in the [grammar](grammar.html),
// but some are created by other nodes as a method of code generation. To convert
// the syntax tree into a string of JavaScript code, call `compile()` on the root.

let Access, Arr, Assign, Base, Block, BooleanLiteral, Call, Class, Code, CodeFragment, Comment, Existence, Expansion, ExportAllDeclaration, ExportDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration, ExportSpecifier, ExportSpecifierList, Extends, For, IdentifierLiteral, If, ImportClause, ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier, ImportSpecifierList, In, Index, InfinityLiteral, Literal, ModuleDeclaration, ModuleSpecifier, ModuleSpecifierList, NaNLiteral, NullLiteral, NumberLiteral, Obj, Op, Param, Parens, PassthroughLiteral, PropertyName, Range, RegexLiteral, RegexWithInterpolations, Return, Slice, Splat, StatementLiteral, StringLiteral, StringWithInterpolations, SuperCall, Switch, TaggedTemplateCall, ThisLiteral, Throw, Try, UndefinedLiteral, Value, While, YieldReturn;
Error.stackTraceLimit = Infinity;

const {Scope} = require('./scope');
const {isUnassignable, JS_FORBIDDEN} = require('./lexer');

// Import the helpers we plan to use.
const {compact, flatten, extend, merge, del, starts, ends, some,
addLocationDataFn, locationDataToString, throwSyntaxError} = require('./helpers');

// Functions required by parser
exports.extend = extend;
exports.addLocationDataFn = addLocationDataFn;

// Constant functions for nodes that don't need customization.
const YES     = () => true;
const NO      = () => false;
const THIS    = function() { return this; };
const NEGATE  = function() { this.negated = !this.negated; return this; };

//### CodeFragment

// The various nodes defined below all compile to a collection of **CodeFragment** objects.
// A CodeFragments is a block of generated code, and the location in the source file where the code
// came from. CodeFragments can be assembled together into working code just by catting together
// all the CodeFragments' `code` snippets, in order.
exports.CodeFragment = (CodeFragment = class CodeFragment {
  constructor(parent, code) {
    this.code = `${code}`;
    this.locationData = parent != null ? parent.locationData : undefined;
    this.type = __guard__(parent != null ? parent.constructor : undefined, x => x.name) || 'unknown';
  }

  toString() {
    return `${this.code}${this.locationData ? ": " + locationDataToString(this.locationData) : ''}`;
  }
});

// Convert an array of CodeFragments into a string.
const fragmentsToText = fragments => (Array.from(fragments).map((fragment) => fragment.code)).join('');

//### Base

// The **Base** is the abstract base class for all nodes in the syntax tree.
// Each subclass implements the `compileNode` method, which performs the
// code generation for that node. To compile a node to JavaScript,
// call `compile` on it, which wraps `compileNode` in some generic extra smarts,
// to know when the generated code needs to be wrapped up in a closure.
// An options hash is passed and cloned throughout, containing information about
// the environment from higher in the tree (such as if a returned value is
// being requested by the surrounding function), information about the current
// scope, and indentation level.
exports.Base = (Base = (function() {
  Base = class Base {
    static initClass() {
  
      // Default implementations of the common node properties and methods. Nodes
      // will override these with custom logic, if needed.
      this.prototype.children = [];
  
      this.prototype.isStatement      = NO;
      this.prototype.jumps            = NO;
      this.prototype.isComplex        = YES;
      this.prototype.isChainable      = NO;
      this.prototype.isAssignable     = NO;
      this.prototype.isNumber         = NO;
  
      this.prototype.unwrap      = THIS;
      this.prototype.unfoldSoak  = NO;
  
      // Is this node used to assign a certain variable?
      this.prototype.assigns = NO;
    }

    compile(o, lvl) {
      return fragmentsToText(this.compileToFragments(o, lvl));
    }

    // Common logic for determining whether to wrap this node in a closure before
    // compiling it, or to compile directly. We need to wrap if this node is a
    // *statement*, and it's not a *pureStatement*, and we're not at
    // the top level of a block (which would be unnecessary), and we haven't
    // already been asked to return the result (because statements know how to
    // return results).
    compileToFragments(o, lvl) {
      o        = extend({}, o);
      if (lvl) { o.level  = lvl; }
      const node     = this.unfoldSoak(o) || this;
      node.tab = o.indent;
      if ((o.level === LEVEL_TOP) || !node.isStatement(o)) {
        return node.compileNode(o);
      } else {
        return node.compileClosure(o);
      }
    }

    // Statements converted into expressions via closure-wrapping share a scope
    // object with their parent closure, to preserve the expected lexical scope.
    compileClosure(o) {
      let argumentsNode, jumpNode;
      if (jumpNode = this.jumps()) {
        jumpNode.error('cannot use a pure statement in an expression');
      }
      o.sharedScope = true;
      let func = new Code([], Block.wrap([this]));
      let args = [];
      if ((argumentsNode = this.contains(isLiteralArguments)) || this.contains(isLiteralThis)) {
        let meth;
        args = [new ThisLiteral];
        if (argumentsNode) {
          meth = 'apply';
          args.push(new IdentifierLiteral('arguments'));
        } else {
          meth = 'call';
        }
        func = new Value(func, [new Access(new PropertyName(meth))]);
      }
      const parts = (new Call(func, args)).compileNode(o);
      if (func.isGenerator || (func.base != null ? func.base.isGenerator : undefined)) {
        parts.unshift(this.makeCode("(yield* "));
        parts.push(this.makeCode(")"));
      }
      return parts;
    }

    // If the code generation wishes to use the result of a complex expression
    // in multiple places, ensure that the expression is only ever evaluated once,
    // by assigning it to a temporary variable. Pass a level to precompile.
    //
    // If `level` is passed, then returns `[val, ref]`, where `val` is the compiled value, and `ref`
    // is the compiled reference. If `level` is not passed, this returns `[val, ref]` where
    // the two values are raw nodes which have not been compiled.
    cache(o, level, isComplex) {
      let ref;
      const complex = (isComplex != null) ? isComplex(this) : this.isComplex();
      if (complex) {
        ref = new IdentifierLiteral(o.scope.freeVariable('ref'));
        const sub = new Assign(ref, this);
        if (level) { return [sub.compileToFragments(o, level), [this.makeCode(ref.value)]]; } else { return [sub, ref]; }
      } else {
        ref = level ? this.compileToFragments(o, level) : this;
        return [ref, ref];
      }
    }

    cacheToCodeFragments(cacheValues) {
      return [fragmentsToText(cacheValues[0]), fragmentsToText(cacheValues[1])];
    }

    // Construct a node that returns the current node's result.
    // Note that this is overridden for smarter behavior for
    // many statement nodes (e.g. If, For)...
    makeReturn(res) {
      const me = this.unwrapAll();
      if (res) {
        return new Call(new Literal(`${res}.push`), [me]);
      } else {
        return new Return(me);
      }
    }

    // Does this node, or any of its children, contain a node of a certain kind?
    // Recursively traverses down the *children* nodes and returns the first one
    // that verifies `pred`. Otherwise return undefined. `contains` does not cross
    // scope boundaries.
    contains(pred) {
      let node = undefined;
      this.traverseChildren(false, function(n) {
        if (pred(n)) {
          node = n;
          return false;
        }
      });
      return node;
    }

    // Pull out the last non-comment node of a node list.
    lastNonComment(list) {
      let i = list.length;
      while (i--) { if (!(list[i] instanceof Comment)) { return list[i]; } }
      return null;
    }

    // `toString` representation of the node, for inspecting the parse tree.
    // This is what `coffee --nodes` prints out.
    toString(idt, name) {
      if (idt == null) { idt = ''; }
      if (name == null) { ({
        name
      } = this.constructor); }
      let tree = '\n' + idt + name;
      if (this.soak) { tree += '?'; }
      this.eachChild(node => tree += node.toString(idt + TAB));
      return tree;
    }

    // Passes each child to a function, breaking when the function returns `false`.
    eachChild(func) {
      if (!this.children) { return this; }
      for (let attr of Array.from(this.children)) {
        if (this[attr]) {
          for (let child of Array.from(flatten([this[attr]]))) {
            if (func(child) === false) { return this; }
          }
        }
      }
      return this;
    }

    traverseChildren(crossScope, func) {
      return this.eachChild(function(child) {
        const recur = func(child);
        if (recur !== false) { return child.traverseChildren(crossScope, func); }
      });
    }

    invert() {
      return new Op('!', this);
    }

    unwrapAll() {
      let node = this;
      while (node !== (node = node.unwrap())) { continue; }
      return node;
    }

    // For this node and all descendents, set the location data to `locationData`
    // if the location data is not already set.
    updateLocationDataIfMissing(locationData) {
      if (this.locationData) { return this; }
      this.locationData = locationData;

      return this.eachChild(child => child.updateLocationDataIfMissing(locationData));
    }

    // Throw a SyntaxError associated with this node's location.
    error(message) {
      return throwSyntaxError(message, this.locationData);
    }

    makeCode(code) {
      return new CodeFragment(this, code);
    }

    wrapInBraces(fragments) {
      return [].concat(this.makeCode('('), fragments, this.makeCode(')'));
    }

    // `fragmentsList` is an array of arrays of fragments. Each array in fragmentsList will be
    // concatonated together, with `joinStr` added in between each, to produce a final flat array
    // of fragments.
    joinFragmentArrays(fragmentsList, joinStr) {
      let answer = [];
      for (let i = 0; i < fragmentsList.length; i++) {
        const fragments = fragmentsList[i];
        if (i) { answer.push(this.makeCode(joinStr)); }
        answer = answer.concat(fragments);
      }
      return answer;
    }
  };
  Base.initClass();
  return Base;
})());

//### Block

// The block is the list of expressions that forms the body of an
// indented block of code -- the implementation of a function, a clause in an
// `if`, `switch`, or `try`, and so on...
exports.Block = (Block = (function() {
  Block = class Block extends Base {
    static initClass() {
  
      this.prototype.children = ['expressions'];
    }
    constructor(nodes) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.expressions = compact(flatten(nodes || []));
    }

    // Tack an expression on to the end of this expression list.
    push(node) {
      this.expressions.push(node);
      return this;
    }

    // Remove and return the last expression of this expression list.
    pop() {
      return this.expressions.pop();
    }

    // Add an expression at the beginning of this expression list.
    unshift(node) {
      this.expressions.unshift(node);
      return this;
    }

    // If this Block consists of just a single node, unwrap it by pulling
    // it back out.
    unwrap() {
      if (this.expressions.length === 1) { return this.expressions[0]; } else { return this; }
    }

    // Is this an empty block of code?
    isEmpty() {
      return !this.expressions.length;
    }

    isStatement(o) {
      for (let exp of Array.from(this.expressions)) {
        if (exp.isStatement(o)) {
          return true;
        }
      }
      return false;
    }

    jumps(o) {
      for (let exp of Array.from(this.expressions)) {
        var jumpNode;
        if (jumpNode = exp.jumps(o)) { return jumpNode; }
      }
    }

    // A Block node does not return its entire body, rather it
    // ensures that the final expression is returned.
    makeReturn(res) {
      let len = this.expressions.length;
      while (len--) {
        const expr = this.expressions[len];
        if (!(expr instanceof Comment)) {
          this.expressions[len] = expr.makeReturn(res);
          if (expr instanceof Return && !expr.expression) { this.expressions.splice(len, 1); }
          break;
        }
      }
      return this;
    }

    // A **Block** is the only node that can serve as the root.
    compileToFragments(o, level) {
      if (o == null) { o = {}; }
      if (o.scope) { return super.compileToFragments(o, level); } else { return this.compileRoot(o); }
    }

    // Compile all expressions within the **Block** body. If we need to
    // return the result, and it's an expression, simply return it. If it's a
    // statement, ask the statement to do so.
    compileNode(o) {
      let answer;
      this.tab  = o.indent;
      const top   = o.level === LEVEL_TOP;
      const compiledNodes = [];

      for (let index = 0; index < this.expressions.length; index++) {

        let node = this.expressions[index];
        node = node.unwrapAll();
        node = (node.unfoldSoak(o) || node);
        if (node instanceof Block) {
          // This is a nested block. We don't do anything special here like enclose
          // it in a new scope; we just compile the statements in this block along with
          // our own
          compiledNodes.push(node.compileNode(o));
        } else if (top) {
          node.front = true;
          const fragments = node.compileToFragments(o);
          if (!node.isStatement(o)) {
            fragments.unshift(this.makeCode(`${this.tab}`));
            fragments.push(this.makeCode(";"));
          }
          compiledNodes.push(fragments);
        } else {
          compiledNodes.push(node.compileToFragments(o, LEVEL_LIST));
        }
      }
      if (top) {
        if (this.spaced) {
          return [].concat(this.joinFragmentArrays(compiledNodes, '\n\n'), this.makeCode("\n"));
        } else {
          return this.joinFragmentArrays(compiledNodes, '\n');
        }
      }
      if (compiledNodes.length) {
        answer = this.joinFragmentArrays(compiledNodes, ', ');
      } else {
        answer = [this.makeCode("void 0")];
      }
      if ((compiledNodes.length > 1) && (o.level >= LEVEL_LIST)) { return this.wrapInBraces(answer); } else { return answer; }
    }

    // If we happen to be the top-level **Block**, wrap everything in
    // a safety closure, unless requested not to.
    // It would be better not to generate them in the first place, but for now,
    // clean up obvious double-parentheses.
    compileRoot(o) {
      o.indent  = o.bare ? '' : TAB;
      o.level   = LEVEL_TOP;
      this.spaced   = true;
      o.scope   = new Scope(null, this, null, o.referencedVars != null ? o.referencedVars : []);
      // Mark given local variables in the root scope as parameters so they don't
      // end up being declared on this block.
      for (let name of Array.from(o.locals || [])) { o.scope.parameter(name); }
      let prelude   = [];
      if (!o.bare) {
        const preludeExps = (() => {
          const result = [];
          for (let i = 0; i < this.expressions.length; i++) {
            const exp = this.expressions[i];
            if (!(exp.unwrap() instanceof Comment)) { break; }
            result.push(exp);
          }
          return result;
        })();
        const rest = this.expressions.slice(preludeExps.length);
        this.expressions = preludeExps;
        if (preludeExps.length) {
          prelude = this.compileNode(merge(o, {indent: ''}));
          prelude.push(this.makeCode("\n"));
        }
        this.expressions = rest;
      }
      const fragments = this.compileWithDeclarations(o);
      if (o.bare) { return fragments; }
      return [].concat(prelude, this.makeCode("(function() {\n"), fragments, this.makeCode("\n}).call(this);\n"));
    }

    // Compile the expressions body for the contents of a function, with
    // declarations of all inner variables pushed up to the top.
    compileWithDeclarations(o) {
      let i, spaced;
      let fragments = [];
      let post = [];
      for (i = 0; i < this.expressions.length; i++) {
        let exp = this.expressions[i];
        exp = exp.unwrap();
        if (!(exp instanceof Comment) && !(exp instanceof Literal)) { break; }
      }
      o = merge(o, {level: LEVEL_TOP});
      if (i) {
        const rest = this.expressions.splice(i, 9e9);
        [spaced,    this.spaced] = Array.from([this.spaced, false]);
        [fragments, this.spaced] = Array.from([this.compileNode(o), spaced]);
        this.expressions = rest;
      }
      post = this.compileNode(o);
      const {scope} = o;
      if (scope.expressions === this) {
        const declars = o.scope.hasDeclarations();
        const assigns = scope.hasAssignments;
        if (declars || assigns) {
          if (i) { fragments.push(this.makeCode('\n')); }
          fragments.push(this.makeCode(`${this.tab}var `));
          if (declars) {
            fragments.push(this.makeCode(scope.declaredVariables().join(', ')));
          }
          if (assigns) {
            if (declars) { fragments.push(this.makeCode(`,\n${this.tab + TAB}`)); }
            fragments.push(this.makeCode(scope.assignedVariables().join(`,\n${this.tab + TAB}`)));
          }
          fragments.push(this.makeCode(`;\n${this.spaced ? '\n' : ''}`));
        } else if (fragments.length && post.length) {
          fragments.push(this.makeCode("\n"));
        }
      }
      return fragments.concat(post);
    }

    // Wrap up the given nodes as a **Block**, unless it already happens
    // to be one.
    static wrap(nodes) {
      if ((nodes.length === 1) && nodes[0] instanceof Block) { return nodes[0]; }
      return new Block(nodes);
    }
  };
  Block.initClass();
  return Block;
})());

//### Literal

// `Literal` is a base class for static values that can be passed through
// directly into JavaScript without translation, such as: strings, numbers,
// `true`, `false`, `null`...
exports.Literal = (Literal = (function() {
  Literal = class Literal extends Base {
    static initClass() {
  
      this.prototype.isComplex = NO;
    }
    constructor(value) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.value = value;
    }

    assigns(name) {
      return name === this.value;
    }

    compileNode(o) {
      return [this.makeCode(this.value)];
    }

    toString() {
      return ` ${this.isStatement() ? super.toString(...arguments) : this.constructor.name}: ${this.value}`;
    }
  };
  Literal.initClass();
  return Literal;
})());

exports.NumberLiteral = (NumberLiteral = class NumberLiteral extends Literal {});

exports.InfinityLiteral = (InfinityLiteral = class InfinityLiteral extends NumberLiteral {
  compileNode() {
    return [this.makeCode('2e308')];
  }
});

exports.NaNLiteral = (NaNLiteral = class NaNLiteral extends NumberLiteral {
  constructor() {
    super('NaN');
  }

  compileNode(o) {
    const code = [this.makeCode('0/0')];
    if (o.level >= LEVEL_OP) { return this.wrapInBraces(code); } else { return code; }
  }
});

exports.StringLiteral = (StringLiteral = class StringLiteral extends Literal {});

exports.RegexLiteral = (RegexLiteral = class RegexLiteral extends Literal {});

exports.PassthroughLiteral = (PassthroughLiteral = class PassthroughLiteral extends Literal {});

exports.IdentifierLiteral = (IdentifierLiteral = (function() {
  IdentifierLiteral = class IdentifierLiteral extends Literal {
    static initClass() {
      this.prototype.isAssignable = YES;
    }
  };
  IdentifierLiteral.initClass();
  return IdentifierLiteral;
})());

exports.PropertyName = (PropertyName = (function() {
  PropertyName = class PropertyName extends Literal {
    static initClass() {
      this.prototype.isAssignable = YES;
    }
  };
  PropertyName.initClass();
  return PropertyName;
})());

exports.StatementLiteral = (StatementLiteral = (function() {
  StatementLiteral = class StatementLiteral extends Literal {
    static initClass() {
      this.prototype.isStatement = YES;
  
      this.prototype.makeReturn = THIS;
    }

    jumps(o) {
      if ((this.value === 'break') && !((o != null ? o.loop : undefined) || (o != null ? o.block : undefined))) { return this; }
      if ((this.value === 'continue') && !(o != null ? o.loop : undefined)) { return this; }
    }

    compileNode(o) {
      return [this.makeCode(`${this.tab}${this.value};`)];
    }
  };
  StatementLiteral.initClass();
  return StatementLiteral;
})());

exports.ThisLiteral = (ThisLiteral = class ThisLiteral extends Literal {
  constructor() {
    super('this');
  }

  compileNode(o) {
    const code = (o.scope.method != null ? o.scope.method.bound : undefined) ? o.scope.method.context : this.value;
    return [this.makeCode(code)];
  }
});

exports.UndefinedLiteral = (UndefinedLiteral = class UndefinedLiteral extends Literal {
  constructor() {
    super('undefined');
  }

  compileNode(o) {
    return [this.makeCode(o.level >= LEVEL_ACCESS ? '(void 0)' : 'void 0')];
  }
});

exports.NullLiteral = (NullLiteral = class NullLiteral extends Literal {
  constructor() {
    super('null');
  }
});

exports.BooleanLiteral = (BooleanLiteral = class BooleanLiteral extends Literal {});

//### Return

// A `return` is a *pureStatement* -- wrapping it in a closure wouldn't
// make sense.
exports.Return = (Return = (function() {
  Return = class Return extends Base {
    static initClass() {
  
      this.prototype.children = ['expression'];
  
      this.prototype.isStatement =     YES;
      this.prototype.makeReturn =      THIS;
      this.prototype.jumps =           THIS;
    }
    constructor(expression) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.expression = expression;
    }

    compileToFragments(o, level) {
      const expr = this.expression != null ? this.expression.makeReturn() : undefined;
      if (expr && !(expr instanceof Return)) { return expr.compileToFragments(o, level); } else { return super.compileToFragments(o, level); }
    }

    compileNode(o) {
      let answer = [];
      // TODO: If we call expression.compile() here twice, we'll sometimes get back different results!
      answer.push(this.makeCode(this.tab + `return${this.expression ? " " : ""}`));
      if (this.expression) {
        answer = answer.concat(this.expression.compileToFragments(o, LEVEL_PAREN));
      }
      answer.push(this.makeCode(";"));
      return answer;
    }
  };
  Return.initClass();
  return Return;
})());

// `yield return` works exactly like `return`, except that it turns the function
// into a generator.
exports.YieldReturn = (YieldReturn = class YieldReturn extends Return {
  compileNode(o) {
    if (o.scope.parent == null) {
      this.error('yield can only occur inside functions');
    }
    return super.compileNode(...arguments);
  }
});

//### Value

// A value, variable or literal or parenthesized, indexed or dotted into,
// or vanilla.
exports.Value = (Value = (function() {
  Value = class Value extends Base {
    static initClass() {
  
      this.prototype.children = ['base', 'properties'];
    }
    constructor(base, props, tag) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      if (!props && base instanceof Value) { return base; }
      this.base       = base;
      this.properties = props || [];
      if (tag) { this[tag]      = true; }
      return this;
    }

    // Add a property (or *properties* ) `Access` to the list.
    add(props) {
      this.properties = this.properties.concat(props);
      return this;
    }

    hasProperties() {
      return !!this.properties.length;
    }

    bareLiteral(type) {
      return !this.properties.length && this.base instanceof type;
    }

    // Some boolean checks for the benefit of other nodes.
    isArray() { return this.bareLiteral(Arr); }
    isRange() { return this.bareLiteral(Range); }
    isComplex() { return this.hasProperties() || this.base.isComplex(); }
    isAssignable() { return this.hasProperties() || this.base.isAssignable(); }
    isNumber() { return this.bareLiteral(NumberLiteral); }
    isString() { return this.bareLiteral(StringLiteral); }
    isRegex() { return this.bareLiteral(RegexLiteral); }
    isUndefined() { return this.bareLiteral(UndefinedLiteral); }
    isNull() { return this.bareLiteral(NullLiteral); }
    isBoolean() { return this.bareLiteral(BooleanLiteral); }
    isAtomic() {
      for (let node of Array.from(this.properties.concat(this.base))) {
        if (node.soak || node instanceof Call) { return false; }
      }
      return true;
    }

    isNotCallable() { return this.isNumber() || this.isString() || this.isRegex() ||
                        this.isArray() || this.isRange() || this.isSplice() || this.isObject() ||
                        this.isUndefined() || this.isNull() || this.isBoolean(); }

    isStatement(o)    { return !this.properties.length && this.base.isStatement(o); }
    assigns(name) { return !this.properties.length && this.base.assigns(name); }
    jumps(o)    { return !this.properties.length && this.base.jumps(o); }

    isObject(onlyGenerated) {
      if (this.properties.length) { return false; }
      return (this.base instanceof Obj) && (!onlyGenerated || this.base.generated);
    }

    isSplice() {
      const lastProp = this.properties[this.properties.length - 1];
      return lastProp instanceof Slice;
    }

    looksStatic(className) {
      return (this.base.value === className) && (this.properties.length === 1) &&
        ((this.properties[0].name != null ? this.properties[0].name.value : undefined) !== 'prototype');
    }

    // The value can be unwrapped as its inner node, if there are no attached
    // properties.
    unwrap() {
      if (this.properties.length) { return this; } else { return this.base; }
    }

    // A reference has base part (`this` value) and name part.
    // We cache them separately for compiling complex expressions.
    // `a()[b()] ?= c` -> `(_base = a())[_name = b()] ? _base[_name] = c`
    cacheReference(o) {
      let bref, nref;
      let name = this.properties[this.properties.length - 1];
      if ((this.properties.length < 2) && !this.base.isComplex() && !(name != null ? name.isComplex() : undefined)) {
        return [this, this];  // `a` `a.b`
      }
      let base = new Value(this.base, this.properties.slice(0, -1));
      if (base.isComplex()) {  // `a().b`
        bref = new IdentifierLiteral(o.scope.freeVariable('base'));
        base = new Value(new Parens(new Assign(bref, base)));
      }
      if (!name) { return [base, bref]; }  // `a()`
      if (name.isComplex()) {  // `a[b()]`
        nref = new IdentifierLiteral(o.scope.freeVariable('name'));
        name = new Index(new Assign(nref, name.index));
        nref = new Index(nref);
      }
      return [base.add(name), new Value(bref || base.base, [nref || name])];
    }

    // We compile a value to JavaScript by compiling and joining each property.
    // Things get much more interesting if the chain of properties has *soak*
    // operators `?.` interspersed. Then we have to take care not to accidentally
    // evaluate anything twice when building the soak chain.
    compileNode(o) {
      this.base.front = this.front;
      const props = this.properties;
      const fragments = this.base.compileToFragments(o, (props.length ? LEVEL_ACCESS : null));
      if (props.length && SIMPLENUM.test(fragmentsToText(fragments))) {
        fragments.push(this.makeCode('.'));
      }
      for (let prop of Array.from(props)) {
        fragments.push(...Array.from((prop.compileToFragments(o)) || []));
      }
      return fragments;
    }

    // Unfold a soak into an `If`: `a?.b` -> `a.b if a?`
    unfoldSoak(o) {
      return this.unfoldedSoak != null ? this.unfoldedSoak : (this.unfoldedSoak = (() => {
        let ifn;
        if (ifn = this.base.unfoldSoak(o)) {
          ifn.body.properties.push(...Array.from(this.properties || []));
          return ifn;
        }
        for (let i = 0; i < this.properties.length; i++) {
          const prop = this.properties[i];
          if (prop.soak) {
            prop.soak = false;
            let fst = new Value(this.base, this.properties.slice(0, i));
            const snd = new Value(this.base, this.properties.slice(i));
            if (fst.isComplex()) {
              const ref = new IdentifierLiteral(o.scope.freeVariable('ref'));
              fst = new Parens(new Assign(ref, fst));
              snd.base = ref;
            }
            return new If(new Existence(fst), snd, {soak: true});
          }
        }
        return false;
      })());
    }
  };
  Value.initClass();
  return Value;
})());

//### Comment

// CoffeeScript passes through block comments as JavaScript block comments
// at the same position.
exports.Comment = (Comment = (function() {
  Comment = class Comment extends Base {
    static initClass() {
  
      this.prototype.isStatement =     YES;
      this.prototype.makeReturn =      THIS;
    }
    constructor(comment) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.comment = comment;
    }

    compileNode(o, level) {
      const comment = this.comment.replace(/^(\s*)#(?=\s)/gm, "$1 *");
      let code = `/*${multident(comment, this.tab)}${Array.from(comment).includes('\n') ? `\n${this.tab}` : ''} */`;
      if ((level || o.level) === LEVEL_TOP) { code = o.indent + code; }
      return [this.makeCode("\n"), this.makeCode(code)];
    }
  };
  Comment.initClass();
  return Comment;
})());

//### Call

// Node for a function invocation.
exports.Call = (Call = (function() {
  Call = class Call extends Base {
    static initClass() {
  
      this.prototype.children = ['variable', 'args'];
    }
    constructor(variable, args, soak) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.variable = variable;
      if (args == null) { args = []; }
      this.args = args;
      this.soak = soak;
      this.isNew    = false;
      if (this.variable instanceof Value && this.variable.isNotCallable()) {
        this.variable.error("literal is not a function");
      }
    }

    // When setting the location, we sometimes need to update the start location to
    // account for a newly-discovered `new` operator to the left of us. This
    // expands the range on the left, but not the right.
    updateLocationDataIfMissing(locationData) {
      if (this.locationData && this.needsUpdatedStartLocation) {
        this.locationData.first_line = locationData.first_line;
        this.locationData.first_column = locationData.first_column;
        const base = (this.variable != null ? this.variable.base : undefined) || this.variable;
        if (base.needsUpdatedStartLocation) {
          this.variable.locationData.first_line = locationData.first_line;
          this.variable.locationData.first_column = locationData.first_column;
          base.updateLocationDataIfMissing(locationData);
        }
        delete this.needsUpdatedStartLocation;
      }
      return super.updateLocationDataIfMissing(...arguments);
    }

    // Tag this invocation as creating a new instance.
    newInstance() {
      const base = (this.variable != null ? this.variable.base : undefined) || this.variable;
      if (base instanceof Call && !base.isNew) {
        base.newInstance();
      } else {
        this.isNew = true;
      }
      this.needsUpdatedStartLocation = true;
      return this;
    }

    // Soaked chained invocations unfold into if/else ternary structures.
    unfoldSoak(o) {
      let ifn;
      if (this.soak) {
        let left, rite;
        if (this instanceof SuperCall) {
          left = new Literal(this.superReference(o));
          rite = new Value(left);
        } else {
          if (ifn = unfoldSoak(o, this, 'variable')) { return ifn; }
          [left, rite] = Array.from(new Value(this.variable).cacheReference(o));
        }
        rite = new Call(rite, this.args);
        rite.isNew = this.isNew;
        left = new Literal(`typeof ${ left.compile(o) } === \"function\"`);
        return new If(left, new Value(rite), {soak: true});
      }
      let call = this;
      const list = [];
      while (true) {
        if (call.variable instanceof Call) {
          list.push(call);
          call = call.variable;
          continue;
        }
        if (!(call.variable instanceof Value)) { break; }
        list.push(call);
        if (!((call = call.variable.base) instanceof Call)) { break; }
      }
      for (call of Array.from(list.reverse())) {
        if (ifn) {
          if (call.variable instanceof Call) {
            call.variable = ifn;
          } else {
            call.variable.base = ifn;
          }
        }
        ifn = unfoldSoak(o, call, 'variable');
      }
      return ifn;
    }

    // Compile a vanilla function call.
    compileNode(o) {
      if (this.variable != null) {
        this.variable.front = this.front;
      }
      const compiledArray = Splat.compileSplattedArray(o, this.args, true);
      if (compiledArray.length) {
        return this.compileSplat(o, compiledArray);
      }
      const compiledArgs = [];
      for (let argIndex = 0; argIndex < this.args.length; argIndex++) {
        const arg = this.args[argIndex];
        if (argIndex) { compiledArgs.push(this.makeCode(", ")); }
        compiledArgs.push(...Array.from((arg.compileToFragments(o, LEVEL_LIST)) || []));
      }

      const fragments = [];
      if (this instanceof SuperCall) {
        let preface = this.superReference(o) + `.call(${this.superThis(o)}`;
        if (compiledArgs.length) { preface += ", "; }
        fragments.push(this.makeCode(preface));
      } else {
        if (this.isNew) { fragments.push(this.makeCode('new ')); }
        fragments.push(...Array.from(this.variable.compileToFragments(o, LEVEL_ACCESS) || []));
        fragments.push(this.makeCode("("));
      }
      fragments.push(...Array.from(compiledArgs || []));
      fragments.push(this.makeCode(")"));
      return fragments;
    }

    // If you call a function with a splat, it's converted into a JavaScript
    // `.apply()` call to allow an array of arguments to be passed.
    // If it's a constructor, then things get real tricky. We have to inject an
    // inner constructor in order to be able to pass the varargs.
    //
    // splatArgs is an array of CodeFragments to put into the 'apply'.
    compileSplat(o, splatArgs) {
      let name, ref;
      if (this instanceof SuperCall) {
        return [].concat(this.makeCode(`${ this.superReference(o) }.apply(${this.superThis(o)}, `),
          splatArgs, this.makeCode(")"));
      }

      if (this.isNew) {
        const idt = this.tab + TAB;
        return [].concat(this.makeCode(`\
(function(func, args, ctor) {
${idt}ctor.prototype = func.prototype;
${idt}var child = new ctor, result = func.apply(child, args);
${idt}return Object(result) === result ? result : child;
${this.tab}})(`),
          (this.variable.compileToFragments(o, LEVEL_LIST)),
          this.makeCode(", "), splatArgs, this.makeCode(", function(){})"));
      }

      let answer = [];
      const base = new Value(this.variable);
      if ((name = base.properties.pop()) && base.isComplex()) {
        ref = o.scope.freeVariable('ref');
        answer = answer.concat(this.makeCode(`(${ref} = `),
          (base.compileToFragments(o, LEVEL_LIST)),
          this.makeCode(")"),
          name.compileToFragments(o));
      } else {
        let fun = base.compileToFragments(o, LEVEL_ACCESS);
        if (SIMPLENUM.test(fragmentsToText(fun))) { fun = this.wrapInBraces(fun); }
        if (name) {
          ref = fragmentsToText(fun);
          fun.push(...Array.from((name.compileToFragments(o)) || []));
        } else {
          ref = 'null';
        }
        answer = answer.concat(fun);
      }
      return answer = answer.concat(this.makeCode(`.apply(${ref}, `), splatArgs, this.makeCode(")"));
    }
  };
  Call.initClass();
  return Call;
})());

//### Super

// Takes care of converting `super()` calls into calls against the prototype's
// function of the same name.
exports.SuperCall = (SuperCall = class SuperCall extends Call {
  constructor(args) {
    super(null, args != null ? args : [new Splat(new IdentifierLiteral('arguments'))]);
    // Allow to recognize a bare `super` call without parentheses and arguments.
    this.isBare = (args != null);
  }

  // Grab the reference to the superclass's implementation of the current
  // method.
  superReference(o) {
    let name;
    const method = o.scope.namedMethod();
    if (method != null ? method.klass : undefined) {
      let bref, klass, nref, variable;
      ({klass, name, variable} = method);
      if (klass.isComplex()) {
        bref = new IdentifierLiteral(o.scope.parent.freeVariable('base'));
        const base = new Value(new Parens(new Assign(bref, klass)));
        variable.base = base;
        variable.properties.splice(0, klass.properties.length);
      }
      if (name.isComplex() || (name instanceof Index && name.index.isAssignable())) {
        nref = new IdentifierLiteral(o.scope.parent.freeVariable('name'));
        name = new Index(new Assign(nref, name.index));
        variable.properties.pop();
        variable.properties.push(name);
      }
      const accesses = [new Access(new PropertyName('__super__'))];
      if (method.static) { accesses.push(new Access(new PropertyName('constructor'))); }
      accesses.push((nref != null) ? new Index(nref) : name);
      return (new Value(bref != null ? bref : klass, accesses)).compile(o);
    } else if ((method != null ? method.ctor : undefined)) {
      return `${method.name}.__super__.constructor`;
    } else {
      return this.error('cannot call super outside of an instance method.');
    }
  }

  // The appropriate `this` value for a `super` call.
  superThis(o) {
    const {
      method
    } = o.scope;
    return (method && !method.klass && method.context) || "this";
  }
});

//### RegexWithInterpolations

// Regexes with interpolations are in fact just a variation of a `Call` (a
// `RegExp()` call to be precise) with a `StringWithInterpolations` inside.
exports.RegexWithInterpolations = (RegexWithInterpolations = class RegexWithInterpolations extends Call {
  constructor(args) {
    if (args == null) { args = []; }
    super((new Value(new IdentifierLiteral('RegExp'))), args, false);
  }
});

//### TaggedTemplateCall

exports.TaggedTemplateCall = (TaggedTemplateCall = class TaggedTemplateCall extends Call {
  constructor(variable, arg, soak) {
    if (arg instanceof StringLiteral) { arg = new StringWithInterpolations(Block.wrap([ new Value(arg) ])); }
    super(variable, [ arg ], soak);
  }

  compileNode(o) {
    // Tell `StringWithInterpolations` whether to compile as ES2015 or not; will be removed in CoffeeScript 2.
    o.inTaggedTemplateCall = true;
    return this.variable.compileToFragments(o, LEVEL_ACCESS).concat(this.args[0].compileToFragments(o, LEVEL_LIST));
  }
});

//### Extends

// Node to extend an object's prototype with an ancestor object.
// After `goog.inherits` from the
// [Closure Library](https://github.com/google/closure-library/blob/master/closure/goog/base.js).
exports.Extends = (Extends = (function() {
  Extends = class Extends extends Base {
    static initClass() {
  
      this.prototype.children = ['child', 'parent'];
    }
    constructor(child, parent) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.child = child;
      this.parent = parent;
    }

    // Hooks one constructor into another's prototype chain.
    compileToFragments(o) {
      return new Call(new Value(new Literal(utility('extend', o))), [this.child, this.parent]).compileToFragments(o);
    }
  };
  Extends.initClass();
  return Extends;
})());

//### Access

// A `.` access into a property of a value, or the `::` shorthand for
// an access into the object's prototype.
exports.Access = (Access = (function() {
  Access = class Access extends Base {
    static initClass() {
  
      this.prototype.children = ['name'];
  
      this.prototype.isComplex = NO;
    }
    constructor(name, tag) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.name = name;
      this.soak  = tag === 'soak';
    }

    compileToFragments(o) {
      const name = this.name.compileToFragments(o);
      const node = this.name.unwrap();
      if (node instanceof PropertyName) {
        if (Array.from(JS_FORBIDDEN).includes(node.value)) {
          return [this.makeCode('["'), ...Array.from(name), this.makeCode('"]')];
        } else {
          return [this.makeCode('.'), ...Array.from(name)];
        }
      } else {
        return [this.makeCode('['), ...Array.from(name), this.makeCode(']')];
      }
    }
  };
  Access.initClass();
  return Access;
})());

//### Index

// A `[ ... ]` indexed access into an array or object.
exports.Index = (Index = (function() {
  Index = class Index extends Base {
    static initClass() {
  
      this.prototype.children = ['index'];
    }
    constructor(index) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.index = index;
    }

    compileToFragments(o) {
      return [].concat(this.makeCode("["), this.index.compileToFragments(o, LEVEL_PAREN), this.makeCode("]"));
    }

    isComplex() {
      return this.index.isComplex();
    }
  };
  Index.initClass();
  return Index;
})());

//### Range

// A range literal. Ranges can be used to extract portions (slices) of arrays,
// to specify a range for comprehensions, or as a value, to be expanded into the
// corresponding array of integers at runtime.
exports.Range = (Range = (function() {
  Range = class Range extends Base {
    static initClass() {
  
      this.prototype.children = ['from', 'to'];
    }

    constructor(from, to, tag) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.from = from;
      this.to = to;
      this.exclusive = tag === 'exclusive';
      this.equals = this.exclusive ? '' : '=';
    }



    // Compiles the range's source variables -- where it starts and where it ends.
    // But only if they need to be cached to avoid double evaluation.
    compileVariables(o) {
      let step;
      o = merge(o, {top: true});
      const isComplex = del(o, 'isComplex');
      [this.fromC, this.fromVar]  =  Array.from(this.cacheToCodeFragments(this.from.cache(o, LEVEL_LIST, isComplex)));
      [this.toC, this.toVar]      =  Array.from(this.cacheToCodeFragments(this.to.cache(o, LEVEL_LIST, isComplex)));
      if (step = del(o, 'step')) { [this.step, this.stepVar]   =  Array.from(this.cacheToCodeFragments(step.cache(o, LEVEL_LIST, isComplex))); }
      this.fromNum = this.from.isNumber() ? Number(this.fromVar) : null;
      this.toNum   = this.to.isNumber()   ? Number(this.toVar)   : null;
      return this.stepNum = (step != null ? step.isNumber() : undefined) ? Number(this.stepVar) : null;
    }

    // When compiled normally, the range returns the contents of the *for loop*
    // needed to iterate over the values in the range. Used by comprehensions.
    compileNode(o) {
      let from, to, cond;
      if (!this.fromVar) { this.compileVariables(o); }
      if (!o.index) { return this.compileArray(o); }

      // Set up endpoints.
      const known    = (this.fromNum != null) && (this.toNum != null);
      const idx      = del(o, 'index');
      const idxName  = del(o, 'name');
      const namedIndex = idxName && (idxName !== idx);
      let varPart  = `${idx} = ${this.fromC}`;
      if (this.toC !== this.toVar) { varPart += `, ${this.toC}`; }
      if (this.step !== this.stepVar) { varPart += `, ${this.step}`; }
      const [lt, gt] = Array.from([`${idx} <${this.equals}`, `${idx} >${this.equals}`]);

      // Generate the condition.
      const condPart = (() => {
        if (this.stepNum != null) {
        if (this.stepNum > 0) { return `${lt} ${this.toVar}`; } else { return `${gt} ${this.toVar}`; }
      } else if (known) {
        [from, to] = Array.from([this.fromNum, this.toNum]);
        if (from <= to) { return `${lt} ${to}`; } else { return `${gt} ${to}`; }
      } else {
        cond = this.stepVar ? `${this.stepVar} > 0` : `${this.fromVar} <= ${this.toVar}`;
        return `${cond} ? ${lt} ${this.toVar} : ${gt} ${this.toVar}`;
      }
      })();

      // Generate the step.
      let stepPart = this.stepVar ?
        `${idx} += ${this.stepVar}`
      : known ?
        namedIndex ?
          from <= to ? `++${idx}` : `--${idx}`
        :
          from <= to ? `${idx}++` : `${idx}--`
      :
        namedIndex ?
          `${cond} ? ++${idx} : --${idx}`
        :
          `${cond} ? ${idx}++ : ${idx}--`;

      if (namedIndex) { varPart  = `${idxName} = ${varPart}`; }
      if (namedIndex) { stepPart = `${idxName} = ${stepPart}`; }

      // The final loop body.
      return [this.makeCode(`${varPart}; ${condPart}; ${stepPart}`)];
    }


    // When used as a value, expand the range into the equivalent array.
    compileArray(o) {
      let args, body;
      const known = (this.fromNum != null) && (this.toNum != null);
      if (known && (Math.abs(this.fromNum - this.toNum) <= 20)) {
        const range = __range__(this.fromNum, this.toNum, true);
        if (this.exclusive) { range.pop(); }
        return [this.makeCode(`[${ range.join(', ') }]`)];
      }
      const idt    = this.tab + TAB;
      const i      = o.scope.freeVariable('i', {single: true});
      const result = o.scope.freeVariable('results');
      const pre    = `\n${idt}${result} = [];`;
      if (known) {
        o.index = i;
        body    = fragmentsToText(this.compileNode(o));
      } else {
        const vars    = `${i} = ${this.fromC}` + (this.toC !== this.toVar ? `, ${this.toC}` : '');
        const cond    = `${this.fromVar} <= ${this.toVar}`;
        body    = `var ${vars}; ${cond} ? ${i} <${this.equals} ${this.toVar} : ${i} >${this.equals} ${this.toVar}; ${cond} ? ${i}++ : ${i}--`;
      }
      const post   = `{ ${result}.push(${i}); }\n${idt}return ${result};\n${o.indent}`;
      const hasArgs = node => node != null ? node.contains(isLiteralArguments) : undefined;
      if (hasArgs(this.from) || hasArgs(this.to)) { args   = ', arguments'; }
      return [this.makeCode(`(function() {${pre}\n${idt}for (${body})${post}}).apply(this${args != null ? args : ''})`)];
    }
  };
  Range.initClass();
  return Range;
})());

//### Slice

// An array slice literal. Unlike JavaScript's `Array#slice`, the second parameter
// specifies the index of the end of the slice, just as the first parameter
// is the index of the beginning.
exports.Slice = (Slice = (function() {
  Slice = class Slice extends Base {
    static initClass() {
  
      this.prototype.children = ['range'];
    }

    constructor(range) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.range = range;
      super();
    }

    // We have to be careful when trying to slice through the end of the array,
    // `9e9` is used because not all implementations respect `undefined` or `1/0`.
    // `9e9` should be safe because `9e9` > `2**32`, the max array length.
    compileNode(o) {
      let toStr;
      let compiled;
      const {to, from} = this.range;
      const fromCompiled = (from && from.compileToFragments(o, LEVEL_PAREN)) || [this.makeCode('0')];
      // TODO: jwalton - move this into the 'if'?
      if (to) {
        compiled     = to.compileToFragments(o, LEVEL_PAREN);
        const compiledText = fragmentsToText(compiled);
        if (!(!this.range.exclusive && (+compiledText === -1))) {
          toStr = ', ' + (() => {
            if (this.range.exclusive) {
            return compiledText;
          } else if (to.isNumber()) {
            return `${+compiledText + 1}`;
          } else {
            compiled = to.compileToFragments(o, LEVEL_ACCESS);
            return `+${fragmentsToText(compiled)} + 1 || 9e9`;
          }
          })();
        }
      }
      return [this.makeCode(`.slice(${ fragmentsToText(fromCompiled) }${ toStr || '' })`)];
    }
  };
  Slice.initClass();
  return Slice;
})());

//### Obj

// An object literal, nothing fancy.
exports.Obj = (Obj = (function() {
  Obj = class Obj extends Base {
    static initClass() {
  
      this.prototype.children = ['properties'];
    }
    constructor(props, generated) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      if (generated == null) { generated = false; }
      this.generated = generated;
      this.objects = (this.properties = props || []);
    }

    compileNode(o) {
      let dynamicIndex, oref, prop;
      const props = this.properties;
      if (this.generated) {
        for (let node of Array.from(props)) {
          if (node instanceof Value) {
            node.error('cannot have an implicit value in an implicit object');
          }
        }
      }
      for (dynamicIndex = 0; dynamicIndex < props.length; dynamicIndex++) { prop = props[dynamicIndex]; if ((prop.variable || prop).base instanceof Parens) { break; } }
      const hasDynamic  = dynamicIndex < props.length;
      const idt         = (o.indent += TAB);
      const lastNoncom  = this.lastNonComment(this.properties);
      const answer = [];
      if (hasDynamic) {
        oref = o.scope.freeVariable('obj');
        answer.push(this.makeCode(`(\n${idt}${oref} = `));
      }
      answer.push(this.makeCode(`{${(props.length === 0) || (dynamicIndex === 0) ? '}' : '\n'}`));
      for (let i = 0; i < props.length; i++) {
        prop = props[i];
        if (i === dynamicIndex) {
          if (i !== 0) { answer.push(this.makeCode(`\n${idt}}`)); }
          answer.push(this.makeCode(',\n'));
        }
        const join = (i === (props.length - 1)) || (i === (dynamicIndex - 1)) ?
          ''
        : (prop === lastNoncom) || prop instanceof Comment ?
          '\n'
        :
          ',\n';
        let indent = prop instanceof Comment ? '' : idt;
        if (hasDynamic && (i < dynamicIndex)) { indent += TAB; }
        if (prop instanceof Assign) {
          if (prop.context !== 'object') {
            prop.operatorToken.error(`unexpected ${prop.operatorToken.value}`);
          }
          if (prop.variable instanceof Value && prop.variable.hasProperties()) {
            prop.variable.error('invalid object key');
          }
        }
        if (prop instanceof Value && prop.this) {
          prop = new Assign(prop.properties[0].name, prop, 'object');
        }
        if (!(prop instanceof Comment)) {
          if (i < dynamicIndex) {
            if (!(prop instanceof Assign)) {
              prop = new Assign(prop, prop, 'object');
            }
          } else {
            var key, value;
            if (prop instanceof Assign) {
              key = prop.variable;
              ({
                value
              } = prop);
            } else {
              [key, value] = Array.from(prop.base.cache(o));
              if (key instanceof IdentifierLiteral) { key = new PropertyName(key.value); }
            }
            prop = new Assign((new Value((new IdentifierLiteral(oref)), [new Access(key)])), value);
          }
        }
        if (indent) { answer.push(this.makeCode(indent)); }
        answer.push(...Array.from(prop.compileToFragments(o, LEVEL_TOP) || []));
        if (join) { answer.push(this.makeCode(join)); }
      }
      if (hasDynamic) {
        answer.push(this.makeCode(`,\n${idt}${oref}\n${this.tab})`));
      } else {
        if (props.length !== 0) { answer.push(this.makeCode(`\n${this.tab}}`)); }
      }
      if (this.front && !hasDynamic) { return this.wrapInBraces(answer); } else { return answer; }
    }

    assigns(name) {
      for (let prop of Array.from(this.properties)) { if (prop.assigns(name)) { return true; } }
      return false;
    }
  };
  Obj.initClass();
  return Obj;
})());

//### Arr

// An array literal.
exports.Arr = (Arr = (function() {
  Arr = class Arr extends Base {
    static initClass() {
  
      this.prototype.children = ['objects'];
    }
    constructor(objs) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.objects = objs || [];
    }

    compileNode(o) {
      if (!this.objects.length) { return [this.makeCode('[]')]; }
      o.indent += TAB;
      let answer = Splat.compileSplattedArray(o, this.objects);
      if (answer.length) { return answer; }

      answer = [];
      const compiledObjs = (Array.from(this.objects).map((obj) => obj.compileToFragments(o, LEVEL_LIST)));
      for (let index = 0; index < compiledObjs.length; index++) {
        const fragments = compiledObjs[index];
        if (index) {
          answer.push(this.makeCode(", "));
        }
        answer.push(...Array.from(fragments || []));
      }
      if (fragmentsToText(answer).indexOf('\n') >= 0) {
        answer.unshift(this.makeCode(`[\n${o.indent}`));
        answer.push(this.makeCode(`\n${this.tab}]`));
      } else {
        answer.unshift(this.makeCode("["));
        answer.push(this.makeCode("]"));
      }
      return answer;
    }

    assigns(name) {
      for (let obj of Array.from(this.objects)) { if (obj.assigns(name)) { return true; } }
      return false;
    }
  };
  Arr.initClass();
  return Arr;
})());

//### Class

// The CoffeeScript class definition.
// Initialize a **Class** with its name, an optional superclass, and a
// list of prototype property assignments.
exports.Class = (Class = (function() {
  Class = class Class extends Base {
    static initClass() {
  
      this.prototype.children = ['variable', 'parent', 'body'];
  
      this.prototype.defaultClassVariableName = '_Class';
    }
    constructor(variable, parent, body) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.variable = variable;
      this.parent = parent;
      if (body == null) { body = new Block; }
      this.body = body;
      this.boundFuncs = [];
      this.body.classBody = true;
    }

    // Figure out the appropriate name for the constructor function of this class.
    determineName() {
      if (!this.variable) { return this.defaultClassVariableName; }
      const tail = this.variable.properties[this.variable.properties.length - 1];
      const node = tail ?
        tail instanceof Access && tail.name
      :
        this.variable.base;
      if (!(node instanceof IdentifierLiteral) && !(node instanceof PropertyName)) {
        return this.defaultClassVariableName;
      }
      const name = node.value;
      if (!tail) {
        const message = isUnassignable(name);
        if (message) { this.variable.error(message); }
      }
      if (Array.from(JS_FORBIDDEN).includes(name)) { return `_${name}`; } else { return name; }
    }

    // For all `this`-references and bound functions in the class definition,
    // `this` is the Class being constructed.
    setContext(name) {
      return this.body.traverseChildren(false, function(node) {
        if (node.classBody) { return false; }
        if (node instanceof ThisLiteral) {
          return node.value    = name;
        } else if (node instanceof Code) {
          if (node.bound) { return node.context  = name; }
        }
      });
    }

    // Ensure that all functions bound to the instance are proxied in the
    // constructor.
    addBoundFunctions(o) {
      for (let bvar of Array.from(this.boundFuncs)) {
        const lhs = (new Value((new ThisLiteral), [new Access(bvar)])).compile(o);
        this.ctor.body.unshift(new Literal(`${lhs} = ${utility('bind', o)}(${lhs}, this)`));
      }
    }

    // Merge the properties from a top-level object as prototypal properties
    // on the class.
    addProperties(node, name, o) {
      const props = node.base.properties.slice();
      const exprs = (() => {
        let assign;
        const result = [];
        while ((assign = props.shift())) {
          if (assign instanceof Assign) {
            const {
              base
            } = assign.variable;
            delete assign.context;
            const func = assign.value;
            if (base.value === 'constructor') {
              if (this.ctor) {
                assign.error('cannot define more than one constructor in a class');
              }
              if (func.bound) {
                assign.error('cannot define a constructor as a bound function');
              }
              if (func instanceof Code) {
                assign = (this.ctor = func);
              } else {
                this.externalCtor = o.classScope.freeVariable('ctor');
                assign = new Assign(new IdentifierLiteral(this.externalCtor), func);
              }
            } else {
              if (assign.variable.this) {
                func.static = true;
              } else {
                const acc = base.isComplex() ? new Index(base) : new Access(base);
                assign.variable = new Value(new IdentifierLiteral(name), [(new Access(new PropertyName('prototype'))), acc]);
                if (func instanceof Code && func.bound) {
                  this.boundFuncs.push(base);
                  func.bound = false;
                }
              }
            }
          }
          result.push(assign);
        }
        return result;
      })();
      return compact(exprs);
    }

    // Walk the body of the class, looking for prototype properties to be converted
    // and tagging static assignments.
    walkBody(name, o) {
      return this.traverseChildren(false, child => {
        let cont = true;
        if (child instanceof Class) { return false; }
        if (child instanceof Block) {
          let exps;
          const iterable = (exps = child.expressions);
          for (let i = 0; i < iterable.length; i++) {
            const node = iterable[i];
            if (node instanceof Assign && node.variable.looksStatic(name)) {
              node.value.static = true;
            } else if (node instanceof Value && node.isObject(true)) {
              cont = false;
              exps[i] = this.addProperties(node, name, o);
            }
          }
          child.expressions = (exps = flatten(exps));
        }
        return cont && !(child instanceof Class);
      });
    }

    // `use strict` (and other directives) must be the first expression statement(s)
    // of a function body. This method ensures the prologue is correctly positioned
    // above the `constructor`.
    hoistDirectivePrologue() {
      let node;
      let index = 0;
      const {expressions} = this.body;
      while (((node = expressions[index]) && node instanceof Comment) ||
        (node instanceof Value && node.isString())) { ++index; }
      return this.directives = expressions.splice(0, index);
    }

    // Make sure that a constructor is defined for the class, and properly
    // configured.
    ensureConstructor(name) {
      if (!this.ctor) {
        this.ctor = new Code;
        if (this.externalCtor) {
          this.ctor.body.push(new Literal(`${this.externalCtor}.apply(this, arguments)`));
        } else if (this.parent) {
          this.ctor.body.push(new Literal(`${name}.__super__.constructor.apply(this, arguments)`));
        }
        this.ctor.body.makeReturn();
        this.body.expressions.unshift(this.ctor);
      }
      this.ctor.ctor = (this.ctor.name = name);
      this.ctor.klass = null;
      return this.ctor.noReturn = true;
    }

    // Instead of generating the JavaScript string directly, we build up the
    // equivalent syntax tree and compile that, in pieces. You can see the
    // constructor, property assignments, and inheritance getting built out below.
    compileNode(o) {
      let argumentsNode, jumpNode;
      if (jumpNode = this.body.jumps()) {
        jumpNode.error('Class bodies cannot contain pure statements');
      }
      if (argumentsNode = this.body.contains(isLiteralArguments)) {
        argumentsNode.error("Class bodies shouldn't reference arguments");
      }

      const name  = this.determineName();
      const lname = new IdentifierLiteral(name);
      const func  = new Code([], Block.wrap([this.body]));
      const args  = [];
      o.classScope = func.makeScope(o.scope);

      this.hoistDirectivePrologue();
      this.setContext(name);
      this.walkBody(name, o);
      this.ensureConstructor(name);
      this.addBoundFunctions(o);
      this.body.spaced = true;
      this.body.expressions.push(lname);

      if (this.parent) {
        const superClass = new IdentifierLiteral(o.classScope.freeVariable('superClass', {reserve: false}));
        this.body.expressions.unshift(new Extends(lname, superClass));
        func.params.push(new Param(superClass));
        args.push(this.parent);
      }

      this.body.expressions.unshift(...Array.from(this.directives || []));

      let klass = new Parens(new Call(func, args));
      if (this.variable) { klass = new Assign(this.variable, klass, null, { moduleDeclaration: this.moduleDeclaration }); }
      return klass.compileToFragments(o);
    }
  };
  Class.initClass();
  return Class;
})());

//### Import and Export

exports.ModuleDeclaration = (ModuleDeclaration = (function() {
  ModuleDeclaration = class ModuleDeclaration extends Base {
    static initClass() {
  
      this.prototype.children = ['clause', 'source'];
  
      this.prototype.isStatement = YES;
      this.prototype.jumps =       THIS;
      this.prototype.makeReturn =  THIS;
    }
    constructor(clause, source) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.clause = clause;
      this.source = source;
      this.checkSource();
    }

    checkSource() {
      if ((this.source != null) && this.source instanceof StringWithInterpolations) {
        return this.source.error('the name of the module to be imported from must be an uninterpolated string');
      }
    }

    checkScope(o, moduleDeclarationType) {
      if (o.indent.length !== 0) {
        return this.error(`${moduleDeclarationType} statements must be at top-level scope`);
      }
    }
  };
  ModuleDeclaration.initClass();
  return ModuleDeclaration;
})());

exports.ImportDeclaration = (ImportDeclaration = class ImportDeclaration extends ModuleDeclaration {
  compileNode(o) {
    this.checkScope(o, 'import');
    o.importedSymbols = [];

    const code = [];
    code.push(this.makeCode(`${this.tab}import `));
    if (this.clause != null) { code.push(...Array.from(this.clause.compileNode(o) || [])); }

    if ((this.source != null ? this.source.value : undefined) != null) {
      if (this.clause !== null) { code.push(this.makeCode(' from ')); }
      code.push(this.makeCode(this.source.value));
    }

    code.push(this.makeCode(';'));
    return code;
  }
});

exports.ImportClause = (ImportClause = (function() {
  ImportClause = class ImportClause extends Base {
    static initClass() {
  
      this.prototype.children = ['defaultBinding', 'namedImports'];
    }
    constructor(defaultBinding, namedImports) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.defaultBinding = defaultBinding;
      this.namedImports = namedImports;
    }

    compileNode(o) {
      const code = [];

      if (this.defaultBinding != null) {
        code.push(...Array.from(this.defaultBinding.compileNode(o) || []));
        if (this.namedImports != null) { code.push(this.makeCode(', ')); }
      }

      if (this.namedImports != null) {
        code.push(...Array.from(this.namedImports.compileNode(o) || []));
      }

      return code;
    }
  };
  ImportClause.initClass();
  return ImportClause;
})());

exports.ExportDeclaration = (ExportDeclaration = class ExportDeclaration extends ModuleDeclaration {
  compileNode(o) {
    this.checkScope(o, 'export');

    let code = [];
    code.push(this.makeCode(`${this.tab}export `));
    if (this instanceof ExportDefaultDeclaration) { code.push(this.makeCode('default ')); }

    if (!(this instanceof ExportDefaultDeclaration) &&
       (this.clause instanceof Assign || this.clause instanceof Class)) {
      // Prevent exporting an anonymous class; all exported members must be named
      if (this.clause instanceof Class && !this.clause.variable) {
        this.clause.error('anonymous classes cannot be exported');
      }

      // When the ES2015 `class` keyword is supported, don’t add a `var` here
      code.push(this.makeCode('var '));
      this.clause.moduleDeclaration = 'export';
    }

    if ((this.clause.body != null) && this.clause.body instanceof Block) {
      code = code.concat(this.clause.compileToFragments(o, LEVEL_TOP));
    } else {
      code = code.concat(this.clause.compileNode(o));
    }

    if ((this.source != null ? this.source.value : undefined) != null) { code.push(this.makeCode(` from ${this.source.value}`)); }
    code.push(this.makeCode(';'));
    return code;
  }
});

exports.ExportNamedDeclaration = (ExportNamedDeclaration = class ExportNamedDeclaration extends ExportDeclaration {});

exports.ExportDefaultDeclaration = (ExportDefaultDeclaration = class ExportDefaultDeclaration extends ExportDeclaration {});

exports.ExportAllDeclaration = (ExportAllDeclaration = class ExportAllDeclaration extends ExportDeclaration {});

exports.ModuleSpecifierList = (ModuleSpecifierList = (function() {
  ModuleSpecifierList = class ModuleSpecifierList extends Base {
    static initClass() {
  
      this.prototype.children = ['specifiers'];
    }
    constructor(specifiers) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.specifiers = specifiers;
    }

    compileNode(o) {
      const code = [];
      o.indent += TAB;
      const compiledList = (Array.from(this.specifiers).map((specifier) => specifier.compileToFragments(o, LEVEL_LIST)));

      if (this.specifiers.length !== 0) {
        code.push(this.makeCode(`{\n${o.indent}`));
        for (let index = 0; index < compiledList.length; index++) {
          const fragments = compiledList[index];
          if (index) { code.push(this.makeCode(`,\n${o.indent}`)); }
          code.push(...Array.from(fragments || []));
        }
        code.push(this.makeCode("\n}"));
      } else {
        code.push(this.makeCode('{}'));
      }
      return code;
    }
  };
  ModuleSpecifierList.initClass();
  return ModuleSpecifierList;
})());

exports.ImportSpecifierList = (ImportSpecifierList = class ImportSpecifierList extends ModuleSpecifierList {});

exports.ExportSpecifierList = (ExportSpecifierList = class ExportSpecifierList extends ModuleSpecifierList {});

exports.ModuleSpecifier = (ModuleSpecifier = (function() {
  ModuleSpecifier = class ModuleSpecifier extends Base {
    static initClass() {
  
      this.prototype.children = ['original', 'alias'];
    }
    constructor(original, alias, moduleDeclarationType) {
      // The name of the variable entering the local scope
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.original = original;
      this.alias = alias;
      this.moduleDeclarationType = moduleDeclarationType;
      this.identifier = (this.alias != null) ? this.alias.value : this.original.value;
    }

    compileNode(o) {
      o.scope.find(this.identifier, this.moduleDeclarationType);
      const code = [];
      code.push(this.makeCode(this.original.value));
      if (this.alias != null) { code.push(this.makeCode(` as ${this.alias.value}`)); }
      return code;
    }
  };
  ModuleSpecifier.initClass();
  return ModuleSpecifier;
})());

exports.ImportSpecifier = (ImportSpecifier = class ImportSpecifier extends ModuleSpecifier {
  constructor(imported, local) {
    super(imported, local, 'import');
  }

  compileNode(o) {
    // Per the spec, symbols can’t be imported multiple times
    // (e.g. `import { foo, foo } from 'lib'` is invalid)
    if (Array.from(o.importedSymbols).includes(this.identifier) || o.scope.check(this.identifier)) {
      this.error(`'${this.identifier}' has already been declared`);
    } else {
      o.importedSymbols.push(this.identifier);
    }
    return super.compileNode(o);
  }
});

exports.ImportDefaultSpecifier = (ImportDefaultSpecifier = class ImportDefaultSpecifier extends ImportSpecifier {});

exports.ImportNamespaceSpecifier = (ImportNamespaceSpecifier = class ImportNamespaceSpecifier extends ImportSpecifier {});

exports.ExportSpecifier = (ExportSpecifier = class ExportSpecifier extends ModuleSpecifier {
  constructor(local, exported) {
    super(local, exported, 'export');
  }
});

//### Assign

// The **Assign** is used to assign a local variable to value, or to set the
// property of an object -- including within object literals.
exports.Assign = (Assign = (function() {
  Assign = class Assign extends Base {
    static initClass() {
  
      this.prototype.children = ['variable', 'value'];
    }
    constructor(variable, value, context, options) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.variable = variable;
      this.value = value;
      this.context = context;
      if (options == null) { options = {}; }
      ({param: this.param, subpattern: this.subpattern, operatorToken: this.operatorToken, moduleDeclaration: this.moduleDeclaration} = options);
    }

    isStatement(o) {
      return ((o != null ? o.level : undefined) === LEVEL_TOP) && (this.context != null) && (this.moduleDeclaration || Array.from(this.context).includes("?"));
    }

    checkAssignability(o, varBase) {
      if (Object.prototype.hasOwnProperty.call(o.scope.positions, varBase.value) &&
         (o.scope.variables[o.scope.positions[varBase.value]].type === 'import')) {
        return varBase.error(`'${varBase.value}' is read-only`);
      }
    }

    assigns(name) {
      return this[this.context === 'object' ? 'value' : 'variable'].assigns(name);
    }

    unfoldSoak(o) {
      return unfoldSoak(o, this, 'variable');
    }

    // Compile an assignment, delegating to `compilePatternMatch` or
    // `compileSplice` if appropriate. Keep track of the name of the base object
    // we've been assigned to, for correct internal references. If the variable
    // has not been seen yet within the current scope, declare it.
    compileNode(o) {
      let isValue;
      if (isValue = this.variable instanceof Value) {
        if (this.variable.isArray() || this.variable.isObject()) { return this.compilePatternMatch(o); }
        if (this.variable.isSplice()) { return this.compileSplice(o); }
        if (['||=', '&&=', '?='].includes(this.context)) { return this.compileConditional(o); }
        if (['**=', '//=', '%%='].includes(this.context)) { return this.compileSpecialMath(o); }
      }
      if (this.value instanceof Code) {
        if (this.value.static) {
          this.value.klass = this.variable.base;
          this.value.name  = this.variable.properties[0];
          this.value.variable = this.variable;
        } else if ((this.variable.properties != null ? this.variable.properties.length : undefined) >= 2) {
          const adjustedLength = Math.max(this.variable.properties.length, 2), properties = this.variable.properties.slice(0, adjustedLength - 2), prototype = this.variable.properties[adjustedLength - 2], name = this.variable.properties[adjustedLength - 1];
          if ((prototype.name != null ? prototype.name.value : undefined) === 'prototype') {
            this.value.klass = new Value(this.variable.base, properties);
            this.value.name  = name;
            this.value.variable = this.variable;
          }
        }
      }
      if (!this.context) {
        const varBase = this.variable.unwrapAll();
        if (!varBase.isAssignable()) {
          this.variable.error(`'${this.variable.compile(o)}' can't be assigned`);
        }
        if (!(typeof varBase.hasProperties === 'function' ? varBase.hasProperties() : undefined)) {
          // `moduleDeclaration` can be `'import'` or `'export'`
          if (this.moduleDeclaration) {
            this.checkAssignability(o, varBase);
            o.scope.add(varBase.value, this.moduleDeclaration);
          } else if (this.param) {
            o.scope.add(varBase.value, 'var');
          } else {
            this.checkAssignability(o, varBase);
            o.scope.find(varBase.value);
          }
        }
      }

      const val = this.value.compileToFragments(o, LEVEL_LIST);
      if (isValue && this.variable.base instanceof Obj) { this.variable.front = true; }
      const compiledName = this.variable.compileToFragments(o, LEVEL_LIST);

      if (this.context === 'object') {
        let needle;
        if ((needle = fragmentsToText(compiledName), Array.from(JS_FORBIDDEN).includes(needle))) {
          compiledName.unshift(this.makeCode('"'));
          compiledName.push(this.makeCode('"'));
        }
        return compiledName.concat(this.makeCode(": "), val);
      }

      const answer = compiledName.concat(this.makeCode(` ${ this.context || '=' } `), val);
      if (o.level <= LEVEL_LIST) { return answer; } else { return this.wrapInBraces(answer); }
    }

    // Brief implementation of recursive pattern matching, when assigning array or
    // object literals to a value. Peeks at their properties to assign inner names.
    compilePatternMatch(o) {
      let acc, defaultValue, idx, message, olen;
      const top       = o.level === LEVEL_TOP;
      let {value}   = this;
      const {objects} = this.variable.base;
      if (!(olen = objects.length)) {
        const code = value.compileToFragments(o);
        if (o.level >= LEVEL_OP) { return this.wrapInBraces(code); } else { return code; }
      }
      let [obj] = Array.from(objects);
      if ((olen === 1) && obj instanceof Expansion) {
        obj.error('Destructuring assignment has no target');
      }
      const isObject = this.variable.isObject();
      if (top && (olen === 1) && !(obj instanceof Splat)) {
        // Pick the property straight off the value when there’s just one to pick
        // (no need to cache the value into a variable).
        defaultValue = null;
        if (obj instanceof Assign && (obj.context === 'object')) {
          // A regular object pattern-match.
          ({variable: {base: idx}, value: obj} = obj);
          if (obj instanceof Assign) {
            defaultValue = obj.value;
            obj = obj.variable;
          }
        } else {
          if (obj instanceof Assign) {
            defaultValue = obj.value;
            obj = obj.variable;
          }
          idx = isObject ?
            // A shorthand `{a, b, @c} = val` pattern-match.
            obj.this ?
              obj.properties[0].name
            :
              new PropertyName(obj.unwrap().value)
          :
            // A regular array pattern-match.
            new NumberLiteral(0);
        }
        acc   = idx.unwrap() instanceof PropertyName;
        value = new Value(value);
        value.properties.push(new (acc ? Access : Index)(idx));
        message = isUnassignable(obj.unwrap().value);
        if (message) { obj.error(message); }
        if (defaultValue) { value = new Op('?', value, defaultValue); }
        return new Assign(obj, value, null, {param: this.param}).compileToFragments(o, LEVEL_TOP);
      }
      let vvar     = value.compileToFragments(o, LEVEL_LIST);
      let vvarText = fragmentsToText(vvar);
      const assigns  = [];
      let expandedIdx = false;
      // Make vvar into a simple variable if it isn't already.
      if (!(value.unwrap() instanceof IdentifierLiteral) || this.variable.assigns(vvarText)) {
        let ref;
        assigns.push([this.makeCode(`${ (ref = o.scope.freeVariable('ref')) } = `), ...Array.from(vvar)]);
        vvar = [this.makeCode(ref)];
        vvarText = ref;
      }
      for (let i = 0; i < objects.length; i++) {
        var ivar, name, rest, val;
        obj = objects[i];
        idx = i;
        if (!expandedIdx && obj instanceof Splat) {
          name = obj.name.unwrap().value;
          obj = obj.unwrap();
          val = `${olen} <= ${vvarText}.length ? ${ utility('slice', o) }.call(${vvarText}, ${i}`;
          if (rest = olen - i - 1) {
            ivar = o.scope.freeVariable('i', {single: true});
            val += `, ${ivar} = ${vvarText}.length - ${rest}) : (${ivar} = ${i}, [])`;
          } else {
            val += ") : []";
          }
          val   = new Literal(val);
          expandedIdx = `${ivar}++`;
        } else if (!expandedIdx && obj instanceof Expansion) {
          if (rest = olen - i - 1) {
            if (rest === 1) {
              expandedIdx = `${vvarText}.length - 1`;
            } else {
              ivar = o.scope.freeVariable('i', {single: true});
              val = new Literal(`${ivar} = ${vvarText}.length - ${rest}`);
              expandedIdx = `${ivar}++`;
              assigns.push(val.compileToFragments(o, LEVEL_LIST));
            }
          }
          continue;
        } else {
          if (obj instanceof Splat || obj instanceof Expansion) {
            obj.error("multiple splats/expansions are disallowed in an assignment");
          }
          defaultValue = null;
          if (obj instanceof Assign && (obj.context === 'object')) {
            // A regular object pattern-match.
            ({variable: {base: idx}, value: obj} = obj);
            if (obj instanceof Assign) {
              defaultValue = obj.value;
              obj = obj.variable;
            }
          } else {
            if (obj instanceof Assign) {
              defaultValue = obj.value;
              obj = obj.variable;
            }
            idx = isObject ?
              // A shorthand `{a, b, @c} = val` pattern-match.
              obj.this ?
                obj.properties[0].name
              :
                new PropertyName(obj.unwrap().value)
            :
              // A regular array pattern-match.
              new Literal(expandedIdx || idx);
          }
          name = obj.unwrap().value;
          acc = idx.unwrap() instanceof PropertyName;
          val = new Value(new Literal(vvarText), [new (acc ? Access : Index)(idx)]);
          if (defaultValue) { val = new Op('?', val, defaultValue); }
        }
        if (name != null) {
          message = isUnassignable(name);
          if (message) { obj.error(message); }
        }
        assigns.push(new Assign(obj, val, null, {param: this.param, subpattern: true}).compileToFragments(o, LEVEL_LIST));
      }
      if (!top && !this.subpattern) { assigns.push(vvar); }
      const fragments = this.joinFragmentArrays(assigns, ', ');
      if (o.level < LEVEL_LIST) { return fragments; } else { return this.wrapInBraces(fragments); }
    }

    // When compiling a conditional assignment, take care to ensure that the
    // operands are only evaluated once, even though we have to reference them
    // more than once.
    compileConditional(o) {
      const [left, right] = Array.from(this.variable.cacheReference(o));
      // Disallow conditional assignment of undefined variables.
      if (!left.properties.length && left.base instanceof Literal &&
             !(left.base instanceof ThisLiteral) && !o.scope.check(left.base.value)) {
        this.variable.error(`the variable \"${left.base.value}\" can't be assigned with ${this.context} because it has not been declared before`);
      }
      if (Array.from(this.context).includes("?")) {
        o.isExistentialEquals = true;
        return new If(new Existence(left), right, {type: 'if'}).addElse(new Assign(right, this.value, '=')).compileToFragments(o);
      } else {
        const fragments = new Op(this.context.slice(0, -1), left, new Assign(right, this.value, '=')).compileToFragments(o);
        if (o.level <= LEVEL_LIST) { return fragments; } else { return this.wrapInBraces(fragments); }
      }
    }

    // Convert special math assignment operators like `a **= b` to the equivalent
    // extended form `a = a ** b` and then compiles that.
    compileSpecialMath(o) {
      const [left, right] = Array.from(this.variable.cacheReference(o));
      return new Assign(left, new Op(this.context.slice(0, -1), right, this.value)).compileToFragments(o);
    }

    // Compile the assignment from an array splice literal, using JavaScript's
    // `Array#splice` method.
    compileSplice(o) {
      let fromDecl, fromRef;
      let {range: {from, to, exclusive}} = this.variable.properties.pop();
      const name = this.variable.compile(o);
      if (from) {
        [fromDecl, fromRef] = Array.from(this.cacheToCodeFragments(from.cache(o, LEVEL_OP)));
      } else {
        fromDecl = (fromRef = '0');
      }
      if (to) {
        if ((from != null ? from.isNumber() : undefined) && to.isNumber()) {
          to = to.compile(o) - fromRef;
          if (!exclusive) { to += 1; }
        } else {
          to = to.compile(o, LEVEL_ACCESS) + ' - ' + fromRef;
          if (!exclusive) { to += ' + 1'; }
        }
      } else {
        to = "9e9";
      }
      const [valDef, valRef] = Array.from(this.value.cache(o, LEVEL_LIST));
      const answer = [].concat(this.makeCode(`[].splice.apply(${name}, [${fromDecl}, ${to}].concat(`), valDef, this.makeCode(")), "), valRef);
      if (o.level > LEVEL_TOP) { return this.wrapInBraces(answer); } else { return answer; }
    }
  };
  Assign.initClass();
  return Assign;
})());

//### Code

// A function definition. This is the only node that creates a new Scope.
// When for the purposes of walking the contents of a function body, the Code
// has no *children* -- they're within the inner scope.
exports.Code = (Code = (function() {
  Code = class Code extends Base {
    static initClass() {
  
      this.prototype.children = ['params', 'body'];
  
      this.prototype.jumps = NO;
    }
    constructor(params, body, tag) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.params      = params || [];
      this.body        = body || new Block;
      this.bound       = tag === 'boundfunc';
      this.isGenerator = !!this.body.contains(node => (node instanceof Op && node.isYield()) || node instanceof YieldReturn);
    }

    isStatement() { return !!this.ctor; }

    makeScope(parentScope) { return new Scope(parentScope, this.body, this); }

    // Compilation creates a new scope unless explicitly asked to share with the
    // outer scope. Handles splat parameters in the parameter list by peeking at
    // the JavaScript `arguments` object. If the function is bound with the `=>`
    // arrow, generates a wrapper that saves the current value of `this` through
    // a closure.
    compileNode(o) {

      let i, param, splats;
      let p;
      if (this.bound && (o.scope.method != null ? o.scope.method.bound : undefined)) {
        this.context = o.scope.method.context;
      }

      // Handle bound functions early.
      if (this.bound && !this.context) {
        this.context = '_this';
        const wrapper = new Code([new Param(new IdentifierLiteral(this.context))], new Block([this]));
        const boundfunc = new Call(wrapper, [new ThisLiteral]);
        boundfunc.updateLocationDataIfMissing(this.locationData);
        return boundfunc.compileNode(o);
      }

      o.scope         = del(o, 'classScope') || this.makeScope(o.scope);
      o.scope.shared  = del(o, 'sharedScope');
      o.indent        += TAB;
      delete o.bare;
      delete o.isExistentialEquals;
      const params = [];
      const exprs  = [];
      for (param of Array.from(this.params)) {
        if (!(param instanceof Expansion)) {
          o.scope.parameter(param.asReference(o));
        }
      }
      for (param of Array.from(this.params)) {
        if (param.splat || param instanceof Expansion) {
          for (p of Array.from(this.params)) {
            if (!(p instanceof Expansion) && p.name.value) {
              o.scope.add(p.name.value, 'var', true);
            }
          }
          splats = new Assign(new Value(new Arr((() => {
            const result = [];
            for (p of Array.from(this.params)) {               result.push(p.asReference(o));
            }
            return result;
          })())),
                              new Value(new IdentifierLiteral('arguments')));
          break;
        }
      }
      for (param of Array.from(this.params)) {
        var ref, val;
        if (param.isComplex()) {
          val = (ref = param.asReference(o));
          if (param.value) { val = new Op('?', ref, param.value); }
          exprs.push(new Assign(new Value(param.name), val, '=', {param: true}));
        } else {
          ref = param;
          if (param.value) {
            const lit = new Literal(ref.name.value + ' == null');
            val = new Assign(new Value(param.name), param.value, '=');
            exprs.push(new If(lit, val));
          }
        }
        if (!splats) { params.push(ref); }
      }
      const wasEmpty = this.body.isEmpty();
      if (splats) { exprs.unshift(splats); }
      if (exprs.length) { this.body.expressions.unshift(...Array.from(exprs || [])); }
      for (i = 0; i < params.length; i++) {
        p = params[i];
        params[i] = p.compileToFragments(o);
        o.scope.parameter(fragmentsToText(params[i]));
      }
      const uniqs = [];
      this.eachParamName(function(name, node) {
        if (Array.from(uniqs).includes(name)) { node.error(`multiple parameters named ${name}`); }
        return uniqs.push(name);
      });
      if (!wasEmpty && !this.noReturn) { this.body.makeReturn(); }
      let code = 'function';
      if (this.isGenerator) { code += '*'; }
      if (this.ctor) { code += ' ' + this.name; }
      code += '(';
      let answer = [this.makeCode(code)];
      for (i = 0; i < params.length; i++) {
        p = params[i];
        if (i) { answer.push(this.makeCode(", ")); }
        answer.push(...Array.from(p || []));
      }
      answer.push(this.makeCode(') {'));
      if (!this.body.isEmpty()) { answer = answer.concat(this.makeCode("\n"), this.body.compileWithDeclarations(o), this.makeCode(`\n${this.tab}`)); }
      answer.push(this.makeCode('}'));

      if (this.ctor) { return [this.makeCode(this.tab), ...Array.from(answer)]; }
      if (this.front || (o.level >= LEVEL_ACCESS)) { return this.wrapInBraces(answer); } else { return answer; }
    }

    eachParamName(iterator) {
      return Array.from(this.params).map((param) => param.eachName(iterator));
    }

    // Short-circuit `traverseChildren` method to prevent it from crossing scope boundaries
    // unless `crossScope` is `true`.
    traverseChildren(crossScope, func) {
      if (crossScope) { return super.traverseChildren(crossScope, func); }
    }
  };
  Code.initClass();
  return Code;
})());

//### Param

// A parameter in a function definition. Beyond a typical JavaScript parameter,
// these parameters can also attach themselves to the context of the function,
// as well as be a splat, gathering up a group of parameters into an array.
exports.Param = (Param = (function() {
  Param = class Param extends Base {
    static initClass() {
  
      this.prototype.children = ['name', 'value'];
    }
    constructor(name, value, splat) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.name = name;
      this.value = value;
      this.splat = splat;
      const message = isUnassignable(this.name.unwrapAll().value);
      if (message) { this.name.error(message); }
      if (this.name instanceof Obj && this.name.generated) {
        const token = this.name.objects[0].operatorToken;
        token.error(`unexpected ${token.value}`);
      }
    }

    compileToFragments(o) {
      return this.name.compileToFragments(o, LEVEL_LIST);
    }

    asReference(o) {
      if (this.reference) { return this.reference; }
      let node = this.name;
      if (node.this) {
        let name = node.properties[0].name.value;
        if (Array.from(JS_FORBIDDEN).includes(name)) { name = `_${name}`; }
        node = new IdentifierLiteral(o.scope.freeVariable(name));
      } else if (node.isComplex()) {
        node = new IdentifierLiteral(o.scope.freeVariable('arg'));
      }
      node = new Value(node);
      if (this.splat) { node = new Splat(node); }
      node.updateLocationDataIfMissing(this.locationData);
      return this.reference = node;
    }

    isComplex() {
      return this.name.isComplex();
    }

    // Iterates the name or names of a `Param`.
    // In a sense, a destructured parameter represents multiple JS parameters. This
    // method allows to iterate them all.
    // The `iterator` function will be called as `iterator(name, node)` where
    // `name` is the name of the parameter and `node` is the AST node corresponding
    // to that name.
    eachName(iterator, name){
      if (name == null) { ({
        name
      } = this); }
      const atParam = obj => iterator(`@${obj.properties[0].name.value}`, obj);
      // * simple literals `foo`
      if (name instanceof Literal) { return iterator(name.value, name); }
      // * at-params `@foo`
      if (name instanceof Value) { return atParam(name); }
      for (let obj of Array.from(name.objects != null ? name.objects : [])) {
        // * destructured parameter with default value
        if (obj instanceof Assign && (obj.context == null)) {
          obj = obj.variable;
        }
        // * assignments within destructured parameters `{foo:bar}`
        if (obj instanceof Assign) {
          // ... possibly with a default value
          if (obj.value instanceof Assign) {
            obj = obj.value;
          }
          this.eachName(iterator, obj.value.unwrap());
        // * splats within destructured parameters `[xs...]`
        } else if (obj instanceof Splat) {
          const node = obj.name.unwrap();
          iterator(node.value, node);
        } else if (obj instanceof Value) {
          // * destructured parameters within destructured parameters `[{a}]`
          if (obj.isArray() || obj.isObject()) {
            this.eachName(iterator, obj.base);
          // * at-params within destructured parameters `{@foo}`
          } else if (obj.this) {
            atParam(obj);
          // * simple destructured parameters {foo}
          } else { iterator(obj.base.value, obj.base); }
        } else if (!(obj instanceof Expansion)) {
          obj.error(`illegal parameter ${obj.compile()}`);
        }
      }
    }
  };
  Param.initClass();
  return Param;
})());

//### Splat

// A splat, either as a parameter to a function, an argument to a call,
// or as part of a destructuring assignment.
exports.Splat = (Splat = (function() {
  Splat = class Splat extends Base {
    static initClass() {
  
      this.prototype.children = ['name'];
  
      this.prototype.isAssignable = YES;
    }

    constructor(name) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.name = name.compile ? name : new Literal(name);
    }

    assigns(name) {
      return this.name.assigns(name);
    }

    compileToFragments(o) {
      return this.name.compileToFragments(o);
    }

    unwrap() { return this.name; }

    // Utility function that converts an arbitrary number of elements, mixed with
    // splats, to a proper array.
    static compileSplattedArray(o, list, apply) {
      let concatPart;
      let node;
      let index = -1;
      while ((node = list[++index]) && !(node instanceof Splat)) { continue; }
      if (index >= list.length) { return []; }
      if (list.length === 1) {
        node = list[0];
        const fragments = node.compileToFragments(o, LEVEL_LIST);
        if (apply) { return fragments; }
        return [].concat(node.makeCode(`${ utility('slice', o) }.call(`), fragments, node.makeCode(")"));
      }
      const args = list.slice(index);
      for (let i = 0; i < args.length; i++) {
        node = args[i];
        const compiledNode = node.compileToFragments(o, LEVEL_LIST);
        args[i] = node instanceof Splat
        ? [].concat(node.makeCode(`${ utility('slice', o) }.call(`), compiledNode, node.makeCode(")"))
        : [].concat(node.makeCode("["), compiledNode, node.makeCode("]"));
      }
      if (index === 0) {
        node = list[0];
        concatPart = (node.joinFragmentArrays(args.slice(1), ', '));
        return args[0].concat(node.makeCode(".concat("), concatPart, node.makeCode(")"));
      }
      let base = ((() => {
        const result = [];
        for (node of Array.from(list.slice(0, index))) {           result.push(node.compileToFragments(o, LEVEL_LIST));
        }
        return result;
      })());
      base = list[0].joinFragmentArrays(base, ', ');
      concatPart = list[index].joinFragmentArrays(args, ', ');
      const last = list[list.length - 1];
      return [].concat(list[0].makeCode("["), base, list[index].makeCode("].concat("), concatPart, last.makeCode(")"));
    }
  };
  Splat.initClass();
  return Splat;
})());

//### Expansion

// Used to skip values inside an array destructuring (pattern matching) or
// parameter list.
exports.Expansion = (Expansion = (function() {
  Expansion = class Expansion extends Base {
    static initClass() {
  
      this.prototype.isComplex = NO;
    }

    compileNode(o) {
      return this.error('Expansion must be used inside a destructuring assignment or parameter list');
    }

    asReference(o) {
      return this;
    }

    eachName(iterator) {}
  };
  Expansion.initClass();
  return Expansion;
})());

//### While

// A while loop, the only sort of low-level loop exposed by CoffeeScript. From
// it, all other loops can be manufactured. Useful in cases where you need more
// flexibility or more speed than a comprehension can provide.
exports.While = (While = (function() {
  While = class While extends Base {
    static initClass() {
  
      this.prototype.children = ['condition', 'guard', 'body'];
  
      this.prototype.isStatement = YES;
    }
    constructor(condition, options) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.condition = (options != null ? options.invert : undefined) ? condition.invert() : condition;
      this.guard     = options != null ? options.guard : undefined;
    }

    makeReturn(res) {
      if (res) {
        return super.makeReturn(...arguments);
      } else {
        this.returns = !this.jumps({loop: true});
        return this;
      }
    }

    addBody(body) {
      this.body = body;
      return this;
    }

    jumps() {
      const {expressions} = this.body;
      if (!expressions.length) { return false; }
      for (let node of Array.from(expressions)) {
        var jumpNode;
        if (jumpNode = node.jumps({loop: true})) { return jumpNode; }
      }
      return false;
    }

    // The main difference from a JavaScript *while* is that the CoffeeScript
    // *while* can be used as a part of a larger expression -- while loops may
    // return an array containing the computed result of each iteration.
    compileNode(o) {
      let rvar;
      o.indent += TAB;
      let set      = '';
      let {body}   = this;
      if (body.isEmpty()) {
        body = this.makeCode('');
      } else {
        if (this.returns) {
          body.makeReturn(rvar = o.scope.freeVariable('results'));
          set  = `${this.tab}${rvar} = [];\n`;
        }
        if (this.guard) {
          if (body.expressions.length > 1) {
            body.expressions.unshift(new If((new Parens(this.guard)).invert(), new StatementLiteral("continue")));
          } else {
            if (this.guard) { body = Block.wrap([new If(this.guard, body)]); }
          }
        }
        body = [].concat(this.makeCode("\n"), (body.compileToFragments(o, LEVEL_TOP)), this.makeCode(`\n${this.tab}`));
      }
      const answer = [].concat(this.makeCode(set + this.tab + "while ("), this.condition.compileToFragments(o, LEVEL_PAREN),
        this.makeCode(") {"), body, this.makeCode("}"));
      if (this.returns) {
        answer.push(this.makeCode(`\n${this.tab}return ${rvar};`));
      }
      return answer;
    }
  };
  While.initClass();
  return While;
})());

//### Op

// Simple Arithmetic and logical operations. Performs some conversion from
// CoffeeScript operations into their JavaScript equivalents.
exports.Op = (Op = (function() {
  let CONVERSIONS = undefined;
  let INVERSIONS = undefined;
  Op = class Op extends Base {
    static initClass() {
  
      // The map of conversions from CoffeeScript to JavaScript symbols.
      CONVERSIONS = {
        '==':        '===',
        '!=':        '!==',
        'of':        'in',
        'yieldfrom': 'yield*'
      };
  
      // The map of invertible operators.
      INVERSIONS = {
        '!==': '===',
        '===': '!=='
      };
  
      this.prototype.children = ['first', 'second'];
    }
    constructor(op, first, second, flip ) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      if (op === 'in') { return new In(first, second); }
      if (op === 'do') {
        return this.generateDo(first);
      }
      if (op === 'new') {
        if (first instanceof Call && !first.do && !first.isNew) { return first.newInstance(); }
        if ((first instanceof Code && first.bound) || first.do) { first = new Parens(first); }
      }
      this.operator = CONVERSIONS[op] || op;
      this.first    = first;
      this.second   = second;
      this.flip     = !!flip;
      return this;
    }

    isNumber() {
      return this.isUnary() && ['+', '-'].includes(this.operator) &&
        this.first instanceof Value && this.first.isNumber();
    }

    isYield() {
      return ['yield', 'yield*'].includes(this.operator);
    }

    isUnary() {
      return !this.second;
    }

    isComplex() {
      return !this.isNumber();
    }

    // Am I capable of
    // [Python-style comparison chaining](https://docs.python.org/3/reference/expressions.html#not-in)?
    isChainable() {
      return ['<', '>', '>=', '<=', '===', '!=='].includes(this.operator);
    }

    invert() {
      let fst, op;
      if (this.isChainable() && this.first.isChainable()) {
        let allInvertable = true;
        let curr = this;
        while (curr && curr.operator) {
          if (allInvertable) { allInvertable = (curr.operator in INVERSIONS); }
          curr = curr.first;
        }
        if (!allInvertable) { return new Parens(this).invert(); }
        curr = this;
        while (curr && curr.operator) {
          curr.invert = !curr.invert;
          curr.operator = INVERSIONS[curr.operator];
          curr = curr.first;
        }
        return this;
      } else if (op = INVERSIONS[this.operator]) {
        this.operator = op;
        if (this.first.unwrap() instanceof Op) {
          this.first.invert();
        }
        return this;
      } else if (this.second) {
        return new Parens(this).invert();
      } else if ((this.operator === '!') && (fst = this.first.unwrap()) instanceof Op &&
                                    ['!', 'in', 'instanceof'].includes(fst.operator)) {
        return fst;
      } else {
        return new Op('!', this);
      }
    }

    unfoldSoak(o) {
      return ['++', '--', 'delete'].includes(this.operator) && unfoldSoak(o, this, 'first');
    }

    generateDo(exp) {
      let ref;
      const passedParams = [];
      const func = exp instanceof Assign && (ref = exp.value.unwrap()) instanceof Code ?
        ref
      :
        exp;
      for (let param of Array.from(func.params || [])) {
        if (param.value) {
          passedParams.push(param.value);
          delete param.value;
        } else {
          passedParams.push(param);
        }
      }
      const call = new Call(exp, passedParams);
      call.do = true;
      return call;
    }

    compileNode(o) {
      const isChain = this.isChainable() && this.first.isChainable();
      // In chains, there's no need to wrap bare obj literals in parens,
      // as the chained expression is wrapped.
      if (!isChain) { this.first.front = this.front; }
      if ((this.operator === 'delete') && o.scope.check(this.first.unwrapAll().value)) {
        this.error('delete operand may not be argument or var');
      }
      if (['--', '++'].includes(this.operator)) {
        const message = isUnassignable(this.first.unwrapAll().value);
        if (message) { this.first.error(message); }
      }
      if (this.isYield()) { return this.compileYield(o); }
      if (this.isUnary()) { return this.compileUnary(o); }
      if (isChain) { return this.compileChain(o); }
      switch (this.operator) {
        case '?':  return this.compileExistence(o);
        case '**': return this.compilePower(o);
        case '//': return this.compileFloorDivision(o);
        case '%%': return this.compileModulo(o);
        default:
          var lhs = this.first.compileToFragments(o, LEVEL_OP);
          var rhs = this.second.compileToFragments(o, LEVEL_OP);
          var answer = [].concat(lhs, this.makeCode(` ${this.operator} `), rhs);
          if (o.level <= LEVEL_OP) { return answer; } else { return this.wrapInBraces(answer); }
      }
    }

    // Mimic Python's chained comparisons when multiple comparison operators are
    // used sequentially. For example:
    //
    //     bin/coffee -e 'console.log 50 < 65 > 10'
    //     true
    compileChain(o) {
      let shared;
      [this.first.second, shared] = Array.from(this.first.second.cache(o));
      const fst = this.first.compileToFragments(o, LEVEL_OP);
      const fragments = fst.concat(this.makeCode(` ${this.invert ? '&&' : '||'} `),
        (shared.compileToFragments(o)), this.makeCode(` ${this.operator} `), (this.second.compileToFragments(o, LEVEL_OP)));
      return this.wrapInBraces(fragments);
    }

    // Keep reference to the left expression, unless this an existential assignment
    compileExistence(o) {
      let fst, ref;
      if (this.first.isComplex()) {
        ref = new IdentifierLiteral(o.scope.freeVariable('ref'));
        fst = new Parens(new Assign(ref, this.first));
      } else {
        fst = this.first;
        ref = fst;
      }
      return new If(new Existence(fst), ref, {type: 'if'}).addElse(this.second).compileToFragments(o);
    }

    // Compile a unary **Op**.
    compileUnary(o) {
      const parts = [];
      const op = this.operator;
      parts.push([this.makeCode(op)]);
      if ((op === '!') && this.first instanceof Existence) {
        this.first.negated = !this.first.negated;
        return this.first.compileToFragments(o);
      }
      if (o.level >= LEVEL_ACCESS) {
        return (new Parens(this)).compileToFragments(o);
      }
      const plusMinus = ['+', '-'].includes(op);
      if (['new', 'typeof', 'delete'].includes(op) ||
                        (plusMinus && this.first instanceof Op && (this.first.operator === op))) { parts.push([this.makeCode(' ')]); }
      if ((plusMinus && this.first instanceof Op) || ((op === 'new') && this.first.isStatement(o))) {
        this.first = new Parens(this.first);
      }
      parts.push(this.first.compileToFragments(o, LEVEL_OP));
      if (this.flip) { parts.reverse(); }
      return this.joinFragmentArrays(parts, '');
    }

    compileYield(o) {
      let needle;
      const parts = [];
      const op = this.operator;
      if (o.scope.parent == null) {
        this.error('yield can only occur inside functions');
      }
      if ((needle = 'expression', Array.from(Object.keys(this.first)).includes(needle)) && !(this.first instanceof Throw)) {
        if (this.first.expression != null) { parts.push(this.first.expression.compileToFragments(o, LEVEL_OP)); }
      } else {
        if (o.level >= LEVEL_PAREN) { parts.push([this.makeCode("(")]); }
        parts.push([this.makeCode(op)]);
        if ((this.first.base != null ? this.first.base.value : undefined) !== '') { parts.push([this.makeCode(" ")]); }
        parts.push(this.first.compileToFragments(o, LEVEL_OP));
        if (o.level >= LEVEL_PAREN) { parts.push([this.makeCode(")")]); }
      }
      return this.joinFragmentArrays(parts, '');
    }

    compilePower(o) {
      // Make a Math.pow call
      const pow = new Value(new IdentifierLiteral('Math'), [new Access(new PropertyName('pow'))]);
      return new Call(pow, [this.first, this.second]).compileToFragments(o);
    }

    compileFloorDivision(o) {
      const floor = new Value(new IdentifierLiteral('Math'), [new Access(new PropertyName('floor'))]);
      const second = this.second.isComplex() ? new Parens(this.second) : this.second;
      const div = new Op('/', this.first, second);
      return new Call(floor, [div]).compileToFragments(o);
    }

    compileModulo(o) {
      const mod = new Value(new Literal(utility('modulo', o)));
      return new Call(mod, [this.first, this.second]).compileToFragments(o);
    }

    toString(idt) {
      return super.toString(idt, this.constructor.name + ' ' + this.operator);
    }
  };
  Op.initClass();
  return Op;
})());

//### In
exports.In = (In = (function() {
  In = class In extends Base {
    static initClass() {
  
      this.prototype.children = ['object', 'array'];
  
      this.prototype.invert = NEGATE;
    }
    constructor(object, array) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.object = object;
      this.array = array;
    }

    compileNode(o) {
      if (this.array instanceof Value && this.array.isArray() && this.array.base.objects.length) {
        let hasSplat;
        for (let obj of Array.from(this.array.base.objects)) {
          if (obj instanceof Splat) {
            hasSplat = true;
            break;
          }
        }
        // `compileOrTest` only if we have an array literal with no splats
        if (!hasSplat) { return this.compileOrTest(o); }
      }
      return this.compileLoopTest(o);
    }

    compileOrTest(o) {
      const [sub, ref] = Array.from(this.object.cache(o, LEVEL_OP));
      const [cmp, cnj] = Array.from(this.negated ? [' !== ', ' && '] : [' === ', ' || ']);
      let tests = [];
      for (let i = 0; i < this.array.base.objects.length; i++) {
        const item = this.array.base.objects[i];
        if (i) { tests.push(this.makeCode(cnj)); }
        tests = tests.concat((i ? ref : sub), this.makeCode(cmp), item.compileToFragments(o, LEVEL_ACCESS));
      }
      if (o.level < LEVEL_OP) { return tests; } else { return this.wrapInBraces(tests); }
    }

    compileLoopTest(o) {
      const [sub, ref] = Array.from(this.object.cache(o, LEVEL_LIST));
      let fragments = [].concat(this.makeCode(utility('indexOf', o) + ".call("), this.array.compileToFragments(o, LEVEL_LIST),
        this.makeCode(", "), ref, this.makeCode(") " + (this.negated ? '< 0' : '>= 0')));
      if (fragmentsToText(sub) === fragmentsToText(ref)) { return fragments; }
      fragments = sub.concat(this.makeCode(', '), fragments);
      if (o.level < LEVEL_LIST) { return fragments; } else { return this.wrapInBraces(fragments); }
    }

    toString(idt) {
      return super.toString(idt, this.constructor.name + (this.negated ? '!' : ''));
    }
  };
  In.initClass();
  return In;
})());

//### Try

// A classic *try/catch/finally* block.
exports.Try = (Try = (function() {
  Try = class Try extends Base {
    static initClass() {
  
      this.prototype.children = ['attempt', 'recovery', 'ensure'];
  
      this.prototype.isStatement = YES;
    }
    constructor(attempt, errorVariable, recovery, ensure) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.attempt = attempt;
      this.errorVariable = errorVariable;
      this.recovery = recovery;
      this.ensure = ensure;
    }

    jumps(o) { return this.attempt.jumps(o) || (this.recovery != null ? this.recovery.jumps(o) : undefined); }

    makeReturn(res) {
      if (this.attempt) { this.attempt  = this.attempt .makeReturn(res); }
      if (this.recovery) { this.recovery = this.recovery.makeReturn(res); }
      return this;
    }

    // Compilation is more or less as you would expect -- the *finally* clause
    // is optional, the *catch* is not.
    compileNode(o) {
      o.indent  += TAB;
      const tryPart   = this.attempt.compileToFragments(o, LEVEL_TOP);

      const catchPart = (() => {
        let generatedErrorVariableName;
        if (this.recovery) {
        generatedErrorVariableName = o.scope.freeVariable('error', {reserve: false});
        const placeholder = new IdentifierLiteral(generatedErrorVariableName);
        if (this.errorVariable) {
          const message = isUnassignable(this.errorVariable.unwrapAll().value);
          if (message) { this.errorVariable.error(message); }
          this.recovery.unshift(new Assign(this.errorVariable, placeholder));
        }
        return [].concat(this.makeCode(" catch ("), placeholder.compileToFragments(o), this.makeCode(") {\n"),
          this.recovery.compileToFragments(o, LEVEL_TOP), this.makeCode(`\n${this.tab}}`));
      } else if (!this.ensure && !this.recovery) {
        generatedErrorVariableName = o.scope.freeVariable('error', {reserve: false});
        return [this.makeCode(` catch (${generatedErrorVariableName}) {}`)];
      } else {
        return [];
      }
      })();

      const ensurePart = this.ensure ? ([].concat(this.makeCode(" finally {\n"), this.ensure.compileToFragments(o, LEVEL_TOP),
        this.makeCode(`\n${this.tab}}`))) : [];

      return [].concat(this.makeCode(`${this.tab}try {\n`),
        tryPart,
        this.makeCode(`\n${this.tab}}`), catchPart, ensurePart);
    }
  };
  Try.initClass();
  return Try;
})());

//### Throw

// Simple node to throw an exception.
exports.Throw = (Throw = (function() {
  Throw = class Throw extends Base {
    static initClass() {
  
      this.prototype.children = ['expression'];
  
      this.prototype.isStatement = YES;
      this.prototype.jumps =       NO;
  
      // A **Throw** is already a return, of sorts...
      this.prototype.makeReturn = THIS;
    }
    constructor(expression) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.expression = expression;
    }

    compileNode(o) {
      return [].concat(this.makeCode(this.tab + "throw "), this.expression.compileToFragments(o), this.makeCode(";"));
    }
  };
  Throw.initClass();
  return Throw;
})());

//### Existence

// Checks a variable for existence -- not *null* and not *undefined*. This is
// similar to `.nil?` in Ruby, and avoids having to consult a JavaScript truth
// table.
exports.Existence = (Existence = (function() {
  Existence = class Existence extends Base {
    static initClass() {
  
      this.prototype.children = ['expression'];
  
      this.prototype.invert = NEGATE;
    }
    constructor(expression) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.expression = expression;
    }

    compileNode(o) {
      this.expression.front = this.front;
      let code = this.expression.compile(o, LEVEL_OP);
      if (this.expression.unwrap() instanceof IdentifierLiteral && !o.scope.check(code)) {
        const [cmp, cnj] = Array.from(this.negated ? ['===', '||'] : ['!==', '&&']);
        code = `typeof ${code} ${cmp} \"undefined\" ${cnj} ${code} ${cmp} null`;
      } else {
        // do not use strict equality here; it will break existing code
        code = `${code} ${this.negated ? '==' : '!='} null`;
      }
      return [this.makeCode(o.level <= LEVEL_COND ? code : `(${code})`)];
    }
  };
  Existence.initClass();
  return Existence;
})());

//### Parens

// An extra set of parentheses, specified explicitly in the source. At one time
// we tried to clean up the results by detecting and removing redundant
// parentheses, but no longer -- you can put in as many as you please.
//
// Parentheses are a good way to force any statement to become an expression.
exports.Parens = (Parens = (function() {
  Parens = class Parens extends Base {
    static initClass() {
  
      this.prototype.children = ['body'];
    }
    constructor(body) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.body = body;
    }

    unwrap() { return this.body; }
    isComplex() { return this.body.isComplex(); }

    compileNode(o) {
      const expr = this.body.unwrap();
      if (expr instanceof Value && expr.isAtomic()) {
        expr.front = this.front;
        return expr.compileToFragments(o);
      }
      const fragments = expr.compileToFragments(o, LEVEL_PAREN);
      const bare = (o.level < LEVEL_OP) && (expr instanceof Op || expr instanceof Call ||
        (expr instanceof For && expr.returns)) && ((o.level < LEVEL_COND) ||
          (fragments.length <= 3));
      if (bare) { return fragments; } else { return this.wrapInBraces(fragments); }
    }
  };
  Parens.initClass();
  return Parens;
})());

//### StringWithInterpolations

// Strings with interpolations are in fact just a variation of `Parens` with
// string concatenation inside.

exports.StringWithInterpolations = (StringWithInterpolations = class StringWithInterpolations extends Parens {
  // Uncomment the following line in CoffeeScript 2, to allow all interpolated
  // strings to be output using the ES2015 syntax:
  // unwrap: -> this

  compileNode(o) {
    // This method produces an interpolated string using the new ES2015 syntax,
    // which is opt-in by using tagged template literals. If this
    // StringWithInterpolations isn’t inside a tagged template literal,
    // fall back to the CoffeeScript 1.x output.
    // (Remove this check in CoffeeScript 2.)
    if (!o.inTaggedTemplateCall) {
      return super.compileNode(...arguments);
    }

    // Assumption: expr is Value>StringLiteral or Op
    const expr = this.body.unwrap();

    const elements = [];
    expr.traverseChildren(false, function(node) {
      if (node instanceof StringLiteral) {
        elements.push(node);
        return true;
      } else if (node instanceof Parens) {
        elements.push(node);
        return false;
      }
      return true;
    });

    const fragments = [];
    fragments.push(this.makeCode('`'));
    for (let element of Array.from(elements)) {
      if (element instanceof StringLiteral) {
        let value = element.value.slice(1, -1);
        // Backticks and `${` inside template literals must be escaped.
        value = value.replace(/(\\*)(`|\$\{)/g, function(match, backslashes, toBeEscaped) {
          if ((backslashes.length % 2) === 0) {
            return `${backslashes}\\${toBeEscaped}`;
          } else {
            return match;
          }
        });
        fragments.push(this.makeCode(value));
      } else {
        fragments.push(this.makeCode('${'));
        fragments.push(...Array.from(element.compileToFragments(o, LEVEL_PAREN) || []));
        fragments.push(this.makeCode('}'));
      }
    }
    fragments.push(this.makeCode('`'));

    return fragments;
  }
});

//### For

// CoffeeScript's replacement for the *for* loop is our array and object
// comprehensions, that compile into *for* loops here. They also act as an
// expression, able to return the result of each filtered iteration.
//
// Unlike Python array comprehensions, they can be multi-line, and you can pass
// the current index of the loop as a second parameter. Unlike Ruby blocks,
// you can map and filter in a single pass.
exports.For = (For = (function() {
  For = class For extends While {
    static initClass() {
  
      this.prototype.children = ['body', 'source', 'guard', 'step'];
    }
    constructor(body, source) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      ({source: this.source, guard: this.guard, step: this.step, name: this.name, index: this.index} = source);
      this.body    = Block.wrap([body]);
      this.own     = !!source.own;
      this.object  = !!source.object;
      this.from    = !!source.from;
      if (this.from && this.index) { this.index.error('cannot use index with for-from'); }
      if (this.own && !this.object) { source.ownTag.error(`cannot use own with for-${this.from ? 'from' : 'in'}`); }
      if (this.object) { [this.name, this.index] = Array.from([this.index, this.name]); }
      if (this.index instanceof Value && !this.index.isAssignable()) { this.index.error('index cannot be a pattern matching expression'); }
      this.range   = this.source instanceof Value && this.source.base instanceof Range && !this.source.properties.length && !this.from;
      this.pattern = this.name instanceof Value;
      if (this.range && this.index) { this.index.error('indexes do not apply to range loops'); }
      if (this.range && this.pattern) { this.name.error('cannot pattern match over range loops'); }
      this.returns = false;
    }

    // Welcome to the hairiest method in all of CoffeeScript. Handles the inner
    // loop, filtering, stepping, and result saving for array, object, and range
    // comprehensions. Some of the generated code can be shared in common, and
    // some cannot.
    compileNode(o) {
      let forPartFragments, ivar, name, namePart, resultPart, returnResult, rvar, step, stepNum, stepVar, svar;
      let body        = Block.wrap([this.body]);
      const last = body.expressions[body.expressions.length - 1];
      if ((last != null ? last.jumps() : undefined) instanceof Return) { this.returns    = false; }
      const source      = this.range ? this.source.base : this.source;
      const {
        scope
      } = o;
      if (!this.pattern) { name        = this.name  && (this.name.compile(o, LEVEL_LIST)); }
      const index       = this.index && (this.index.compile(o, LEVEL_LIST));
      if (name && !this.pattern) { scope.find(name); }
      if (index && !(this.index instanceof Value)) { scope.find(index); }
      if (this.returns) { rvar        = scope.freeVariable('results'); }
      if (this.from) {
        if (this.pattern) { ivar = scope.freeVariable('x', {single: true}); }
      } else {
        ivar = (this.object && index) || scope.freeVariable('i', {single: true});
      }
      const kvar        = ((this.range || this.from) && name) || index || ivar;
      const kvarAssign  = kvar !== ivar ? `${kvar} = ` : "";
      if (this.step && !this.range) {
        [step, stepVar] = Array.from(this.cacheToCodeFragments(this.step.cache(o, LEVEL_LIST, isComplexOrAssignable)));
        if (this.step.isNumber()) { stepNum   = Number(stepVar); }
      }
      if (this.pattern) { name        = ivar; }
      let varPart     = '';
      let guardPart   = '';
      let defPart     = '';
      const idt1        = this.tab + TAB;
      if (this.range) {
        forPartFragments = source.compileToFragments(merge(o,
          {index: ivar, name, step: this.step, isComplex: isComplexOrAssignable}));
      } else {
        svar    = this.source.compile(o, LEVEL_LIST);
        if ((name || this.own) && !(this.source.unwrap() instanceof IdentifierLiteral)) {
          let ref;
          defPart    += `${this.tab}${(ref = scope.freeVariable('ref'))} = ${svar};\n`;
          svar       = ref;
        }
        if (name && !this.pattern && !this.from) {
          namePart   = `${name} = ${svar}[${kvar}]`;
        }
        if (!this.object && !this.from) {
          let increment, lvar;
          if (step !== stepVar) { defPart += `${this.tab}${step};\n`; }
          const down = stepNum < 0;
          if (!this.step || (stepNum == null) || !down) { lvar = scope.freeVariable('len'); }
          let declare = `${kvarAssign}${ivar} = 0, ${lvar} = ${svar}.length`;
          const declareDown = `${kvarAssign}${ivar} = ${svar}.length - 1`;
          let compare = `${ivar} < ${lvar}`;
          const compareDown = `${ivar} >= 0`;
          if (this.step) {
            if (stepNum != null) {
              if (down) {
                compare = compareDown;
                declare = declareDown;
              }
            } else {
              compare = `${stepVar} > 0 ? ${compare} : ${compareDown}`;
              declare = `(${stepVar} > 0 ? (${declare}) : ${declareDown})`;
            }
            increment = `${ivar} += ${stepVar}`;
          } else {
            increment = `${kvar !== ivar ? `++${ivar}` : `${ivar}++`}`;
          }
          forPartFragments = [this.makeCode(`${declare}; ${compare}; ${kvarAssign}${increment}`)];
        }
      }
      if (this.returns) {
        resultPart   = `${this.tab}${rvar} = [];\n`;
        returnResult = `\n${this.tab}return ${rvar};`;
        body.makeReturn(rvar);
      }
      if (this.guard) {
        if (body.expressions.length > 1) {
          body.expressions.unshift(new If((new Parens(this.guard)).invert(), new StatementLiteral("continue")));
        } else {
          if (this.guard) { body = Block.wrap([new If(this.guard, body)]); }
        }
      }
      if (this.pattern) {
        body.expressions.unshift(new Assign(this.name, this.from ? new IdentifierLiteral(kvar) : new Literal(`${svar}[${kvar}]`)));
      }
      const defPartFragments = [].concat(this.makeCode(defPart), this.pluckDirectCall(o, body));
      if (namePart) { varPart = `\n${idt1}${namePart};`; }
      if (this.object) {
        forPartFragments = [this.makeCode(`${kvar} in ${svar}`)];
        if (this.own) { guardPart = `\n${idt1}if (!${utility('hasProp', o)}.call(${svar}, ${kvar})) continue;`; }
      } else if (this.from) {
        forPartFragments = [this.makeCode(`${kvar} of ${svar}`)];
      }
      let bodyFragments = body.compileToFragments(merge(o, {indent: idt1}), LEVEL_TOP);
      if (bodyFragments && (bodyFragments.length > 0)) {
        bodyFragments = [].concat(this.makeCode("\n"), bodyFragments, this.makeCode("\n"));
      }
      return [].concat(defPartFragments, this.makeCode(`${resultPart || ''}${this.tab}for (`),
        forPartFragments, this.makeCode(`) {${guardPart}${varPart}`), bodyFragments,
        this.makeCode(`${this.tab}}${returnResult || ''}`));
    }

    pluckDirectCall(o, body) {
      let defs = [];
      for (let idx = 0; idx < body.expressions.length; idx++) {
        let expr = body.expressions[idx];
        expr = expr.unwrapAll();
        if (!(expr instanceof Call)) { continue; }
        const val = expr.variable != null ? expr.variable.unwrapAll() : undefined;
        if ((!(val instanceof Code)) &&
                        (!(val instanceof Value) ||
                        !((val.base != null ? val.base.unwrapAll() : undefined) instanceof Code) ||
                        (val.properties.length !== 1) ||
                        !['call', 'apply'].includes(val.properties[0].name != null ? val.properties[0].name.value : undefined))) { continue; }
        const fn    = (val.base != null ? val.base.unwrapAll() : undefined) || val;
        const ref   = new IdentifierLiteral(o.scope.freeVariable('fn'));
        let base  = new Value(ref);
        if (val.base) {
          [val.base, base] = Array.from([base, val]);
        }
        body.expressions[idx] = new Call(base, expr.args);
        defs = defs.concat(this.makeCode(this.tab), (new Assign(ref, fn).compileToFragments(o, LEVEL_TOP)), this.makeCode(';\n'));
      }
      return defs;
    }
  };
  For.initClass();
  return For;
})());

//### Switch

// A JavaScript *switch* statement. Converts into a returnable expression on-demand.
exports.Switch = (Switch = (function() {
  Switch = class Switch extends Base {
    static initClass() {
  
      this.prototype.children = ['subject', 'cases', 'otherwise'];
  
      this.prototype.isStatement = YES;
    }
    constructor(subject, cases, otherwise) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.subject = subject;
      this.cases = cases;
      this.otherwise = otherwise;
    }

    jumps(o) {
      if (o == null) { o = {block: true}; }
      for (let [conds, block] of Array.from(this.cases)) {
        var jumpNode;
        if (jumpNode = block.jumps(o)) { return jumpNode; }
      }
      return (this.otherwise != null ? this.otherwise.jumps(o) : undefined);
    }

    makeReturn(res) {
      for (let pair of Array.from(this.cases)) { pair[1].makeReturn(res); }
      if (res) { if (!this.otherwise) { this.otherwise = new Block([new Literal('void 0')]); } }
      if (this.otherwise != null) {
        this.otherwise.makeReturn(res);
      }
      return this;
    }

    compileNode(o) {
      const idt1 = o.indent + TAB;
      const idt2 = (o.indent = idt1 + TAB);
      let fragments = [].concat(this.makeCode(this.tab + "switch ("),
        (this.subject ? this.subject.compileToFragments(o, LEVEL_PAREN) : this.makeCode("false")),
        this.makeCode(") {\n"));
      for (let i = 0; i < this.cases.length; i++) {
        var body, cond;
        const [conditions, block] = this.cases[i];
        for (cond of Array.from(flatten([conditions]))) {
          if (!this.subject) { cond  = cond.invert(); }
          fragments = fragments.concat(this.makeCode(idt1 + "case "), cond.compileToFragments(o, LEVEL_PAREN), this.makeCode(":\n"));
        }
        if ((body = block.compileToFragments(o, LEVEL_TOP)).length > 0) { fragments = fragments.concat(body, this.makeCode('\n')); }
        if ((i === (this.cases.length - 1)) && !this.otherwise) { break; }
        const expr = this.lastNonComment(block.expressions);
        if (expr instanceof Return || (expr instanceof Literal && expr.jumps() && (expr.value !== 'debugger'))) { continue; }
        fragments.push(cond.makeCode(idt2 + 'break;\n'));
      }
      if (this.otherwise && this.otherwise.expressions.length) {
        fragments.push(this.makeCode(idt1 + "default:\n"), ...Array.from((this.otherwise.compileToFragments(o, LEVEL_TOP))), this.makeCode("\n"));
      }
      fragments.push(this.makeCode(this.tab + '}'));
      return fragments;
    }
  };
  Switch.initClass();
  return Switch;
})());

//### If

// *If/else* statements. Acts as an expression by pushing down requested returns
// to the last line of each clause.
//
// Single-expression **Ifs** are compiled into conditional operators if possible,
// because ternaries are already proper expressions, and don't need conversion.
exports.If = (If = (function() {
  If = class If extends Base {
    static initClass() {
  
      this.prototype.children = ['condition', 'body', 'elseBody'];
    }
    constructor(condition, body, options) {
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) { super(); }
        let thisFn = (() => { return this; }).toString();
        let thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(`${thisName} = this;`);
      }
      this.body = body;
      if (options == null) { options = {}; }
      this.condition = options.type === 'unless' ? condition.invert() : condition;
      this.elseBody  = null;
      this.isChain   = false;
      ({soak: this.soak}    = options);
    }

    bodyNode() { return (this.body != null ? this.body.unwrap() : undefined); }
    elseBodyNode() { return (this.elseBody != null ? this.elseBody.unwrap() : undefined); }

    // Rewrite a chain of **Ifs** to add a default case as the final *else*.
    addElse(elseBody) {
      if (this.isChain) {
        this.elseBodyNode().addElse(elseBody);
      } else {
        this.isChain  = elseBody instanceof If;
        this.elseBody = this.ensureBlock(elseBody);
        this.elseBody.updateLocationDataIfMissing(elseBody.locationData);
      }
      return this;
    }

    // The **If** only compiles into a statement if either of its bodies needs
    // to be a statement. Otherwise a conditional operator is safe.
    isStatement(o) {
      return ((o != null ? o.level : undefined) === LEVEL_TOP) ||
        this.bodyNode().isStatement(o) || __guard__(this.elseBodyNode(), x => x.isStatement(o));
    }

    jumps(o) { return this.body.jumps(o) || (this.elseBody != null ? this.elseBody.jumps(o) : undefined); }

    compileNode(o) {
      if (this.isStatement(o)) { return this.compileStatement(o); } else { return this.compileExpression(o); }
    }

    makeReturn(res) {
      if (res) { if (!this.elseBody) { this.elseBody = new Block([new Literal('void 0')]); } }
      if (this.body) { this.body = new Block([this.body.makeReturn(res)]); }
      if (this.elseBody) { this.elseBody = new Block([this.elseBody.makeReturn(res)]); }
      return this;
    }

    ensureBlock(node) {
      if (node instanceof Block) { return node; } else { return new Block([node]); }
    }

    // Compile the `If` as a regular *if-else* statement. Flattened chains
    // force inner *else* bodies into statement form.
    compileStatement(o) {
      const child    = del(o, 'chainChild');
      const exeq     = del(o, 'isExistentialEquals');

      if (exeq) {
        return new If(this.condition.invert(), this.elseBodyNode(), {type: 'if'}).compileToFragments(o);
      }

      const indent   = o.indent + TAB;
      const cond     = this.condition.compileToFragments(o, LEVEL_PAREN);
      const body     = this.ensureBlock(this.body).compileToFragments(merge(o, {indent}));
      const ifPart   = [].concat(this.makeCode("if ("), cond, this.makeCode(") {\n"), body, this.makeCode(`\n${this.tab}}`));
      if (!child) { ifPart.unshift(this.makeCode(this.tab)); }
      if (!this.elseBody) { return ifPart; }
      let answer = ifPart.concat(this.makeCode(' else '));
      if (this.isChain) {
        o.chainChild = true;
        answer = answer.concat(this.elseBody.unwrap().compileToFragments(o, LEVEL_TOP));
      } else {
        answer = answer.concat(this.makeCode("{\n"), this.elseBody.compileToFragments(merge(o, {indent}), LEVEL_TOP), this.makeCode(`\n${this.tab}}`));
      }
      return answer;
    }

    // Compile the `If` as a conditional operator.
    compileExpression(o) {
      const cond = this.condition.compileToFragments(o, LEVEL_COND);
      const body = this.bodyNode().compileToFragments(o, LEVEL_LIST);
      const alt  = this.elseBodyNode() ? this.elseBodyNode().compileToFragments(o, LEVEL_LIST) : [this.makeCode('void 0')];
      const fragments = cond.concat(this.makeCode(" ? "), body, this.makeCode(" : "), alt);
      if (o.level >= LEVEL_COND) { return this.wrapInBraces(fragments); } else { return fragments; }
    }

    unfoldSoak() {
      return this.soak && this;
    }
  };
  If.initClass();
  return If;
})());

// Constants
// ---------

const UTILITIES = {

  // Correctly set up a prototype chain for inheritance, including a reference
  // to the superclass for `super()` calls, and copies of any static properties.
  extend(o) { return `\
function(child, parent) { \
for (var key in parent) { \
if (${utility('hasProp', o)}.call(parent, key)) child[key] = parent[key]; \
} \
function ctor() { \
this.constructor = child; \
} \
ctor.prototype = parent.prototype; \
child.prototype = new ctor(); \
child.__super__ = parent.prototype; \
return child; \
}\
`; },

  // Create a function bound to the current value of "this".
  bind() { return `\
function(fn, me){ \
return function(){ \
return fn.apply(me, arguments); \
}; \
}\
`; },

  // Discover if an item is in an array.
  indexOf() { return `\
[].indexOf || function(item) { \
for (var i = 0, l = this.length; i < l; i++) { \
if (i in this && this[i] === item) return i; \
} \
return -1; \
}\
`; },

  modulo() { return `\
function(a, b) { return (+a % (b = +b) + b) % b; }\
`; },

  // Shortcuts to speed up the lookup time for native functions.
  hasProp() { return '{}.hasOwnProperty'; },
  slice() { return '[].slice'; }
};

// Levels indicate a node's position in the AST. Useful for knowing if
// parens are necessary or superfluous.
var LEVEL_TOP    = 1;  // ...;
var LEVEL_PAREN  = 2;  // (...)
var LEVEL_LIST   = 3;  // [...]
var LEVEL_COND   = 4;  // ... ? x : y
var LEVEL_OP     = 5;  // !...
var LEVEL_ACCESS = 6;  // ...[0]

// Tabs are two spaces for pretty printing.
var TAB = '  ';

var SIMPLENUM = /^[+-]?\d+$/;

// Helper Functions
// ----------------

// Helper for ensuring that utility functions are assigned at the top level.
var utility = function(name, o) {
  const {root} = o.scope;
  if (name in root.utilities) {
    return root.utilities[name];
  } else {
    const ref = root.freeVariable(name);
    root.assign(ref, UTILITIES[name](o));
    return root.utilities[name] = ref;
  }
};

var multident = function(code, tab) {
  code = code.replace(/\n/g, '$&' + tab);
  return code.replace(/\s+$/, '');
};

var isLiteralArguments = node => node instanceof IdentifierLiteral && (node.value === 'arguments');

var isLiteralThis = node => node instanceof ThisLiteral ||
  (node instanceof Code && node.bound) ||
  node instanceof SuperCall;

var isComplexOrAssignable = node => node.isComplex() || (typeof node.isAssignable === 'function' ? node.isAssignable() : undefined);

// Unfold a node's child if soak, then tuck the node under created `If`
var unfoldSoak = function(o, parent, name) {
  let ifn;
  if (!(ifn = parent[name].unfoldSoak(o))) { return; }
  parent[name] = ifn.body;
  ifn.body = new Value(parent);
  return ifn;
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}