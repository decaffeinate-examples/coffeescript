var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable
    class-methods-use-this,
    consistent-return,
    constructor-super,
    func-names,
    max-classes-per-file,
    max-len,
    no-cond-assign,
    no-constant-condition,
    no-continue,
    no-eval,
    no-loop-func,
    no-multi-assign,
    no-nested-ternary,
    no-param-reassign,
    no-plusplus,
    no-restricted-syntax,
    no-return-assign,
    no-shadow,
    no-this-before-super,
    no-underscore-dangle,
    no-unused-vars,
    no-use-before-define,
    no-useless-escape,
    no-var,
    operator-linebreak,
    prefer-const,
    prefer-destructuring,
    prefer-rest-params,
    quotes,
    vars-on-top,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
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

var Access = void 0;var Arr = void 0;var Assign = void 0;var Base = void 0;var Block = void 0;var BooleanLiteral = void 0;var Call = void 0;var Class = void 0;var Code = void 0;var CodeFragment = void 0;var Comment = void 0;var Existence = void 0;var Expansion = void 0;var ExportAllDeclaration = void 0;var ExportDeclaration = void 0;var ExportDefaultDeclaration = void 0;var ExportNamedDeclaration = void 0;var ExportSpecifier = void 0;var ExportSpecifierList = void 0;var Extends = void 0;var For = void 0;var IdentifierLiteral = void 0;var If = void 0;var ImportClause = void 0;var ImportDeclaration = void 0;var ImportDefaultSpecifier = void 0;var ImportNamespaceSpecifier = void 0;var ImportSpecifier = void 0;var ImportSpecifierList = void 0;var In = void 0;var Index = void 0;var InfinityLiteral = void 0;var Literal = void 0;var ModuleDeclaration = void 0;var ModuleSpecifier = void 0;var ModuleSpecifierList = void 0;var NaNLiteral = void 0;var NullLiteral = void 0;var NumberLiteral = void 0;var Obj = void 0;var Op = void 0;var Param = void 0;var Parens = void 0;var PassthroughLiteral = void 0;var PropertyName = void 0;var Range = void 0;var RegexLiteral = void 0;var RegexWithInterpolations = void 0;var Return = void 0;var Slice = void 0;var Splat = void 0;var StatementLiteral = void 0;var StringLiteral = void 0;var StringWithInterpolations = void 0;var SuperCall = void 0;var Switch = void 0;var TaggedTemplateCall = void 0;var ThisLiteral = void 0;var Throw = void 0;var Try = void 0;var UndefinedLiteral = void 0;var Value = void 0;var While = void 0;var YieldReturn = void 0;
Error.stackTraceLimit = Infinity;

var _require = require('./scope'),
    Scope = _require.Scope;

var _require2 = require('./lexer'),
    isUnassignable = _require2.isUnassignable,
    JS_FORBIDDEN = _require2.JS_FORBIDDEN;

// Import the helpers we plan to use.


var _require3 = require('./helpers'),
    compact = _require3.compact,
    flatten = _require3.flatten,
    extend = _require3.extend,
    merge = _require3.merge,
    del = _require3.del,
    starts = _require3.starts,
    ends = _require3.ends,
    some = _require3.some,
    addLocationDataFn = _require3.addLocationDataFn,
    locationDataToString = _require3.locationDataToString,
    throwSyntaxError = _require3.throwSyntaxError;

// Functions required by parser


exports.extend = extend;
exports.addLocationDataFn = addLocationDataFn;

// Constant functions for nodes that don't need customization.
var YES = function YES() {
  return true;
};
var NO = function NO() {
  return false;
};
var THIS = function THIS() {
  return this;
};
var NEGATE = function NEGATE() {
  this.negated = !this.negated;return this;
};

// ### CodeFragment

// The various nodes defined below all compile to a collection of **CodeFragment** objects.
// A CodeFragments is a block of generated code, and the location in the source file where the code
// came from. CodeFragments can be assembled together into working code just by catting together
// all the CodeFragments' `code` snippets, in order.
exports.CodeFragment = CodeFragment = function () {
  function CodeFragment(parent, code) {
    _classCallCheck(this, CodeFragment);

    this.code = '' + code;
    this.locationData = parent != null ? parent.locationData : undefined;
    this.type = __guard__(parent != null ? parent.constructor : undefined, function (x) {
      return x.name;
    }) || 'unknown';
  }

  _createClass(CodeFragment, [{
    key: 'toString',
    value: function toString() {
      return '' + this.code + (this.locationData ? ': ' + locationDataToString(this.locationData) : '');
    }
  }]);

  return CodeFragment;
}();

// Convert an array of CodeFragments into a string.
var fragmentsToText = function fragmentsToText(fragments) {
  return Array.from(fragments).map(function (fragment) {
    return fragment.code;
  }).join('');
};

// ### Base

// The **Base** is the abstract base class for all nodes in the syntax tree.
// Each subclass implements the `compileNode` method, which performs the
// code generation for that node. To compile a node to JavaScript,
// call `compile` on it, which wraps `compileNode` in some generic extra smarts,
// to know when the generated code needs to be wrapped up in a closure.
// An options hash is passed and cloned throughout, containing information about
// the environment from higher in the tree (such as if a returned value is
// being requested by the surrounding function), information about the current
// scope, and indentation level.
exports.Base = Base = function () {
  Base = function () {
    function Base() {
      _classCallCheck(this, Base);
    }

    _createClass(Base, [{
      key: 'compile',
      value: function compile(o, lvl) {
        return fragmentsToText(this.compileToFragments(o, lvl));
      }

      // Common logic for determining whether to wrap this node in a closure before
      // compiling it, or to compile directly. We need to wrap if this node is a
      // *statement*, and it's not a *pureStatement*, and we're not at
      // the top level of a block (which would be unnecessary), and we haven't
      // already been asked to return the result (because statements know how to
      // return results).

    }, {
      key: 'compileToFragments',
      value: function compileToFragments(o, lvl) {
        o = extend({}, o);
        if (lvl) {
          o.level = lvl;
        }
        var node = this.unfoldSoak(o) || this;
        node.tab = o.indent;
        if (o.level === LEVEL_TOP || !node.isStatement(o)) {
          return node.compileNode(o);
        }
        return node.compileClosure(o);
      }

      // Statements converted into expressions via closure-wrapping share a scope
      // object with their parent closure, to preserve the expected lexical scope.

    }, {
      key: 'compileClosure',
      value: function compileClosure(o) {
        var argumentsNode = void 0;var jumpNode = void 0;
        if (jumpNode = this.jumps()) {
          jumpNode.error('cannot use a pure statement in an expression');
        }
        o.sharedScope = true;
        var func = new Code([], Block.wrap([this]));
        var args = [];
        if ((argumentsNode = this.contains(isLiteralArguments)) || this.contains(isLiteralThis)) {
          var meth = void 0;
          args = [new ThisLiteral()];
          if (argumentsNode) {
            meth = 'apply';
            args.push(new IdentifierLiteral('arguments'));
          } else {
            meth = 'call';
          }
          func = new Value(func, [new Access(new PropertyName(meth))]);
        }
        var parts = new Call(func, args).compileNode(o);
        if (func.isGenerator || (func.base != null ? func.base.isGenerator : undefined)) {
          parts.unshift(this.makeCode('(yield* '));
          parts.push(this.makeCode(')'));
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

    }, {
      key: 'cache',
      value: function cache(o, level, isComplex) {
        var ref = void 0;
        var complex = isComplex != null ? isComplex(this) : this.isComplex();
        if (complex) {
          ref = new IdentifierLiteral(o.scope.freeVariable('ref'));
          var sub = new Assign(ref, this);
          if (level) {
            return [sub.compileToFragments(o, level), [this.makeCode(ref.value)]];
          }return [sub, ref];
        }
        ref = level ? this.compileToFragments(o, level) : this;
        return [ref, ref];
      }
    }, {
      key: 'cacheToCodeFragments',
      value: function cacheToCodeFragments(cacheValues) {
        return [fragmentsToText(cacheValues[0]), fragmentsToText(cacheValues[1])];
      }

      // Construct a node that returns the current node's result.
      // Note that this is overridden for smarter behavior for
      // many statement nodes (e.g. If, For)...

    }, {
      key: 'makeReturn',
      value: function makeReturn(res) {
        var me = this.unwrapAll();
        if (res) {
          return new Call(new Literal(res + '.push'), [me]);
        }
        return new Return(me);
      }

      // Does this node, or any of its children, contain a node of a certain kind?
      // Recursively traverses down the *children* nodes and returns the first one
      // that verifies `pred`. Otherwise return undefined. `contains` does not cross
      // scope boundaries.

    }, {
      key: 'contains',
      value: function contains(pred) {
        var node = void 0;
        this.traverseChildren(false, function (n) {
          if (pred(n)) {
            node = n;
            return false;
          }
        });
        return node;
      }

      // Pull out the last non-comment node of a node list.

    }, {
      key: 'lastNonComment',
      value: function lastNonComment(list) {
        var i = list.length;
        while (i--) {
          if (!(list[i] instanceof Comment)) {
            return list[i];
          }
        }
        return null;
      }

      // `toString` representation of the node, for inspecting the parse tree.
      // This is what `coffee --nodes` prints out.

    }, {
      key: 'toString',
      value: function toString(idt, name) {
        if (idt == null) {
          idt = '';
        }
        if (name == null) {
          name = this.constructor.name;
        }
        var tree = '\n' + idt + name;
        if (this.soak) {
          tree += '?';
        }
        this.eachChild(function (node) {
          return tree += node.toString(idt + TAB);
        });
        return tree;
      }

      // Passes each child to a function, breaking when the function returns `false`.

    }, {
      key: 'eachChild',
      value: function eachChild(func) {
        if (!this.children) {
          return this;
        }
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Array.from(this.children)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var attr = _step.value;

            if (this[attr]) {
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                for (var _iterator2 = Array.from(flatten([this[attr]]))[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var child = _step2.value;

                  if (func(child) === false) {
                    return this;
                  }
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

        return this;
      }
    }, {
      key: 'traverseChildren',
      value: function traverseChildren(crossScope, func) {
        return this.eachChild(function (child) {
          var recur = func(child);
          if (recur !== false) {
            return child.traverseChildren(crossScope, func);
          }
        });
      }
    }, {
      key: 'invert',
      value: function invert() {
        return new Op('!', this);
      }
    }, {
      key: 'unwrapAll',
      value: function unwrapAll() {
        var node = this;
        while (node !== (node = node.unwrap())) {
          continue;
        }
        return node;
      }

      // For this node and all descendents, set the location data to `locationData`
      // if the location data is not already set.

    }, {
      key: 'updateLocationDataIfMissing',
      value: function updateLocationDataIfMissing(locationData) {
        if (this.locationData) {
          return this;
        }
        this.locationData = locationData;

        return this.eachChild(function (child) {
          return child.updateLocationDataIfMissing(locationData);
        });
      }

      // Throw a SyntaxError associated with this node's location.

    }, {
      key: 'error',
      value: function error(message) {
        return throwSyntaxError(message, this.locationData);
      }
    }, {
      key: 'makeCode',
      value: function makeCode(code) {
        return new CodeFragment(this, code);
      }
    }, {
      key: 'wrapInBraces',
      value: function wrapInBraces(fragments) {
        return [].concat(this.makeCode('('), fragments, this.makeCode(')'));
      }

      // `fragmentsList` is an array of arrays of fragments. Each array in fragmentsList will be
      // concatonated together, with `joinStr` added in between each, to produce a final flat array
      // of fragments.

    }, {
      key: 'joinFragmentArrays',
      value: function joinFragmentArrays(fragmentsList, joinStr) {
        var answer = [];
        for (var i = 0; i < fragmentsList.length; i++) {
          var fragments = fragmentsList[i];
          if (i) {
            answer.push(this.makeCode(joinStr));
          }
          answer = answer.concat(fragments);
        }
        return answer;
      }
    }], [{
      key: 'initClass',
      value: function initClass() {
        // Default implementations of the common node properties and methods. Nodes
        // will override these with custom logic, if needed.
        this.prototype.children = [];

        this.prototype.isStatement = NO;
        this.prototype.jumps = NO;
        this.prototype.isComplex = YES;
        this.prototype.isChainable = NO;
        this.prototype.isAssignable = NO;
        this.prototype.isNumber = NO;

        this.prototype.unwrap = THIS;
        this.prototype.unfoldSoak = NO;

        // Is this node used to assign a certain variable?
        this.prototype.assigns = NO;
      }
    }]);

    return Base;
  }();
  Base.initClass();
  return Base;
}();

// ### Block

// The block is the list of expressions that forms the body of an
// indented block of code -- the implementation of a function, a clause in an
// `if`, `switch`, or `try`, and so on...
exports.Block = Block = function () {
  Block = function (_Base) {
    _inherits(Block, _Base);

    _createClass(Block, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['expressions'];
      }
    }]);

    function Block(nodes) {
      _classCallCheck(this, Block);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this = _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).call(this));
        }
        var thisFn = function () {
          return _this;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this.expressions = compact(flatten(nodes || []));
      return _possibleConstructorReturn(_this);
    }

    // Tack an expression on to the end of this expression list.


    _createClass(Block, [{
      key: 'push',
      value: function push(node) {
        this.expressions.push(node);
        return this;
      }

      // Remove and return the last expression of this expression list.

    }, {
      key: 'pop',
      value: function pop() {
        return this.expressions.pop();
      }

      // Add an expression at the beginning of this expression list.

    }, {
      key: 'unshift',
      value: function unshift(node) {
        this.expressions.unshift(node);
        return this;
      }

      // If this Block consists of just a single node, unwrap it by pulling
      // it back out.

    }, {
      key: 'unwrap',
      value: function unwrap() {
        if (this.expressions.length === 1) {
          return this.expressions[0];
        }return this;
      }

      // Is this an empty block of code?

    }, {
      key: 'isEmpty',
      value: function isEmpty() {
        return !this.expressions.length;
      }
    }, {
      key: 'isStatement',
      value: function isStatement(o) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = Array.from(this.expressions)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var exp = _step3.value;

            if (exp.isStatement(o)) {
              return true;
            }
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

        return false;
      }
    }, {
      key: 'jumps',
      value: function jumps(o) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = Array.from(this.expressions)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var exp = _step4.value;

            var jumpNode;
            if (jumpNode = exp.jumps(o)) {
              return jumpNode;
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
      }

      // A Block node does not return its entire body, rather it
      // ensures that the final expression is returned.

    }, {
      key: 'makeReturn',
      value: function makeReturn(res) {
        var len = this.expressions.length;
        while (len--) {
          var expr = this.expressions[len];
          if (!(expr instanceof Comment)) {
            this.expressions[len] = expr.makeReturn(res);
            if (expr instanceof Return && !expr.expression) {
              this.expressions.splice(len, 1);
            }
            break;
          }
        }
        return this;
      }

      // A **Block** is the only node that can serve as the root.

    }, {
      key: 'compileToFragments',
      value: function compileToFragments(o, level) {
        if (o == null) {
          o = {};
        }
        if (o.scope) {
          return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'compileToFragments', this).call(this, o, level);
        }return this.compileRoot(o);
      }

      // Compile all expressions within the **Block** body. If we need to
      // return the result, and it's an expression, simply return it. If it's a
      // statement, ask the statement to do so.

    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var answer = void 0;
        this.tab = o.indent;
        var top = o.level === LEVEL_TOP;
        var compiledNodes = [];

        for (var index = 0; index < this.expressions.length; index++) {
          var node = this.expressions[index];
          node = node.unwrapAll();
          node = node.unfoldSoak(o) || node;
          if (node instanceof Block) {
            // This is a nested block. We don't do anything special here like enclose
            // it in a new scope; we just compile the statements in this block along with
            // our own
            compiledNodes.push(node.compileNode(o));
          } else if (top) {
            node.front = true;
            var fragments = node.compileToFragments(o);
            if (!node.isStatement(o)) {
              fragments.unshift(this.makeCode('' + this.tab));
              fragments.push(this.makeCode(';'));
            }
            compiledNodes.push(fragments);
          } else {
            compiledNodes.push(node.compileToFragments(o, LEVEL_LIST));
          }
        }
        if (top) {
          if (this.spaced) {
            return [].concat(this.joinFragmentArrays(compiledNodes, '\n\n'), this.makeCode('\n'));
          }
          return this.joinFragmentArrays(compiledNodes, '\n');
        }
        if (compiledNodes.length) {
          answer = this.joinFragmentArrays(compiledNodes, ', ');
        } else {
          answer = [this.makeCode('void 0')];
        }
        if (compiledNodes.length > 1 && o.level >= LEVEL_LIST) {
          return this.wrapInBraces(answer);
        }return answer;
      }

      // If we happen to be the top-level **Block**, wrap everything in
      // a safety closure, unless requested not to.
      // It would be better not to generate them in the first place, but for now,
      // clean up obvious double-parentheses.

    }, {
      key: 'compileRoot',
      value: function compileRoot(o) {
        var _this2 = this;

        o.indent = o.bare ? '' : TAB;
        o.level = LEVEL_TOP;
        this.spaced = true;
        o.scope = new Scope(null, this, null, o.referencedVars != null ? o.referencedVars : []);
        // Mark given local variables in the root scope as parameters so they don't
        // end up being declared on this block.
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = Array.from(o.locals || [])[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var name = _step5.value;
            o.scope.parameter(name);
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

        var prelude = [];
        if (!o.bare) {
          var preludeExps = function () {
            var result = [];
            for (var i = 0; i < _this2.expressions.length; i++) {
              var exp = _this2.expressions[i];
              if (!(exp.unwrap() instanceof Comment)) {
                break;
              }
              result.push(exp);
            }
            return result;
          }();
          var rest = this.expressions.slice(preludeExps.length);
          this.expressions = preludeExps;
          if (preludeExps.length) {
            prelude = this.compileNode(merge(o, { indent: '' }));
            prelude.push(this.makeCode('\n'));
          }
          this.expressions = rest;
        }
        var fragments = this.compileWithDeclarations(o);
        if (o.bare) {
          return fragments;
        }
        return [].concat(prelude, this.makeCode('(function() {\n'), fragments, this.makeCode('\n}).call(this);\n'));
      }

      // Compile the expressions body for the contents of a function, with
      // declarations of all inner variables pushed up to the top.

    }, {
      key: 'compileWithDeclarations',
      value: function compileWithDeclarations(o) {
        var i = void 0;var spaced = void 0;
        var fragments = [];
        var post = [];
        for (i = 0; i < this.expressions.length; i++) {
          var exp = this.expressions[i];
          exp = exp.unwrap();
          if (!(exp instanceof Comment) && !(exp instanceof Literal)) {
            break;
          }
        }
        o = merge(o, { level: LEVEL_TOP });
        if (i) {
          var rest = this.expressions.splice(i, 9e9);

          var _Array$from = Array.from([this.spaced, false]);

          var _Array$from2 = _slicedToArray(_Array$from, 2);

          spaced = _Array$from2[0];
          this.spaced = _Array$from2[1];

          var _Array$from3 = Array.from([this.compileNode(o), spaced]);

          var _Array$from4 = _slicedToArray(_Array$from3, 2);

          fragments = _Array$from4[0];
          this.spaced = _Array$from4[1];

          this.expressions = rest;
        }
        post = this.compileNode(o);
        var _o = o,
            scope = _o.scope;

        if (scope.expressions === this) {
          var declars = o.scope.hasDeclarations();
          var assigns = scope.hasAssignments;
          if (declars || assigns) {
            if (i) {
              fragments.push(this.makeCode('\n'));
            }
            fragments.push(this.makeCode(this.tab + 'var '));
            if (declars) {
              fragments.push(this.makeCode(scope.declaredVariables().join(', ')));
            }
            if (assigns) {
              if (declars) {
                fragments.push(this.makeCode(',\n' + (this.tab + TAB)));
              }
              fragments.push(this.makeCode(scope.assignedVariables().join(',\n' + (this.tab + TAB))));
            }
            fragments.push(this.makeCode(';\n' + (this.spaced ? '\n' : '')));
          } else if (fragments.length && post.length) {
            fragments.push(this.makeCode('\n'));
          }
        }
        return fragments.concat(post);
      }

      // Wrap up the given nodes as a **Block**, unless it already happens
      // to be one.

    }], [{
      key: 'wrap',
      value: function wrap(nodes) {
        if (nodes.length === 1 && nodes[0] instanceof Block) {
          return nodes[0];
        }
        return new Block(nodes);
      }
    }]);

    return Block;
  }(Base);
  Block.initClass();
  return Block;
}();

// ### Literal

// `Literal` is a base class for static values that can be passed through
// directly into JavaScript without translation, such as: strings, numbers,
// `true`, `false`, `null`...
exports.Literal = Literal = function () {
  Literal = function (_Base2) {
    _inherits(Literal, _Base2);

    _createClass(Literal, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.isComplex = NO;
      }
    }]);

    function Literal(value) {
      _classCallCheck(this, Literal);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this3 = _possibleConstructorReturn(this, (Literal.__proto__ || Object.getPrototypeOf(Literal)).call(this));
        }
        var thisFn = function () {
          return _this3;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this3.value = value;
      return _possibleConstructorReturn(_this3);
    }

    _createClass(Literal, [{
      key: 'assigns',
      value: function assigns(name) {
        return name === this.value;
      }
    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        return [this.makeCode(this.value)];
      }
    }, {
      key: 'toString',
      value: function toString() {
        return ' ' + (this.isStatement() ? _get(Literal.prototype.__proto__ || Object.getPrototypeOf(Literal.prototype), 'toString', this).apply(this, arguments) : this.constructor.name) + ': ' + this.value;
      }
    }]);

    return Literal;
  }(Base);
  Literal.initClass();
  return Literal;
}();

exports.NumberLiteral = NumberLiteral = function (_Literal) {
  _inherits(NumberLiteral, _Literal);

  function NumberLiteral() {
    _classCallCheck(this, NumberLiteral);

    return _possibleConstructorReturn(this, (NumberLiteral.__proto__ || Object.getPrototypeOf(NumberLiteral)).apply(this, arguments));
  }

  return NumberLiteral;
}(Literal);

exports.InfinityLiteral = InfinityLiteral = function (_NumberLiteral) {
  _inherits(InfinityLiteral, _NumberLiteral);

  function InfinityLiteral() {
    _classCallCheck(this, InfinityLiteral);

    return _possibleConstructorReturn(this, (InfinityLiteral.__proto__ || Object.getPrototypeOf(InfinityLiteral)).apply(this, arguments));
  }

  _createClass(InfinityLiteral, [{
    key: 'compileNode',
    value: function compileNode() {
      return [this.makeCode('2e308')];
    }
  }]);

  return InfinityLiteral;
}(NumberLiteral);

exports.NaNLiteral = NaNLiteral = function (_NumberLiteral2) {
  _inherits(NaNLiteral, _NumberLiteral2);

  function NaNLiteral() {
    _classCallCheck(this, NaNLiteral);

    return _possibleConstructorReturn(this, (NaNLiteral.__proto__ || Object.getPrototypeOf(NaNLiteral)).call(this, 'NaN'));
  }

  _createClass(NaNLiteral, [{
    key: 'compileNode',
    value: function compileNode(o) {
      var code = [this.makeCode('0/0')];
      if (o.level >= LEVEL_OP) {
        return this.wrapInBraces(code);
      }return code;
    }
  }]);

  return NaNLiteral;
}(NumberLiteral);

exports.StringLiteral = StringLiteral = function (_Literal2) {
  _inherits(StringLiteral, _Literal2);

  function StringLiteral() {
    _classCallCheck(this, StringLiteral);

    return _possibleConstructorReturn(this, (StringLiteral.__proto__ || Object.getPrototypeOf(StringLiteral)).apply(this, arguments));
  }

  return StringLiteral;
}(Literal);

exports.RegexLiteral = RegexLiteral = function (_Literal3) {
  _inherits(RegexLiteral, _Literal3);

  function RegexLiteral() {
    _classCallCheck(this, RegexLiteral);

    return _possibleConstructorReturn(this, (RegexLiteral.__proto__ || Object.getPrototypeOf(RegexLiteral)).apply(this, arguments));
  }

  return RegexLiteral;
}(Literal);

exports.PassthroughLiteral = PassthroughLiteral = function (_Literal4) {
  _inherits(PassthroughLiteral, _Literal4);

  function PassthroughLiteral() {
    _classCallCheck(this, PassthroughLiteral);

    return _possibleConstructorReturn(this, (PassthroughLiteral.__proto__ || Object.getPrototypeOf(PassthroughLiteral)).apply(this, arguments));
  }

  return PassthroughLiteral;
}(Literal);

exports.IdentifierLiteral = IdentifierLiteral = function () {
  IdentifierLiteral = function (_Literal5) {
    _inherits(IdentifierLiteral, _Literal5);

    function IdentifierLiteral() {
      _classCallCheck(this, IdentifierLiteral);

      return _possibleConstructorReturn(this, (IdentifierLiteral.__proto__ || Object.getPrototypeOf(IdentifierLiteral)).apply(this, arguments));
    }

    _createClass(IdentifierLiteral, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.isAssignable = YES;
      }
    }]);

    return IdentifierLiteral;
  }(Literal);
  IdentifierLiteral.initClass();
  return IdentifierLiteral;
}();

exports.PropertyName = PropertyName = function () {
  PropertyName = function (_Literal6) {
    _inherits(PropertyName, _Literal6);

    function PropertyName() {
      _classCallCheck(this, PropertyName);

      return _possibleConstructorReturn(this, (PropertyName.__proto__ || Object.getPrototypeOf(PropertyName)).apply(this, arguments));
    }

    _createClass(PropertyName, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.isAssignable = YES;
      }
    }]);

    return PropertyName;
  }(Literal);
  PropertyName.initClass();
  return PropertyName;
}();

exports.StatementLiteral = StatementLiteral = function () {
  StatementLiteral = function (_Literal7) {
    _inherits(StatementLiteral, _Literal7);

    function StatementLiteral() {
      _classCallCheck(this, StatementLiteral);

      return _possibleConstructorReturn(this, (StatementLiteral.__proto__ || Object.getPrototypeOf(StatementLiteral)).apply(this, arguments));
    }

    _createClass(StatementLiteral, [{
      key: 'jumps',
      value: function jumps(o) {
        if (this.value === 'break' && !((o != null ? o.loop : undefined) || (o != null ? o.block : undefined))) {
          return this;
        }
        if (this.value === 'continue' && !(o != null ? o.loop : undefined)) {
          return this;
        }
      }
    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        return [this.makeCode('' + this.tab + this.value + ';')];
      }
    }], [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.isStatement = YES;

        this.prototype.makeReturn = THIS;
      }
    }]);

    return StatementLiteral;
  }(Literal);
  StatementLiteral.initClass();
  return StatementLiteral;
}();

exports.ThisLiteral = ThisLiteral = function (_Literal8) {
  _inherits(ThisLiteral, _Literal8);

  function ThisLiteral() {
    _classCallCheck(this, ThisLiteral);

    return _possibleConstructorReturn(this, (ThisLiteral.__proto__ || Object.getPrototypeOf(ThisLiteral)).call(this, 'this'));
  }

  _createClass(ThisLiteral, [{
    key: 'compileNode',
    value: function compileNode(o) {
      var code = (o.scope.method != null ? o.scope.method.bound : undefined) ? o.scope.method.context : this.value;
      return [this.makeCode(code)];
    }
  }]);

  return ThisLiteral;
}(Literal);

exports.UndefinedLiteral = UndefinedLiteral = function (_Literal9) {
  _inherits(UndefinedLiteral, _Literal9);

  function UndefinedLiteral() {
    _classCallCheck(this, UndefinedLiteral);

    return _possibleConstructorReturn(this, (UndefinedLiteral.__proto__ || Object.getPrototypeOf(UndefinedLiteral)).call(this, 'undefined'));
  }

  _createClass(UndefinedLiteral, [{
    key: 'compileNode',
    value: function compileNode(o) {
      return [this.makeCode(o.level >= LEVEL_ACCESS ? '(void 0)' : 'void 0')];
    }
  }]);

  return UndefinedLiteral;
}(Literal);

exports.NullLiteral = NullLiteral = function (_Literal10) {
  _inherits(NullLiteral, _Literal10);

  function NullLiteral() {
    _classCallCheck(this, NullLiteral);

    return _possibleConstructorReturn(this, (NullLiteral.__proto__ || Object.getPrototypeOf(NullLiteral)).call(this, 'null'));
  }

  return NullLiteral;
}(Literal);

exports.BooleanLiteral = BooleanLiteral = function (_Literal11) {
  _inherits(BooleanLiteral, _Literal11);

  function BooleanLiteral() {
    _classCallCheck(this, BooleanLiteral);

    return _possibleConstructorReturn(this, (BooleanLiteral.__proto__ || Object.getPrototypeOf(BooleanLiteral)).apply(this, arguments));
  }

  return BooleanLiteral;
}(Literal);

// ### Return

// A `return` is a *pureStatement* -- wrapping it in a closure wouldn't
// make sense.
exports.Return = Return = function () {
  Return = function (_Base3) {
    _inherits(Return, _Base3);

    _createClass(Return, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['expression'];

        this.prototype.isStatement = YES;
        this.prototype.makeReturn = THIS;
        this.prototype.jumps = THIS;
      }
    }]);

    function Return(expression) {
      _classCallCheck(this, Return);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this17 = _possibleConstructorReturn(this, (Return.__proto__ || Object.getPrototypeOf(Return)).call(this));
        }
        var thisFn = function () {
          return _this17;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this17.expression = expression;
      return _possibleConstructorReturn(_this17);
    }

    _createClass(Return, [{
      key: 'compileToFragments',
      value: function compileToFragments(o, level) {
        var expr = this.expression != null ? this.expression.makeReturn() : undefined;
        if (expr && !(expr instanceof Return)) {
          return expr.compileToFragments(o, level);
        }return _get(Return.prototype.__proto__ || Object.getPrototypeOf(Return.prototype), 'compileToFragments', this).call(this, o, level);
      }
    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var answer = [];
        // TODO: If we call expression.compile() here twice, we'll sometimes get back different results!
        answer.push(this.makeCode(this.tab + 'return' + (this.expression ? ' ' : '')));
        if (this.expression) {
          answer = answer.concat(this.expression.compileToFragments(o, LEVEL_PAREN));
        }
        answer.push(this.makeCode(';'));
        return answer;
      }
    }]);

    return Return;
  }(Base);
  Return.initClass();
  return Return;
}();

// `yield return` works exactly like `return`, except that it turns the function
// into a generator.
exports.YieldReturn = YieldReturn = function (_Return) {
  _inherits(YieldReturn, _Return);

  function YieldReturn() {
    _classCallCheck(this, YieldReturn);

    return _possibleConstructorReturn(this, (YieldReturn.__proto__ || Object.getPrototypeOf(YieldReturn)).apply(this, arguments));
  }

  _createClass(YieldReturn, [{
    key: 'compileNode',
    value: function compileNode(o) {
      if (o.scope.parent == null) {
        this.error('yield can only occur inside functions');
      }
      return _get(YieldReturn.prototype.__proto__ || Object.getPrototypeOf(YieldReturn.prototype), 'compileNode', this).apply(this, arguments);
    }
  }]);

  return YieldReturn;
}(Return);

// ### Value

// A value, variable or literal or parenthesized, indexed or dotted into,
// or vanilla.
exports.Value = Value = function () {
  Value = function (_Base4) {
    _inherits(Value, _Base4);

    _createClass(Value, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['base', 'properties'];
      }
    }]);

    function Value(base, props, tag) {
      var _ret2;

      _classCallCheck(this, Value);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this19 = _possibleConstructorReturn(this, (Value.__proto__ || Object.getPrototypeOf(Value)).call(this));
        }
        var thisFn = function () {
          return _this19;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      if (!props && base instanceof Value) {
        var _ret;

        return _ret = base, _possibleConstructorReturn(_this19, _ret);
      }
      _this19.base = base;
      _this19.properties = props || [];
      if (tag) {
        _this19[tag] = true;
      }
      return _ret2 = _this19, _possibleConstructorReturn(_this19, _ret2);
    }

    // Add a property (or *properties* ) `Access` to the list.


    _createClass(Value, [{
      key: 'add',
      value: function add(props) {
        this.properties = this.properties.concat(props);
        return this;
      }
    }, {
      key: 'hasProperties',
      value: function hasProperties() {
        return !!this.properties.length;
      }
    }, {
      key: 'bareLiteral',
      value: function bareLiteral(type) {
        return !this.properties.length && this.base instanceof type;
      }

      // Some boolean checks for the benefit of other nodes.

    }, {
      key: 'isArray',
      value: function isArray() {
        return this.bareLiteral(Arr);
      }
    }, {
      key: 'isRange',
      value: function isRange() {
        return this.bareLiteral(Range);
      }
    }, {
      key: 'isComplex',
      value: function isComplex() {
        return this.hasProperties() || this.base.isComplex();
      }
    }, {
      key: 'isAssignable',
      value: function isAssignable() {
        return this.hasProperties() || this.base.isAssignable();
      }
    }, {
      key: 'isNumber',
      value: function isNumber() {
        return this.bareLiteral(NumberLiteral);
      }
    }, {
      key: 'isString',
      value: function isString() {
        return this.bareLiteral(StringLiteral);
      }
    }, {
      key: 'isRegex',
      value: function isRegex() {
        return this.bareLiteral(RegexLiteral);
      }
    }, {
      key: 'isUndefined',
      value: function isUndefined() {
        return this.bareLiteral(UndefinedLiteral);
      }
    }, {
      key: 'isNull',
      value: function isNull() {
        return this.bareLiteral(NullLiteral);
      }
    }, {
      key: 'isBoolean',
      value: function isBoolean() {
        return this.bareLiteral(BooleanLiteral);
      }
    }, {
      key: 'isAtomic',
      value: function isAtomic() {
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = Array.from(this.properties.concat(this.base))[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var node = _step6.value;

            if (node.soak || node instanceof Call) {
              return false;
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6.return) {
              _iterator6.return();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }

        return true;
      }
    }, {
      key: 'isNotCallable',
      value: function isNotCallable() {
        return this.isNumber() || this.isString() || this.isRegex() || this.isArray() || this.isRange() || this.isSplice() || this.isObject() || this.isUndefined() || this.isNull() || this.isBoolean();
      }
    }, {
      key: 'isStatement',
      value: function isStatement(o) {
        return !this.properties.length && this.base.isStatement(o);
      }
    }, {
      key: 'assigns',
      value: function assigns(name) {
        return !this.properties.length && this.base.assigns(name);
      }
    }, {
      key: 'jumps',
      value: function jumps(o) {
        return !this.properties.length && this.base.jumps(o);
      }
    }, {
      key: 'isObject',
      value: function isObject(onlyGenerated) {
        if (this.properties.length) {
          return false;
        }
        return this.base instanceof Obj && (!onlyGenerated || this.base.generated);
      }
    }, {
      key: 'isSplice',
      value: function isSplice() {
        var lastProp = this.properties[this.properties.length - 1];
        return lastProp instanceof Slice;
      }
    }, {
      key: 'looksStatic',
      value: function looksStatic(className) {
        return this.base.value === className && this.properties.length === 1 && (this.properties[0].name != null ? this.properties[0].name.value : undefined) !== 'prototype';
      }

      // The value can be unwrapped as its inner node, if there are no attached
      // properties.

    }, {
      key: 'unwrap',
      value: function unwrap() {
        if (this.properties.length) {
          return this;
        }return this.base;
      }

      // A reference has base part (`this` value) and name part.
      // We cache them separately for compiling complex expressions.
      // `a()[b()] ?= c` -> `(_base = a())[_name = b()] ? _base[_name] = c`

    }, {
      key: 'cacheReference',
      value: function cacheReference(o) {
        var bref = void 0;var nref = void 0;
        var name = this.properties[this.properties.length - 1];
        if (this.properties.length < 2 && !this.base.isComplex() && !(name != null ? name.isComplex() : undefined)) {
          return [this, this]; // `a` `a.b`
        }
        var base = new Value(this.base, this.properties.slice(0, -1));
        if (base.isComplex()) {
          // `a().b`
          bref = new IdentifierLiteral(o.scope.freeVariable('base'));
          base = new Value(new Parens(new Assign(bref, base)));
        }
        if (!name) {
          return [base, bref];
        } // `a()`
        if (name.isComplex()) {
          // `a[b()]`
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

    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        this.base.front = this.front;
        var props = this.properties;
        var fragments = this.base.compileToFragments(o, props.length ? LEVEL_ACCESS : null);
        if (props.length && SIMPLENUM.test(fragmentsToText(fragments))) {
          fragments.push(this.makeCode('.'));
        }
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = Array.from(props)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var prop = _step7.value;

            fragments.push.apply(fragments, _toConsumableArray(Array.from(prop.compileToFragments(o) || [])));
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        return fragments;
      }

      // Unfold a soak into an `If`: `a?.b` -> `a.b if a?`

    }, {
      key: 'unfoldSoak',
      value: function unfoldSoak(o) {
        var _this20 = this;

        return this.unfoldedSoak != null ? this.unfoldedSoak : this.unfoldedSoak = function () {
          var ifn = void 0;
          if (ifn = _this20.base.unfoldSoak(o)) {
            var _ifn$body$properties;

            (_ifn$body$properties = ifn.body.properties).push.apply(_ifn$body$properties, _toConsumableArray(Array.from(_this20.properties || [])));
            return ifn;
          }
          for (var i = 0; i < _this20.properties.length; i++) {
            var prop = _this20.properties[i];
            if (prop.soak) {
              prop.soak = false;
              var fst = new Value(_this20.base, _this20.properties.slice(0, i));
              var snd = new Value(_this20.base, _this20.properties.slice(i));
              if (fst.isComplex()) {
                var ref = new IdentifierLiteral(o.scope.freeVariable('ref'));
                fst = new Parens(new Assign(ref, fst));
                snd.base = ref;
              }
              return new If(new Existence(fst), snd, { soak: true });
            }
          }
          return false;
        }();
      }
    }]);

    return Value;
  }(Base);
  Value.initClass();
  return Value;
}();

// ### Comment

// CoffeeScript passes through block comments as JavaScript block comments
// at the same position.
exports.Comment = Comment = function () {
  Comment = function (_Base5) {
    _inherits(Comment, _Base5);

    _createClass(Comment, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.isStatement = YES;
        this.prototype.makeReturn = THIS;
      }
    }]);

    function Comment(comment) {
      _classCallCheck(this, Comment);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this21 = _possibleConstructorReturn(this, (Comment.__proto__ || Object.getPrototypeOf(Comment)).call(this));
        }
        var thisFn = function () {
          return _this21;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this21.comment = comment;
      return _possibleConstructorReturn(_this21);
    }

    _createClass(Comment, [{
      key: 'compileNode',
      value: function compileNode(o, level) {
        var comment = this.comment.replace(/^(\s*)#(?=\s)/gm, '$1 *');
        var code = '/*' + multident(comment, this.tab) + (Array.from(comment).includes('\n') ? '\n' + this.tab : '') + ' */';
        if ((level || o.level) === LEVEL_TOP) {
          code = o.indent + code;
        }
        return [this.makeCode('\n'), this.makeCode(code)];
      }
    }]);

    return Comment;
  }(Base);
  Comment.initClass();
  return Comment;
}();

// ### Call

// Node for a function invocation.
exports.Call = Call = function () {
  Call = function (_Base6) {
    _inherits(Call, _Base6);

    _createClass(Call, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['variable', 'args'];
      }
    }]);

    function Call(variable, args, soak) {
      _classCallCheck(this, Call);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this22 = _possibleConstructorReturn(this, (Call.__proto__ || Object.getPrototypeOf(Call)).call(this));
        }
        var thisFn = function () {
          return _this22;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this22.variable = variable;
      if (args == null) {
        args = [];
      }
      _this22.args = args;
      _this22.soak = soak;
      _this22.isNew = false;
      if (_this22.variable instanceof Value && _this22.variable.isNotCallable()) {
        _this22.variable.error('literal is not a function');
      }
      return _possibleConstructorReturn(_this22);
    }

    // When setting the location, we sometimes need to update the start location to
    // account for a newly-discovered `new` operator to the left of us. This
    // expands the range on the left, but not the right.


    _createClass(Call, [{
      key: 'updateLocationDataIfMissing',
      value: function updateLocationDataIfMissing(locationData) {
        if (this.locationData && this.needsUpdatedStartLocation) {
          this.locationData.first_line = locationData.first_line;
          this.locationData.first_column = locationData.first_column;
          var base = (this.variable != null ? this.variable.base : undefined) || this.variable;
          if (base.needsUpdatedStartLocation) {
            this.variable.locationData.first_line = locationData.first_line;
            this.variable.locationData.first_column = locationData.first_column;
            base.updateLocationDataIfMissing(locationData);
          }
          delete this.needsUpdatedStartLocation;
        }
        return _get(Call.prototype.__proto__ || Object.getPrototypeOf(Call.prototype), 'updateLocationDataIfMissing', this).apply(this, arguments);
      }

      // Tag this invocation as creating a new instance.

    }, {
      key: 'newInstance',
      value: function newInstance() {
        var base = (this.variable != null ? this.variable.base : undefined) || this.variable;
        if (base instanceof Call && !base.isNew) {
          base.newInstance();
        } else {
          this.isNew = true;
        }
        this.needsUpdatedStartLocation = true;
        return this;
      }

      // Soaked chained invocations unfold into if/else ternary structures.

    }, {
      key: 'unfoldSoak',
      value: function unfoldSoak(o) {
        var ifn = void 0;
        if (this.soak) {
          var left = void 0;var rite = void 0;
          if (this instanceof SuperCall) {
            left = new Literal(this.superReference(o));
            rite = new Value(left);
          } else {
            if (ifn = _unfoldSoak(o, this, 'variable')) {
              return ifn;
            }

            var _Array$from5 = Array.from(new Value(this.variable).cacheReference(o));

            var _Array$from6 = _slicedToArray(_Array$from5, 2);

            left = _Array$from6[0];
            rite = _Array$from6[1];
          }
          rite = new Call(rite, this.args);
          rite.isNew = this.isNew;
          left = new Literal('typeof ' + left.compile(o) + ' === "function"');
          return new If(left, new Value(rite), { soak: true });
        }
        var call = this;
        var list = [];
        while (true) {
          if (call.variable instanceof Call) {
            list.push(call);
            call = call.variable;
            continue;
          }
          if (!(call.variable instanceof Value)) {
            break;
          }
          list.push(call);
          if (!((call = call.variable.base) instanceof Call)) {
            break;
          }
        }
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = Array.from(list.reverse())[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            call = _step8.value;

            if (ifn) {
              if (call.variable instanceof Call) {
                call.variable = ifn;
              } else {
                call.variable.base = ifn;
              }
            }
            ifn = _unfoldSoak(o, call, 'variable');
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        return ifn;
      }

      // Compile a vanilla function call.

    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        if (this.variable != null) {
          this.variable.front = this.front;
        }
        var compiledArray = Splat.compileSplattedArray(o, this.args, true);
        if (compiledArray.length) {
          return this.compileSplat(o, compiledArray);
        }
        var compiledArgs = [];
        for (var argIndex = 0; argIndex < this.args.length; argIndex++) {
          var arg = this.args[argIndex];
          if (argIndex) {
            compiledArgs.push(this.makeCode(', '));
          }
          compiledArgs.push.apply(compiledArgs, _toConsumableArray(Array.from(arg.compileToFragments(o, LEVEL_LIST) || [])));
        }

        var fragments = [];
        if (this instanceof SuperCall) {
          var preface = this.superReference(o) + '.call(' + this.superThis(o);
          if (compiledArgs.length) {
            preface += ', ';
          }
          fragments.push(this.makeCode(preface));
        } else {
          if (this.isNew) {
            fragments.push(this.makeCode('new '));
          }
          fragments.push.apply(fragments, _toConsumableArray(Array.from(this.variable.compileToFragments(o, LEVEL_ACCESS) || [])));
          fragments.push(this.makeCode('('));
        }
        fragments.push.apply(fragments, _toConsumableArray(Array.from(compiledArgs || [])));
        fragments.push(this.makeCode(')'));
        return fragments;
      }

      // If you call a function with a splat, it's converted into a JavaScript
      // `.apply()` call to allow an array of arguments to be passed.
      // If it's a constructor, then things get real tricky. We have to inject an
      // inner constructor in order to be able to pass the varargs.
      //
      // splatArgs is an array of CodeFragments to put into the 'apply'.

    }, {
      key: 'compileSplat',
      value: function compileSplat(o, splatArgs) {
        var name = void 0;var ref = void 0;
        if (this instanceof SuperCall) {
          return [].concat(this.makeCode(this.superReference(o) + '.apply(' + this.superThis(o) + ', '), splatArgs, this.makeCode(')'));
        }

        if (this.isNew) {
          var idt = this.tab + TAB;
          return [].concat(this.makeCode('(function(func, args, ctor) {\n' + idt + 'ctor.prototype = func.prototype;\n' + idt + 'var child = new ctor, result = func.apply(child, args);\n' + idt + 'return Object(result) === result ? result : child;\n' + this.tab + '})('), this.variable.compileToFragments(o, LEVEL_LIST), this.makeCode(', '), splatArgs, this.makeCode(', function(){})'));
        }

        var answer = [];
        var base = new Value(this.variable);
        if ((name = base.properties.pop()) && base.isComplex()) {
          ref = o.scope.freeVariable('ref');
          answer = answer.concat(this.makeCode('(' + ref + ' = '), base.compileToFragments(o, LEVEL_LIST), this.makeCode(')'), name.compileToFragments(o));
        } else {
          var fun = base.compileToFragments(o, LEVEL_ACCESS);
          if (SIMPLENUM.test(fragmentsToText(fun))) {
            fun = this.wrapInBraces(fun);
          }
          if (name) {
            var _fun;

            ref = fragmentsToText(fun);
            (_fun = fun).push.apply(_fun, _toConsumableArray(Array.from(name.compileToFragments(o) || [])));
          } else {
            ref = 'null';
          }
          answer = answer.concat(fun);
        }
        return answer = answer.concat(this.makeCode('.apply(' + ref + ', '), splatArgs, this.makeCode(')'));
      }
    }]);

    return Call;
  }(Base);
  Call.initClass();
  return Call;
}();

// ### Super

// Takes care of converting `super()` calls into calls against the prototype's
// function of the same name.
exports.SuperCall = SuperCall = function (_Call) {
  _inherits(SuperCall, _Call);

  function SuperCall(args) {
    _classCallCheck(this, SuperCall);

    // Allow to recognize a bare `super` call without parentheses and arguments.
    var _this23 = _possibleConstructorReturn(this, (SuperCall.__proto__ || Object.getPrototypeOf(SuperCall)).call(this, null, args != null ? args : [new Splat(new IdentifierLiteral('arguments'))]));

    _this23.isBare = args != null;
    return _this23;
  }

  // Grab the reference to the superclass's implementation of the current
  // method.


  _createClass(SuperCall, [{
    key: 'superReference',
    value: function superReference(o) {
      var name = void 0;
      var method = o.scope.namedMethod();
      if (method != null ? method.klass : undefined) {
        var bref = void 0;var klass = void 0;var nref = void 0;var variable = void 0;
        klass = method.klass;
        name = method.name;
        variable = method.variable;

        if (klass.isComplex()) {
          bref = new IdentifierLiteral(o.scope.parent.freeVariable('base'));
          var base = new Value(new Parens(new Assign(bref, klass)));
          variable.base = base;
          variable.properties.splice(0, klass.properties.length);
        }
        if (name.isComplex() || name instanceof Index && name.index.isAssignable()) {
          nref = new IdentifierLiteral(o.scope.parent.freeVariable('name'));
          name = new Index(new Assign(nref, name.index));
          variable.properties.pop();
          variable.properties.push(name);
        }
        var accesses = [new Access(new PropertyName('__super__'))];
        if (method.static) {
          accesses.push(new Access(new PropertyName('constructor')));
        }
        accesses.push(nref != null ? new Index(nref) : name);
        return new Value(bref != null ? bref : klass, accesses).compile(o);
      }if (method != null ? method.ctor : undefined) {
        return method.name + '.__super__.constructor';
      }
      return this.error('cannot call super outside of an instance method.');
    }

    // The appropriate `this` value for a `super` call.

  }, {
    key: 'superThis',
    value: function superThis(o) {
      var method = o.scope.method;

      return method && !method.klass && method.context || 'this';
    }
  }]);

  return SuperCall;
}(Call);

// ### RegexWithInterpolations

// Regexes with interpolations are in fact just a variation of a `Call` (a
// `RegExp()` call to be precise) with a `StringWithInterpolations` inside.
exports.RegexWithInterpolations = RegexWithInterpolations = function (_Call2) {
  _inherits(RegexWithInterpolations, _Call2);

  function RegexWithInterpolations(args) {
    _classCallCheck(this, RegexWithInterpolations);

    if (args == null) {
      args = [];
    }
    return _possibleConstructorReturn(this, (RegexWithInterpolations.__proto__ || Object.getPrototypeOf(RegexWithInterpolations)).call(this, new Value(new IdentifierLiteral('RegExp')), args, false));
  }

  return RegexWithInterpolations;
}(Call);

// ### TaggedTemplateCall

exports.TaggedTemplateCall = TaggedTemplateCall = function (_Call3) {
  _inherits(TaggedTemplateCall, _Call3);

  function TaggedTemplateCall(variable, arg, soak) {
    _classCallCheck(this, TaggedTemplateCall);

    if (arg instanceof StringLiteral) {
      arg = new StringWithInterpolations(Block.wrap([new Value(arg)]));
    }
    return _possibleConstructorReturn(this, (TaggedTemplateCall.__proto__ || Object.getPrototypeOf(TaggedTemplateCall)).call(this, variable, [arg], soak));
  }

  _createClass(TaggedTemplateCall, [{
    key: 'compileNode',
    value: function compileNode(o) {
      // Tell `StringWithInterpolations` whether to compile as ES2015 or not; will be removed in CoffeeScript 2.
      o.inTaggedTemplateCall = true;
      return this.variable.compileToFragments(o, LEVEL_ACCESS).concat(this.args[0].compileToFragments(o, LEVEL_LIST));
    }
  }]);

  return TaggedTemplateCall;
}(Call);

// ### Extends

// Node to extend an object's prototype with an ancestor object.
// After `goog.inherits` from the
// [Closure Library](https://github.com/google/closure-library/blob/master/closure/goog/base.js).
exports.Extends = Extends = function () {
  Extends = function (_Base7) {
    _inherits(Extends, _Base7);

    _createClass(Extends, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['child', 'parent'];
      }
    }]);

    function Extends(child, parent) {
      _classCallCheck(this, Extends);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this26 = _possibleConstructorReturn(this, (Extends.__proto__ || Object.getPrototypeOf(Extends)).call(this));
        }
        var thisFn = function () {
          return _this26;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this26.child = child;
      _this26.parent = parent;
      return _possibleConstructorReturn(_this26);
    }

    // Hooks one constructor into another's prototype chain.


    _createClass(Extends, [{
      key: 'compileToFragments',
      value: function compileToFragments(o) {
        return new Call(new Value(new Literal(utility('extend', o))), [this.child, this.parent]).compileToFragments(o);
      }
    }]);

    return Extends;
  }(Base);
  Extends.initClass();
  return Extends;
}();

// ### Access

// A `.` access into a property of a value, or the `::` shorthand for
// an access into the object's prototype.
exports.Access = Access = function () {
  Access = function (_Base8) {
    _inherits(Access, _Base8);

    _createClass(Access, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['name'];

        this.prototype.isComplex = NO;
      }
    }]);

    function Access(name, tag) {
      _classCallCheck(this, Access);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this27 = _possibleConstructorReturn(this, (Access.__proto__ || Object.getPrototypeOf(Access)).call(this));
        }
        var thisFn = function () {
          return _this27;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this27.name = name;
      _this27.soak = tag === 'soak';
      return _possibleConstructorReturn(_this27);
    }

    _createClass(Access, [{
      key: 'compileToFragments',
      value: function compileToFragments(o) {
        var name = this.name.compileToFragments(o);
        var node = this.name.unwrap();
        if (node instanceof PropertyName) {
          if (Array.from(JS_FORBIDDEN).includes(node.value)) {
            return [this.makeCode('["')].concat(_toConsumableArray(Array.from(name)), [this.makeCode('"]')]);
          }
          return [this.makeCode('.')].concat(_toConsumableArray(Array.from(name)));
        }
        return [this.makeCode('[')].concat(_toConsumableArray(Array.from(name)), [this.makeCode(']')]);
      }
    }]);

    return Access;
  }(Base);
  Access.initClass();
  return Access;
}();

// ### Index

// A `[ ... ]` indexed access into an array or object.
exports.Index = Index = function () {
  Index = function (_Base9) {
    _inherits(Index, _Base9);

    _createClass(Index, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['index'];
      }
    }]);

    function Index(index) {
      _classCallCheck(this, Index);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this28 = _possibleConstructorReturn(this, (Index.__proto__ || Object.getPrototypeOf(Index)).call(this));
        }
        var thisFn = function () {
          return _this28;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this28.index = index;
      return _possibleConstructorReturn(_this28);
    }

    _createClass(Index, [{
      key: 'compileToFragments',
      value: function compileToFragments(o) {
        return [].concat(this.makeCode('['), this.index.compileToFragments(o, LEVEL_PAREN), this.makeCode(']'));
      }
    }, {
      key: 'isComplex',
      value: function isComplex() {
        return this.index.isComplex();
      }
    }]);

    return Index;
  }(Base);
  Index.initClass();
  return Index;
}();

// ### Range

// A range literal. Ranges can be used to extract portions (slices) of arrays,
// to specify a range for comprehensions, or as a value, to be expanded into the
// corresponding array of integers at runtime.
exports.Range = Range = function () {
  Range = function (_Base10) {
    _inherits(Range, _Base10);

    _createClass(Range, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['from', 'to'];
      }
    }]);

    function Range(from, to, tag) {
      _classCallCheck(this, Range);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this29 = _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).call(this));
        }
        var thisFn = function () {
          return _this29;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this29.from = from;
      _this29.to = to;
      _this29.exclusive = tag === 'exclusive';
      _this29.equals = _this29.exclusive ? '' : '=';
      return _possibleConstructorReturn(_this29);
    }

    // Compiles the range's source variables -- where it starts and where it ends.
    // But only if they need to be cached to avoid double evaluation.


    _createClass(Range, [{
      key: 'compileVariables',
      value: function compileVariables(o) {
        var step = void 0;
        o = merge(o, { top: true });
        var isComplex = del(o, 'isComplex');

        var _Array$from7 = Array.from(this.cacheToCodeFragments(this.from.cache(o, LEVEL_LIST, isComplex)));

        var _Array$from8 = _slicedToArray(_Array$from7, 2);

        this.fromC = _Array$from8[0];
        this.fromVar = _Array$from8[1];

        var _Array$from9 = Array.from(this.cacheToCodeFragments(this.to.cache(o, LEVEL_LIST, isComplex)));

        var _Array$from10 = _slicedToArray(_Array$from9, 2);

        this.toC = _Array$from10[0];
        this.toVar = _Array$from10[1];

        if (step = del(o, 'step')) {
          var _Array$from11 = Array.from(this.cacheToCodeFragments(step.cache(o, LEVEL_LIST, isComplex)));

          var _Array$from12 = _slicedToArray(_Array$from11, 2);

          this.step = _Array$from12[0];
          this.stepVar = _Array$from12[1];
        }
        this.fromNum = this.from.isNumber() ? Number(this.fromVar) : null;
        this.toNum = this.to.isNumber() ? Number(this.toVar) : null;
        return this.stepNum = (step != null ? step.isNumber() : undefined) ? Number(this.stepVar) : null;
      }

      // When compiled normally, the range returns the contents of the *for loop*
      // needed to iterate over the values in the range. Used by comprehensions.

    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var _this30 = this;

        var from = void 0;var to = void 0;var cond = void 0;
        if (!this.fromVar) {
          this.compileVariables(o);
        }
        if (!o.index) {
          return this.compileArray(o);
        }

        // Set up endpoints.
        var known = this.fromNum != null && this.toNum != null;
        var idx = del(o, 'index');
        var idxName = del(o, 'name');
        var namedIndex = idxName && idxName !== idx;
        var varPart = idx + ' = ' + this.fromC;
        if (this.toC !== this.toVar) {
          varPart += ', ' + this.toC;
        }
        if (this.step !== this.stepVar) {
          varPart += ', ' + this.step;
        }

        var _Array$from13 = Array.from([idx + ' <' + this.equals, idx + ' >' + this.equals]),
            _Array$from14 = _slicedToArray(_Array$from13, 2),
            lt = _Array$from14[0],
            gt = _Array$from14[1];

        // Generate the condition.


        var condPart = function () {
          if (_this30.stepNum != null) {
            if (_this30.stepNum > 0) {
              return lt + ' ' + _this30.toVar;
            }return gt + ' ' + _this30.toVar;
          }if (known) {
            var _Array$from15 = Array.from([_this30.fromNum, _this30.toNum]);

            var _Array$from16 = _slicedToArray(_Array$from15, 2);

            from = _Array$from16[0];
            to = _Array$from16[1];

            if (from <= to) {
              return lt + ' ' + to;
            }return gt + ' ' + to;
          }
          cond = _this30.stepVar ? _this30.stepVar + ' > 0' : _this30.fromVar + ' <= ' + _this30.toVar;
          return cond + ' ? ' + lt + ' ' + _this30.toVar + ' : ' + gt + ' ' + _this30.toVar;
        }();

        // Generate the step.
        var stepPart = this.stepVar ? idx + ' += ' + this.stepVar : known ? namedIndex ? from <= to ? '++' + idx : '--' + idx : from <= to ? idx + '++' : idx + '--' : namedIndex ? cond + ' ? ++' + idx + ' : --' + idx : cond + ' ? ' + idx + '++ : ' + idx + '--';

        if (namedIndex) {
          varPart = idxName + ' = ' + varPart;
        }
        if (namedIndex) {
          stepPart = idxName + ' = ' + stepPart;
        }

        // The final loop body.
        return [this.makeCode(varPart + '; ' + condPart + '; ' + stepPart)];
      }

      // When used as a value, expand the range into the equivalent array.

    }, {
      key: 'compileArray',
      value: function compileArray(o) {
        var args = void 0;var body = void 0;
        var known = this.fromNum != null && this.toNum != null;
        if (known && Math.abs(this.fromNum - this.toNum) <= 20) {
          var range = __range__(this.fromNum, this.toNum, true);
          if (this.exclusive) {
            range.pop();
          }
          return [this.makeCode('[' + range.join(', ') + ']')];
        }
        var idt = this.tab + TAB;
        var i = o.scope.freeVariable('i', { single: true });
        var result = o.scope.freeVariable('results');
        var pre = '\n' + idt + result + ' = [];';
        if (known) {
          o.index = i;
          body = fragmentsToText(this.compileNode(o));
        } else {
          var vars = i + ' = ' + this.fromC + (this.toC !== this.toVar ? ', ' + this.toC : '');
          var cond = this.fromVar + ' <= ' + this.toVar;
          body = 'var ' + vars + '; ' + cond + ' ? ' + i + ' <' + this.equals + ' ' + this.toVar + ' : ' + i + ' >' + this.equals + ' ' + this.toVar + '; ' + cond + ' ? ' + i + '++ : ' + i + '--';
        }
        var post = '{ ' + result + '.push(' + i + '); }\n' + idt + 'return ' + result + ';\n' + o.indent;
        var hasArgs = function hasArgs(node) {
          return node != null ? node.contains(isLiteralArguments) : undefined;
        };
        if (hasArgs(this.from) || hasArgs(this.to)) {
          args = ', arguments';
        }
        return [this.makeCode('(function() {' + pre + '\n' + idt + 'for (' + body + ')' + post + '}).apply(this' + (args != null ? args : '') + ')')];
      }
    }]);

    return Range;
  }(Base);
  Range.initClass();
  return Range;
}();

// ### Slice

// An array slice literal. Unlike JavaScript's `Array#slice`, the second parameter
// specifies the index of the end of the slice, just as the first parameter
// is the index of the beginning.
exports.Slice = Slice = function () {
  Slice = function (_Base11) {
    _inherits(Slice, _Base11);

    _createClass(Slice, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['range'];
      }
    }]);

    function Slice(range) {
      var _this31;

      _classCallCheck(this, Slice);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this31 = _possibleConstructorReturn(this, (Slice.__proto__ || Object.getPrototypeOf(Slice)).call(this));
        }
        var thisFn = function () {
          return _this31;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this31.range = range;
      return _this31 = _possibleConstructorReturn(this, (Slice.__proto__ || Object.getPrototypeOf(Slice)).call(this));
    }

    // We have to be careful when trying to slice through the end of the array,
    // `9e9` is used because not all implementations respect `undefined` or `1/0`.
    // `9e9` should be safe because `9e9` > `2**32`, the max array length.


    _createClass(Slice, [{
      key: 'compileNode',
      value: function compileNode(o) {
        var _this32 = this;

        var toStr = void 0;
        var compiled = void 0;
        var _range = this.range,
            to = _range.to,
            from = _range.from;

        var fromCompiled = from && from.compileToFragments(o, LEVEL_PAREN) || [this.makeCode('0')];
        // TODO: jwalton - move this into the 'if'?
        if (to) {
          compiled = to.compileToFragments(o, LEVEL_PAREN);
          var compiledText = fragmentsToText(compiled);
          if (!(!this.range.exclusive && +compiledText === -1)) {
            toStr = ', ' + function () {
              if (_this32.range.exclusive) {
                return compiledText;
              }if (to.isNumber()) {
                return '' + (+compiledText + 1);
              }
              compiled = to.compileToFragments(o, LEVEL_ACCESS);
              return '+' + fragmentsToText(compiled) + ' + 1 || 9e9';
            }();
          }
        }
        return [this.makeCode('.slice(' + fragmentsToText(fromCompiled) + (toStr || '') + ')')];
      }
    }]);

    return Slice;
  }(Base);
  Slice.initClass();
  return Slice;
}();

// ### Obj

// An object literal, nothing fancy.
exports.Obj = Obj = function () {
  Obj = function (_Base12) {
    _inherits(Obj, _Base12);

    _createClass(Obj, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['properties'];
      }
    }]);

    function Obj(props, generated) {
      _classCallCheck(this, Obj);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this33 = _possibleConstructorReturn(this, (Obj.__proto__ || Object.getPrototypeOf(Obj)).call(this));
        }
        var thisFn = function () {
          return _this33;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      if (generated == null) {
        generated = false;
      }
      _this33.generated = generated;
      _this33.objects = _this33.properties = props || [];
      return _possibleConstructorReturn(_this33);
    }

    _createClass(Obj, [{
      key: 'compileNode',
      value: function compileNode(o) {
        var dynamicIndex = void 0;var oref = void 0;var prop = void 0;
        var props = this.properties;
        if (this.generated) {
          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = Array.from(props)[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var node = _step9.value;

              if (node instanceof Value) {
                node.error('cannot have an implicit value in an implicit object');
              }
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9.return) {
                _iterator9.return();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }
        }
        for (dynamicIndex = 0; dynamicIndex < props.length; dynamicIndex++) {
          prop = props[dynamicIndex];if ((prop.variable || prop).base instanceof Parens) {
            break;
          }
        }
        var hasDynamic = dynamicIndex < props.length;
        var idt = o.indent += TAB;
        var lastNoncom = this.lastNonComment(this.properties);
        var answer = [];
        if (hasDynamic) {
          oref = o.scope.freeVariable('obj');
          answer.push(this.makeCode('(\n' + idt + oref + ' = '));
        }
        answer.push(this.makeCode('{' + (props.length === 0 || dynamicIndex === 0 ? '}' : '\n')));
        for (var i = 0; i < props.length; i++) {
          prop = props[i];
          if (i === dynamicIndex) {
            if (i !== 0) {
              answer.push(this.makeCode('\n' + idt + '}'));
            }
            answer.push(this.makeCode(',\n'));
          }
          var join = i === props.length - 1 || i === dynamicIndex - 1 ? '' : prop === lastNoncom || prop instanceof Comment ? '\n' : ',\n';
          var indent = prop instanceof Comment ? '' : idt;
          if (hasDynamic && i < dynamicIndex) {
            indent += TAB;
          }
          if (prop instanceof Assign) {
            if (prop.context !== 'object') {
              prop.operatorToken.error('unexpected ' + prop.operatorToken.value);
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
              var key;var value;
              if (prop instanceof Assign) {
                key = prop.variable;
                var _prop = prop;
                value = _prop.value;
              } else {
                var _Array$from17 = Array.from(prop.base.cache(o));

                var _Array$from18 = _slicedToArray(_Array$from17, 2);

                key = _Array$from18[0];
                value = _Array$from18[1];

                if (key instanceof IdentifierLiteral) {
                  key = new PropertyName(key.value);
                }
              }
              prop = new Assign(new Value(new IdentifierLiteral(oref), [new Access(key)]), value);
            }
          }
          if (indent) {
            answer.push(this.makeCode(indent));
          }
          answer.push.apply(answer, _toConsumableArray(Array.from(prop.compileToFragments(o, LEVEL_TOP) || [])));
          if (join) {
            answer.push(this.makeCode(join));
          }
        }
        if (hasDynamic) {
          answer.push(this.makeCode(',\n' + idt + oref + '\n' + this.tab + ')'));
        } else if (props.length !== 0) {
          answer.push(this.makeCode('\n' + this.tab + '}'));
        }
        if (this.front && !hasDynamic) {
          return this.wrapInBraces(answer);
        }return answer;
      }
    }, {
      key: 'assigns',
      value: function assigns(name) {
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = Array.from(this.properties)[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var prop = _step10.value;
            if (prop.assigns(name)) {
              return true;
            }
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10.return) {
              _iterator10.return();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }

        return false;
      }
    }]);

    return Obj;
  }(Base);
  Obj.initClass();
  return Obj;
}();

// ### Arr

// An array literal.
exports.Arr = Arr = function () {
  Arr = function (_Base13) {
    _inherits(Arr, _Base13);

    _createClass(Arr, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['objects'];
      }
    }]);

    function Arr(objs) {
      _classCallCheck(this, Arr);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this34 = _possibleConstructorReturn(this, (Arr.__proto__ || Object.getPrototypeOf(Arr)).call(this));
        }
        var thisFn = function () {
          return _this34;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this34.objects = objs || [];
      return _possibleConstructorReturn(_this34);
    }

    _createClass(Arr, [{
      key: 'compileNode',
      value: function compileNode(o) {
        if (!this.objects.length) {
          return [this.makeCode('[]')];
        }
        o.indent += TAB;
        var answer = Splat.compileSplattedArray(o, this.objects);
        if (answer.length) {
          return answer;
        }

        answer = [];
        var compiledObjs = Array.from(this.objects).map(function (obj) {
          return obj.compileToFragments(o, LEVEL_LIST);
        });
        for (var index = 0; index < compiledObjs.length; index++) {
          var _answer;

          var fragments = compiledObjs[index];
          if (index) {
            answer.push(this.makeCode(', '));
          }
          (_answer = answer).push.apply(_answer, _toConsumableArray(Array.from(fragments || [])));
        }
        if (fragmentsToText(answer).indexOf('\n') >= 0) {
          answer.unshift(this.makeCode('[\n' + o.indent));
          answer.push(this.makeCode('\n' + this.tab + ']'));
        } else {
          answer.unshift(this.makeCode('['));
          answer.push(this.makeCode(']'));
        }
        return answer;
      }
    }, {
      key: 'assigns',
      value: function assigns(name) {
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = Array.from(this.objects)[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var obj = _step11.value;
            if (obj.assigns(name)) {
              return true;
            }
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11.return) {
              _iterator11.return();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }

        return false;
      }
    }]);

    return Arr;
  }(Base);
  Arr.initClass();
  return Arr;
}();

// ### Class

// The CoffeeScript class definition.
// Initialize a **Class** with its name, an optional superclass, and a
// list of prototype property assignments.
exports.Class = Class = function () {
  Class = function (_Base14) {
    _inherits(Class, _Base14);

    _createClass(Class, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['variable', 'parent', 'body'];

        this.prototype.defaultClassVariableName = '_Class';
      }
    }]);

    function Class(variable, parent, body) {
      _classCallCheck(this, Class);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this35 = _possibleConstructorReturn(this, (Class.__proto__ || Object.getPrototypeOf(Class)).call(this));
        }
        var thisFn = function () {
          return _this35;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this35.variable = variable;
      _this35.parent = parent;
      if (body == null) {
        body = new Block();
      }
      _this35.body = body;
      _this35.boundFuncs = [];
      _this35.body.classBody = true;
      return _possibleConstructorReturn(_this35);
    }

    // Figure out the appropriate name for the constructor function of this class.


    _createClass(Class, [{
      key: 'determineName',
      value: function determineName() {
        if (!this.variable) {
          return this.defaultClassVariableName;
        }
        var tail = this.variable.properties[this.variable.properties.length - 1];
        var node = tail ? tail instanceof Access && tail.name : this.variable.base;
        if (!(node instanceof IdentifierLiteral) && !(node instanceof PropertyName)) {
          return this.defaultClassVariableName;
        }
        var name = node.value;
        if (!tail) {
          var message = isUnassignable(name);
          if (message) {
            this.variable.error(message);
          }
        }
        if (Array.from(JS_FORBIDDEN).includes(name)) {
          return '_' + name;
        }return name;
      }

      // For all `this`-references and bound functions in the class definition,
      // `this` is the Class being constructed.

    }, {
      key: 'setContext',
      value: function setContext(name) {
        return this.body.traverseChildren(false, function (node) {
          if (node.classBody) {
            return false;
          }
          if (node instanceof ThisLiteral) {
            return node.value = name;
          }if (node instanceof Code) {
            if (node.bound) {
              return node.context = name;
            }
          }
        });
      }

      // Ensure that all functions bound to the instance are proxied in the
      // constructor.

    }, {
      key: 'addBoundFunctions',
      value: function addBoundFunctions(o) {
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
          for (var _iterator12 = Array.from(this.boundFuncs)[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
            var bvar = _step12.value;

            var lhs = new Value(new ThisLiteral(), [new Access(bvar)]).compile(o);
            this.ctor.body.unshift(new Literal(lhs + ' = ' + utility('bind', o) + '(' + lhs + ', this)'));
          }
        } catch (err) {
          _didIteratorError12 = true;
          _iteratorError12 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion12 && _iterator12.return) {
              _iterator12.return();
            }
          } finally {
            if (_didIteratorError12) {
              throw _iteratorError12;
            }
          }
        }
      }

      // Merge the properties from a top-level object as prototypal properties
      // on the class.

    }, {
      key: 'addProperties',
      value: function addProperties(node, name, o) {
        var _this36 = this;

        var props = node.base.properties.slice();
        var exprs = function () {
          var assign = void 0;
          var result = [];
          while (assign = props.shift()) {
            if (assign instanceof Assign) {
              var base = assign.variable.base;

              delete assign.context;
              var func = assign.value;
              if (base.value === 'constructor') {
                if (_this36.ctor) {
                  assign.error('cannot define more than one constructor in a class');
                }
                if (func.bound) {
                  assign.error('cannot define a constructor as a bound function');
                }
                if (func instanceof Code) {
                  assign = _this36.ctor = func;
                } else {
                  _this36.externalCtor = o.classScope.freeVariable('ctor');
                  assign = new Assign(new IdentifierLiteral(_this36.externalCtor), func);
                }
              } else if (assign.variable.this) {
                func.static = true;
              } else {
                var acc = base.isComplex() ? new Index(base) : new Access(base);
                assign.variable = new Value(new IdentifierLiteral(name), [new Access(new PropertyName('prototype')), acc]);
                if (func instanceof Code && func.bound) {
                  _this36.boundFuncs.push(base);
                  func.bound = false;
                }
              }
            }
            result.push(assign);
          }
          return result;
        }();
        return compact(exprs);
      }

      // Walk the body of the class, looking for prototype properties to be converted
      // and tagging static assignments.

    }, {
      key: 'walkBody',
      value: function walkBody(name, o) {
        var _this37 = this;

        return this.traverseChildren(false, function (child) {
          var cont = true;
          if (child instanceof Class) {
            return false;
          }
          if (child instanceof Block) {
            var exps = void 0;
            var iterable = exps = child.expressions;
            for (var i = 0; i < iterable.length; i++) {
              var node = iterable[i];
              if (node instanceof Assign && node.variable.looksStatic(name)) {
                node.value.static = true;
              } else if (node instanceof Value && node.isObject(true)) {
                cont = false;
                exps[i] = _this37.addProperties(node, name, o);
              }
            }
            child.expressions = exps = flatten(exps);
          }
          return cont && !(child instanceof Class);
        });
      }

      // `use strict` (and other directives) must be the first expression statement(s)
      // of a function body. This method ensures the prologue is correctly positioned
      // above the `constructor`.

    }, {
      key: 'hoistDirectivePrologue',
      value: function hoistDirectivePrologue() {
        var node = void 0;
        var index = 0;
        var expressions = this.body.expressions;

        while ((node = expressions[index]) && node instanceof Comment || node instanceof Value && node.isString()) {
          ++index;
        }
        return this.directives = expressions.splice(0, index);
      }

      // Make sure that a constructor is defined for the class, and properly
      // configured.

    }, {
      key: 'ensureConstructor',
      value: function ensureConstructor(name) {
        if (!this.ctor) {
          this.ctor = new Code();
          if (this.externalCtor) {
            this.ctor.body.push(new Literal(this.externalCtor + '.apply(this, arguments)'));
          } else if (this.parent) {
            this.ctor.body.push(new Literal(name + '.__super__.constructor.apply(this, arguments)'));
          }
          this.ctor.body.makeReturn();
          this.body.expressions.unshift(this.ctor);
        }
        this.ctor.ctor = this.ctor.name = name;
        this.ctor.klass = null;
        return this.ctor.noReturn = true;
      }

      // Instead of generating the JavaScript string directly, we build up the
      // equivalent syntax tree and compile that, in pieces. You can see the
      // constructor, property assignments, and inheritance getting built out below.

    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var _body$expressions;

        var argumentsNode = void 0;var jumpNode = void 0;
        if (jumpNode = this.body.jumps()) {
          jumpNode.error('Class bodies cannot contain pure statements');
        }
        if (argumentsNode = this.body.contains(isLiteralArguments)) {
          argumentsNode.error("Class bodies shouldn't reference arguments");
        }

        var name = this.determineName();
        var lname = new IdentifierLiteral(name);
        var func = new Code([], Block.wrap([this.body]));
        var args = [];
        o.classScope = func.makeScope(o.scope);

        this.hoistDirectivePrologue();
        this.setContext(name);
        this.walkBody(name, o);
        this.ensureConstructor(name);
        this.addBoundFunctions(o);
        this.body.spaced = true;
        this.body.expressions.push(lname);

        if (this.parent) {
          var superClass = new IdentifierLiteral(o.classScope.freeVariable('superClass', { reserve: false }));
          this.body.expressions.unshift(new Extends(lname, superClass));
          func.params.push(new Param(superClass));
          args.push(this.parent);
        }

        (_body$expressions = this.body.expressions).unshift.apply(_body$expressions, _toConsumableArray(Array.from(this.directives || [])));

        var klass = new Parens(new Call(func, args));
        if (this.variable) {
          klass = new Assign(this.variable, klass, null, { moduleDeclaration: this.moduleDeclaration });
        }
        return klass.compileToFragments(o);
      }
    }]);

    return Class;
  }(Base);
  Class.initClass();
  return Class;
}();

// ### Import and Export

exports.ModuleDeclaration = ModuleDeclaration = function () {
  ModuleDeclaration = function (_Base15) {
    _inherits(ModuleDeclaration, _Base15);

    _createClass(ModuleDeclaration, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['clause', 'source'];

        this.prototype.isStatement = YES;
        this.prototype.jumps = THIS;
        this.prototype.makeReturn = THIS;
      }
    }]);

    function ModuleDeclaration(clause, source) {
      _classCallCheck(this, ModuleDeclaration);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this38 = _possibleConstructorReturn(this, (ModuleDeclaration.__proto__ || Object.getPrototypeOf(ModuleDeclaration)).call(this));
        }
        var thisFn = function () {
          return _this38;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this38.clause = clause;
      _this38.source = source;
      _this38.checkSource();
      return _possibleConstructorReturn(_this38);
    }

    _createClass(ModuleDeclaration, [{
      key: 'checkSource',
      value: function checkSource() {
        if (this.source != null && this.source instanceof StringWithInterpolations) {
          return this.source.error('the name of the module to be imported from must be an uninterpolated string');
        }
      }
    }, {
      key: 'checkScope',
      value: function checkScope(o, moduleDeclarationType) {
        if (o.indent.length !== 0) {
          return this.error(moduleDeclarationType + ' statements must be at top-level scope');
        }
      }
    }]);

    return ModuleDeclaration;
  }(Base);
  ModuleDeclaration.initClass();
  return ModuleDeclaration;
}();

exports.ImportDeclaration = ImportDeclaration = function (_ModuleDeclaration) {
  _inherits(ImportDeclaration, _ModuleDeclaration);

  function ImportDeclaration() {
    _classCallCheck(this, ImportDeclaration);

    return _possibleConstructorReturn(this, (ImportDeclaration.__proto__ || Object.getPrototypeOf(ImportDeclaration)).apply(this, arguments));
  }

  _createClass(ImportDeclaration, [{
    key: 'compileNode',
    value: function compileNode(o) {
      this.checkScope(o, 'import');
      o.importedSymbols = [];

      var code = [];
      code.push(this.makeCode(this.tab + 'import '));
      if (this.clause != null) {
        code.push.apply(code, _toConsumableArray(Array.from(this.clause.compileNode(o) || [])));
      }

      if ((this.source != null ? this.source.value : undefined) != null) {
        if (this.clause !== null) {
          code.push(this.makeCode(' from '));
        }
        code.push(this.makeCode(this.source.value));
      }

      code.push(this.makeCode(';'));
      return code;
    }
  }]);

  return ImportDeclaration;
}(ModuleDeclaration);

exports.ImportClause = ImportClause = function () {
  ImportClause = function (_Base16) {
    _inherits(ImportClause, _Base16);

    _createClass(ImportClause, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['defaultBinding', 'namedImports'];
      }
    }]);

    function ImportClause(defaultBinding, namedImports) {
      _classCallCheck(this, ImportClause);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this40 = _possibleConstructorReturn(this, (ImportClause.__proto__ || Object.getPrototypeOf(ImportClause)).call(this));
        }
        var thisFn = function () {
          return _this40;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this40.defaultBinding = defaultBinding;
      _this40.namedImports = namedImports;
      return _possibleConstructorReturn(_this40);
    }

    _createClass(ImportClause, [{
      key: 'compileNode',
      value: function compileNode(o) {
        var code = [];

        if (this.defaultBinding != null) {
          code.push.apply(code, _toConsumableArray(Array.from(this.defaultBinding.compileNode(o) || [])));
          if (this.namedImports != null) {
            code.push(this.makeCode(', '));
          }
        }

        if (this.namedImports != null) {
          code.push.apply(code, _toConsumableArray(Array.from(this.namedImports.compileNode(o) || [])));
        }

        return code;
      }
    }]);

    return ImportClause;
  }(Base);
  ImportClause.initClass();
  return ImportClause;
}();

exports.ExportDeclaration = ExportDeclaration = function (_ModuleDeclaration2) {
  _inherits(ExportDeclaration, _ModuleDeclaration2);

  function ExportDeclaration() {
    _classCallCheck(this, ExportDeclaration);

    return _possibleConstructorReturn(this, (ExportDeclaration.__proto__ || Object.getPrototypeOf(ExportDeclaration)).apply(this, arguments));
  }

  _createClass(ExportDeclaration, [{
    key: 'compileNode',
    value: function compileNode(o) {
      this.checkScope(o, 'export');

      var code = [];
      code.push(this.makeCode(this.tab + 'export '));
      if (this instanceof ExportDefaultDeclaration) {
        code.push(this.makeCode('default '));
      }

      if (!(this instanceof ExportDefaultDeclaration) && (this.clause instanceof Assign || this.clause instanceof Class)) {
        // Prevent exporting an anonymous class; all exported members must be named
        if (this.clause instanceof Class && !this.clause.variable) {
          this.clause.error('anonymous classes cannot be exported');
        }

        // When the ES2015 `class` keyword is supported, don’t add a `var` here
        code.push(this.makeCode('var '));
        this.clause.moduleDeclaration = 'export';
      }

      if (this.clause.body != null && this.clause.body instanceof Block) {
        code = code.concat(this.clause.compileToFragments(o, LEVEL_TOP));
      } else {
        code = code.concat(this.clause.compileNode(o));
      }

      if ((this.source != null ? this.source.value : undefined) != null) {
        code.push(this.makeCode(' from ' + this.source.value));
      }
      code.push(this.makeCode(';'));
      return code;
    }
  }]);

  return ExportDeclaration;
}(ModuleDeclaration);

exports.ExportNamedDeclaration = ExportNamedDeclaration = function (_ExportDeclaration) {
  _inherits(ExportNamedDeclaration, _ExportDeclaration);

  function ExportNamedDeclaration() {
    _classCallCheck(this, ExportNamedDeclaration);

    return _possibleConstructorReturn(this, (ExportNamedDeclaration.__proto__ || Object.getPrototypeOf(ExportNamedDeclaration)).apply(this, arguments));
  }

  return ExportNamedDeclaration;
}(ExportDeclaration);

exports.ExportDefaultDeclaration = ExportDefaultDeclaration = function (_ExportDeclaration2) {
  _inherits(ExportDefaultDeclaration, _ExportDeclaration2);

  function ExportDefaultDeclaration() {
    _classCallCheck(this, ExportDefaultDeclaration);

    return _possibleConstructorReturn(this, (ExportDefaultDeclaration.__proto__ || Object.getPrototypeOf(ExportDefaultDeclaration)).apply(this, arguments));
  }

  return ExportDefaultDeclaration;
}(ExportDeclaration);

exports.ExportAllDeclaration = ExportAllDeclaration = function (_ExportDeclaration3) {
  _inherits(ExportAllDeclaration, _ExportDeclaration3);

  function ExportAllDeclaration() {
    _classCallCheck(this, ExportAllDeclaration);

    return _possibleConstructorReturn(this, (ExportAllDeclaration.__proto__ || Object.getPrototypeOf(ExportAllDeclaration)).apply(this, arguments));
  }

  return ExportAllDeclaration;
}(ExportDeclaration);

exports.ModuleSpecifierList = ModuleSpecifierList = function () {
  ModuleSpecifierList = function (_Base17) {
    _inherits(ModuleSpecifierList, _Base17);

    _createClass(ModuleSpecifierList, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['specifiers'];
      }
    }]);

    function ModuleSpecifierList(specifiers) {
      _classCallCheck(this, ModuleSpecifierList);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this45 = _possibleConstructorReturn(this, (ModuleSpecifierList.__proto__ || Object.getPrototypeOf(ModuleSpecifierList)).call(this));
        }
        var thisFn = function () {
          return _this45;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this45.specifiers = specifiers;
      return _possibleConstructorReturn(_this45);
    }

    _createClass(ModuleSpecifierList, [{
      key: 'compileNode',
      value: function compileNode(o) {
        var code = [];
        o.indent += TAB;
        var compiledList = Array.from(this.specifiers).map(function (specifier) {
          return specifier.compileToFragments(o, LEVEL_LIST);
        });

        if (this.specifiers.length !== 0) {
          code.push(this.makeCode('{\n' + o.indent));
          for (var index = 0; index < compiledList.length; index++) {
            var fragments = compiledList[index];
            if (index) {
              code.push(this.makeCode(',\n' + o.indent));
            }
            code.push.apply(code, _toConsumableArray(Array.from(fragments || [])));
          }
          code.push(this.makeCode('\n}'));
        } else {
          code.push(this.makeCode('{}'));
        }
        return code;
      }
    }]);

    return ModuleSpecifierList;
  }(Base);
  ModuleSpecifierList.initClass();
  return ModuleSpecifierList;
}();

exports.ImportSpecifierList = ImportSpecifierList = function (_ModuleSpecifierList) {
  _inherits(ImportSpecifierList, _ModuleSpecifierList);

  function ImportSpecifierList() {
    _classCallCheck(this, ImportSpecifierList);

    return _possibleConstructorReturn(this, (ImportSpecifierList.__proto__ || Object.getPrototypeOf(ImportSpecifierList)).apply(this, arguments));
  }

  return ImportSpecifierList;
}(ModuleSpecifierList);

exports.ExportSpecifierList = ExportSpecifierList = function (_ModuleSpecifierList2) {
  _inherits(ExportSpecifierList, _ModuleSpecifierList2);

  function ExportSpecifierList() {
    _classCallCheck(this, ExportSpecifierList);

    return _possibleConstructorReturn(this, (ExportSpecifierList.__proto__ || Object.getPrototypeOf(ExportSpecifierList)).apply(this, arguments));
  }

  return ExportSpecifierList;
}(ModuleSpecifierList);

exports.ModuleSpecifier = ModuleSpecifier = function () {
  ModuleSpecifier = function (_Base18) {
    _inherits(ModuleSpecifier, _Base18);

    _createClass(ModuleSpecifier, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['original', 'alias'];
      }
    }]);

    function ModuleSpecifier(original, alias, moduleDeclarationType) {
      _classCallCheck(this, ModuleSpecifier);

      // The name of the variable entering the local scope
      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this48 = _possibleConstructorReturn(this, (ModuleSpecifier.__proto__ || Object.getPrototypeOf(ModuleSpecifier)).call(this));
        }
        var thisFn = function () {
          return _this48;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this48.original = original;
      _this48.alias = alias;
      _this48.moduleDeclarationType = moduleDeclarationType;
      _this48.identifier = _this48.alias != null ? _this48.alias.value : _this48.original.value;
      return _possibleConstructorReturn(_this48);
    }

    _createClass(ModuleSpecifier, [{
      key: 'compileNode',
      value: function compileNode(o) {
        o.scope.find(this.identifier, this.moduleDeclarationType);
        var code = [];
        code.push(this.makeCode(this.original.value));
        if (this.alias != null) {
          code.push(this.makeCode(' as ' + this.alias.value));
        }
        return code;
      }
    }]);

    return ModuleSpecifier;
  }(Base);
  ModuleSpecifier.initClass();
  return ModuleSpecifier;
}();

exports.ImportSpecifier = ImportSpecifier = function (_ModuleSpecifier) {
  _inherits(ImportSpecifier, _ModuleSpecifier);

  function ImportSpecifier(imported, local) {
    _classCallCheck(this, ImportSpecifier);

    return _possibleConstructorReturn(this, (ImportSpecifier.__proto__ || Object.getPrototypeOf(ImportSpecifier)).call(this, imported, local, 'import'));
  }

  _createClass(ImportSpecifier, [{
    key: 'compileNode',
    value: function compileNode(o) {
      // Per the spec, symbols can’t be imported multiple times
      // (e.g. `import { foo, foo } from 'lib'` is invalid)
      if (Array.from(o.importedSymbols).includes(this.identifier) || o.scope.check(this.identifier)) {
        this.error('\'' + this.identifier + '\' has already been declared');
      } else {
        o.importedSymbols.push(this.identifier);
      }
      return _get(ImportSpecifier.prototype.__proto__ || Object.getPrototypeOf(ImportSpecifier.prototype), 'compileNode', this).call(this, o);
    }
  }]);

  return ImportSpecifier;
}(ModuleSpecifier);

exports.ImportDefaultSpecifier = ImportDefaultSpecifier = function (_ImportSpecifier) {
  _inherits(ImportDefaultSpecifier, _ImportSpecifier);

  function ImportDefaultSpecifier() {
    _classCallCheck(this, ImportDefaultSpecifier);

    return _possibleConstructorReturn(this, (ImportDefaultSpecifier.__proto__ || Object.getPrototypeOf(ImportDefaultSpecifier)).apply(this, arguments));
  }

  return ImportDefaultSpecifier;
}(ImportSpecifier);

exports.ImportNamespaceSpecifier = ImportNamespaceSpecifier = function (_ImportSpecifier2) {
  _inherits(ImportNamespaceSpecifier, _ImportSpecifier2);

  function ImportNamespaceSpecifier() {
    _classCallCheck(this, ImportNamespaceSpecifier);

    return _possibleConstructorReturn(this, (ImportNamespaceSpecifier.__proto__ || Object.getPrototypeOf(ImportNamespaceSpecifier)).apply(this, arguments));
  }

  return ImportNamespaceSpecifier;
}(ImportSpecifier);

exports.ExportSpecifier = ExportSpecifier = function (_ModuleSpecifier2) {
  _inherits(ExportSpecifier, _ModuleSpecifier2);

  function ExportSpecifier(local, exported) {
    _classCallCheck(this, ExportSpecifier);

    return _possibleConstructorReturn(this, (ExportSpecifier.__proto__ || Object.getPrototypeOf(ExportSpecifier)).call(this, local, exported, 'export'));
  }

  return ExportSpecifier;
}(ModuleSpecifier);

// ### Assign

// The **Assign** is used to assign a local variable to value, or to set the
// property of an object -- including within object literals.
exports.Assign = Assign = function () {
  Assign = function (_Base19) {
    _inherits(Assign, _Base19);

    _createClass(Assign, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['variable', 'value'];
      }
    }]);

    function Assign(variable, value, context, options) {
      _classCallCheck(this, Assign);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this53 = _possibleConstructorReturn(this, (Assign.__proto__ || Object.getPrototypeOf(Assign)).call(this));
        }
        var thisFn = function () {
          return _this53;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this53.variable = variable;
      _this53.value = value;
      _this53.context = context;
      if (options == null) {
        options = {};
      }
      var _options = options;
      _this53.param = _options.param;
      _this53.subpattern = _options.subpattern;
      _this53.operatorToken = _options.operatorToken;
      _this53.moduleDeclaration = _options.moduleDeclaration;
      return _possibleConstructorReturn(_this53);
    }

    _createClass(Assign, [{
      key: 'isStatement',
      value: function isStatement(o) {
        return (o != null ? o.level : undefined) === LEVEL_TOP && this.context != null && (this.moduleDeclaration || Array.from(this.context).includes('?'));
      }
    }, {
      key: 'checkAssignability',
      value: function checkAssignability(o, varBase) {
        if (Object.prototype.hasOwnProperty.call(o.scope.positions, varBase.value) && o.scope.variables[o.scope.positions[varBase.value]].type === 'import') {
          return varBase.error('\'' + varBase.value + '\' is read-only');
        }
      }
    }, {
      key: 'assigns',
      value: function assigns(name) {
        return this[this.context === 'object' ? 'value' : 'variable'].assigns(name);
      }
    }, {
      key: 'unfoldSoak',
      value: function unfoldSoak(o) {
        return _unfoldSoak(o, this, 'variable');
      }

      // Compile an assignment, delegating to `compilePatternMatch` or
      // `compileSplice` if appropriate. Keep track of the name of the base object
      // we've been assigned to, for correct internal references. If the variable
      // has not been seen yet within the current scope, declare it.

    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var isValue = void 0;
        if (isValue = this.variable instanceof Value) {
          if (this.variable.isArray() || this.variable.isObject()) {
            return this.compilePatternMatch(o);
          }
          if (this.variable.isSplice()) {
            return this.compileSplice(o);
          }
          if (['||=', '&&=', '?='].includes(this.context)) {
            return this.compileConditional(o);
          }
          if (['**=', '//=', '%%='].includes(this.context)) {
            return this.compileSpecialMath(o);
          }
        }
        if (this.value instanceof Code) {
          if (this.value.static) {
            this.value.klass = this.variable.base;
            this.value.name = this.variable.properties[0];
            this.value.variable = this.variable;
          } else if ((this.variable.properties != null ? this.variable.properties.length : undefined) >= 2) {
            var adjustedLength = Math.max(this.variable.properties.length, 2);var properties = this.variable.properties.slice(0, adjustedLength - 2);var prototype = this.variable.properties[adjustedLength - 2];var name = this.variable.properties[adjustedLength - 1];
            if ((prototype.name != null ? prototype.name.value : undefined) === 'prototype') {
              this.value.klass = new Value(this.variable.base, properties);
              this.value.name = name;
              this.value.variable = this.variable;
            }
          }
        }
        if (!this.context) {
          var varBase = this.variable.unwrapAll();
          if (!varBase.isAssignable()) {
            this.variable.error('\'' + this.variable.compile(o) + '\' can\'t be assigned');
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

        var val = this.value.compileToFragments(o, LEVEL_LIST);
        if (isValue && this.variable.base instanceof Obj) {
          this.variable.front = true;
        }
        var compiledName = this.variable.compileToFragments(o, LEVEL_LIST);

        if (this.context === 'object') {
          var needle = void 0;
          if (needle = fragmentsToText(compiledName), Array.from(JS_FORBIDDEN).includes(needle)) {
            compiledName.unshift(this.makeCode('"'));
            compiledName.push(this.makeCode('"'));
          }
          return compiledName.concat(this.makeCode(': '), val);
        }

        var answer = compiledName.concat(this.makeCode(' ' + (this.context || '=') + ' '), val);
        if (o.level <= LEVEL_LIST) {
          return answer;
        }return this.wrapInBraces(answer);
      }

      // Brief implementation of recursive pattern matching, when assigning array or
      // object literals to a value. Peeks at their properties to assign inner names.

    }, {
      key: 'compilePatternMatch',
      value: function compilePatternMatch(o) {
        var acc = void 0;var defaultValue = void 0;var idx = void 0;var message = void 0;var olen = void 0;
        var top = o.level === LEVEL_TOP;
        var value = this.value;
        var objects = this.variable.base.objects;

        if (!(olen = objects.length)) {
          var code = value.compileToFragments(o);
          if (o.level >= LEVEL_OP) {
            return this.wrapInBraces(code);
          }return code;
        }

        var _Array$from19 = Array.from(objects),
            _Array$from20 = _slicedToArray(_Array$from19, 1),
            obj = _Array$from20[0];

        if (olen === 1 && obj instanceof Expansion) {
          obj.error('Destructuring assignment has no target');
        }
        var isObject = this.variable.isObject();
        if (top && olen === 1 && !(obj instanceof Splat)) {
          // Pick the property straight off the value when there’s just one to pick
          // (no need to cache the value into a variable).
          defaultValue = null;
          if (obj instanceof Assign && obj.context === 'object') {
            var _obj = obj;
            // A regular object pattern-match.

            idx = _obj.variable.base;
            obj = _obj.value;

            if (obj instanceof Assign) {
              defaultValue = obj.value;
              obj = obj.variable;
            }
          } else {
            if (obj instanceof Assign) {
              defaultValue = obj.value;
              obj = obj.variable;
            }
            idx = isObject
            // A shorthand `{a, b, @c} = val` pattern-match.
            ? obj.this ? obj.properties[0].name : new PropertyName(obj.unwrap().value) :
            // A regular array pattern-match.
            new NumberLiteral(0);
          }
          acc = idx.unwrap() instanceof PropertyName;
          value = new Value(value);
          value.properties.push(new (acc ? Access : Index)(idx));
          message = isUnassignable(obj.unwrap().value);
          if (message) {
            obj.error(message);
          }
          if (defaultValue) {
            value = new Op('?', value, defaultValue);
          }
          return new Assign(obj, value, null, { param: this.param }).compileToFragments(o, LEVEL_TOP);
        }
        var vvar = value.compileToFragments(o, LEVEL_LIST);
        var vvarText = fragmentsToText(vvar);
        var assigns = [];
        var expandedIdx = false;
        // Make vvar into a simple variable if it isn't already.
        if (!(value.unwrap() instanceof IdentifierLiteral) || this.variable.assigns(vvarText)) {
          var ref = void 0;
          assigns.push([this.makeCode((ref = o.scope.freeVariable('ref')) + ' = ')].concat(_toConsumableArray(Array.from(vvar))));
          vvar = [this.makeCode(ref)];
          vvarText = ref;
        }
        for (var i = 0; i < objects.length; i++) {
          var ivar;var name;var rest;var val;
          obj = objects[i];
          idx = i;
          if (!expandedIdx && obj instanceof Splat) {
            name = obj.name.unwrap().value;
            obj = obj.unwrap();
            val = olen + ' <= ' + vvarText + '.length ? ' + utility('slice', o) + '.call(' + vvarText + ', ' + i;
            if (rest = olen - i - 1) {
              ivar = o.scope.freeVariable('i', { single: true });
              val += ', ' + ivar + ' = ' + vvarText + '.length - ' + rest + ') : (' + ivar + ' = ' + i + ', [])';
            } else {
              val += ') : []';
            }
            val = new Literal(val);
            expandedIdx = ivar + '++';
          } else if (!expandedIdx && obj instanceof Expansion) {
            if (rest = olen - i - 1) {
              if (rest === 1) {
                expandedIdx = vvarText + '.length - 1';
              } else {
                ivar = o.scope.freeVariable('i', { single: true });
                val = new Literal(ivar + ' = ' + vvarText + '.length - ' + rest);
                expandedIdx = ivar + '++';
                assigns.push(val.compileToFragments(o, LEVEL_LIST));
              }
            }
            continue;
          } else {
            if (obj instanceof Splat || obj instanceof Expansion) {
              obj.error('multiple splats/expansions are disallowed in an assignment');
            }
            defaultValue = null;
            if (obj instanceof Assign && obj.context === 'object') {
              var _obj2 = obj;
              // A regular object pattern-match.

              idx = _obj2.variable.base;
              obj = _obj2.value;

              if (obj instanceof Assign) {
                defaultValue = obj.value;
                obj = obj.variable;
              }
            } else {
              if (obj instanceof Assign) {
                defaultValue = obj.value;
                obj = obj.variable;
              }
              idx = isObject
              // A shorthand `{a, b, @c} = val` pattern-match.
              ? obj.this ? obj.properties[0].name : new PropertyName(obj.unwrap().value) :
              // A regular array pattern-match.
              new Literal(expandedIdx || idx);
            }
            name = obj.unwrap().value;
            acc = idx.unwrap() instanceof PropertyName;
            val = new Value(new Literal(vvarText), [new (acc ? Access : Index)(idx)]);
            if (defaultValue) {
              val = new Op('?', val, defaultValue);
            }
          }
          if (name != null) {
            message = isUnassignable(name);
            if (message) {
              obj.error(message);
            }
          }
          assigns.push(new Assign(obj, val, null, { param: this.param, subpattern: true }).compileToFragments(o, LEVEL_LIST));
        }
        if (!top && !this.subpattern) {
          assigns.push(vvar);
        }
        var fragments = this.joinFragmentArrays(assigns, ', ');
        if (o.level < LEVEL_LIST) {
          return fragments;
        }return this.wrapInBraces(fragments);
      }

      // When compiling a conditional assignment, take care to ensure that the
      // operands are only evaluated once, even though we have to reference them
      // more than once.

    }, {
      key: 'compileConditional',
      value: function compileConditional(o) {
        var _Array$from21 = Array.from(this.variable.cacheReference(o)),
            _Array$from22 = _slicedToArray(_Array$from21, 2),
            left = _Array$from22[0],
            right = _Array$from22[1];
        // Disallow conditional assignment of undefined variables.


        if (!left.properties.length && left.base instanceof Literal && !(left.base instanceof ThisLiteral) && !o.scope.check(left.base.value)) {
          this.variable.error('the variable "' + left.base.value + '" can\'t be assigned with ' + this.context + ' because it has not been declared before');
        }
        if (Array.from(this.context).includes('?')) {
          o.isExistentialEquals = true;
          return new If(new Existence(left), right, { type: 'if' }).addElse(new Assign(right, this.value, '=')).compileToFragments(o);
        }
        var fragments = new Op(this.context.slice(0, -1), left, new Assign(right, this.value, '=')).compileToFragments(o);
        if (o.level <= LEVEL_LIST) {
          return fragments;
        }return this.wrapInBraces(fragments);
      }

      // Convert special math assignment operators like `a **= b` to the equivalent
      // extended form `a = a ** b` and then compiles that.

    }, {
      key: 'compileSpecialMath',
      value: function compileSpecialMath(o) {
        var _Array$from23 = Array.from(this.variable.cacheReference(o)),
            _Array$from24 = _slicedToArray(_Array$from23, 2),
            left = _Array$from24[0],
            right = _Array$from24[1];

        return new Assign(left, new Op(this.context.slice(0, -1), right, this.value)).compileToFragments(o);
      }

      // Compile the assignment from an array splice literal, using JavaScript's
      // `Array#splice` method.

    }, {
      key: 'compileSplice',
      value: function compileSplice(o) {
        var fromDecl = void 0;var fromRef = void 0;

        var _variable$properties$ = this.variable.properties.pop(),
            _variable$properties$2 = _variable$properties$.range,
            from = _variable$properties$2.from,
            to = _variable$properties$2.to,
            exclusive = _variable$properties$2.exclusive;

        var name = this.variable.compile(o);
        if (from) {
          var _Array$from25 = Array.from(this.cacheToCodeFragments(from.cache(o, LEVEL_OP)));

          var _Array$from26 = _slicedToArray(_Array$from25, 2);

          fromDecl = _Array$from26[0];
          fromRef = _Array$from26[1];
        } else {
          fromDecl = fromRef = '0';
        }
        if (to) {
          if ((from != null ? from.isNumber() : undefined) && to.isNumber()) {
            to = to.compile(o) - fromRef;
            if (!exclusive) {
              to += 1;
            }
          } else {
            to = to.compile(o, LEVEL_ACCESS) + ' - ' + fromRef;
            if (!exclusive) {
              to += ' + 1';
            }
          }
        } else {
          to = '9e9';
        }

        var _Array$from27 = Array.from(this.value.cache(o, LEVEL_LIST)),
            _Array$from28 = _slicedToArray(_Array$from27, 2),
            valDef = _Array$from28[0],
            valRef = _Array$from28[1];

        var answer = [].concat(this.makeCode('[].splice.apply(' + name + ', [' + fromDecl + ', ' + to + '].concat('), valDef, this.makeCode(')), '), valRef);
        if (o.level > LEVEL_TOP) {
          return this.wrapInBraces(answer);
        }return answer;
      }
    }]);

    return Assign;
  }(Base);
  Assign.initClass();
  return Assign;
}();

// ### Code

// A function definition. This is the only node that creates a new Scope.
// When for the purposes of walking the contents of a function body, the Code
// has no *children* -- they're within the inner scope.
exports.Code = Code = function () {
  Code = function (_Base20) {
    _inherits(Code, _Base20);

    _createClass(Code, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['params', 'body'];

        this.prototype.jumps = NO;
      }
    }]);

    function Code(params, body, tag) {
      _classCallCheck(this, Code);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this54 = _possibleConstructorReturn(this, (Code.__proto__ || Object.getPrototypeOf(Code)).call(this));
        }
        var thisFn = function () {
          return _this54;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this54.params = params || [];
      _this54.body = body || new Block();
      _this54.bound = tag === 'boundfunc';
      _this54.isGenerator = !!_this54.body.contains(function (node) {
        return node instanceof Op && node.isYield() || node instanceof YieldReturn;
      });
      return _possibleConstructorReturn(_this54);
    }

    _createClass(Code, [{
      key: 'isStatement',
      value: function isStatement() {
        return !!this.ctor;
      }
    }, {
      key: 'makeScope',
      value: function makeScope(parentScope) {
        return new Scope(parentScope, this.body, this);
      }

      // Compilation creates a new scope unless explicitly asked to share with the
      // outer scope. Handles splat parameters in the parameter list by peeking at
      // the JavaScript `arguments` object. If the function is bound with the `=>`
      // arrow, generates a wrapper that saves the current value of `this` through
      // a closure.

    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var _this55 = this;

        var i = void 0;var param = void 0;var splats = void 0;
        var p = void 0;
        if (this.bound && (o.scope.method != null ? o.scope.method.bound : undefined)) {
          this.context = o.scope.method.context;
        }

        // Handle bound functions early.
        if (this.bound && !this.context) {
          this.context = '_this';
          var wrapper = new Code([new Param(new IdentifierLiteral(this.context))], new Block([this]));
          var boundfunc = new Call(wrapper, [new ThisLiteral()]);
          boundfunc.updateLocationDataIfMissing(this.locationData);
          return boundfunc.compileNode(o);
        }

        o.scope = del(o, 'classScope') || this.makeScope(o.scope);
        o.scope.shared = del(o, 'sharedScope');
        o.indent += TAB;
        delete o.bare;
        delete o.isExistentialEquals;
        var params = [];
        var exprs = [];
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
          for (var _iterator13 = Array.from(this.params)[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            param = _step13.value;

            if (!(param instanceof Expansion)) {
              o.scope.parameter(param.asReference(o));
            }
          }
        } catch (err) {
          _didIteratorError13 = true;
          _iteratorError13 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion13 && _iterator13.return) {
              _iterator13.return();
            }
          } finally {
            if (_didIteratorError13) {
              throw _iteratorError13;
            }
          }
        }

        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = Array.from(this.params)[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            param = _step14.value;

            if (param.splat || param instanceof Expansion) {
              var _iteratorNormalCompletion16 = true;
              var _didIteratorError16 = false;
              var _iteratorError16 = undefined;

              try {
                for (var _iterator16 = Array.from(this.params)[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                  p = _step16.value;

                  if (!(p instanceof Expansion) && p.name.value) {
                    o.scope.add(p.name.value, 'var', true);
                  }
                }
              } catch (err) {
                _didIteratorError16 = true;
                _iteratorError16 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion16 && _iterator16.return) {
                    _iterator16.return();
                  }
                } finally {
                  if (_didIteratorError16) {
                    throw _iteratorError16;
                  }
                }
              }

              splats = new Assign(new Value(new Arr(function () {
                var result = [];
                var _iteratorNormalCompletion17 = true;
                var _didIteratorError17 = false;
                var _iteratorError17 = undefined;

                try {
                  for (var _iterator17 = Array.from(_this55.params)[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                    p = _step17.value;

                    result.push(p.asReference(o));
                  }
                } catch (err) {
                  _didIteratorError17 = true;
                  _iteratorError17 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion17 && _iterator17.return) {
                      _iterator17.return();
                    }
                  } finally {
                    if (_didIteratorError17) {
                      throw _iteratorError17;
                    }
                  }
                }

                return result;
              }())), new Value(new IdentifierLiteral('arguments')));
              break;
            }
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14.return) {
              _iterator14.return();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
          }
        }

        var _iteratorNormalCompletion15 = true;
        var _didIteratorError15 = false;
        var _iteratorError15 = undefined;

        try {
          for (var _iterator15 = Array.from(this.params)[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            param = _step15.value;

            var ref;var val;
            if (param.isComplex()) {
              val = ref = param.asReference(o);
              if (param.value) {
                val = new Op('?', ref, param.value);
              }
              exprs.push(new Assign(new Value(param.name), val, '=', { param: true }));
            } else {
              ref = param;
              if (param.value) {
                var lit = new Literal(ref.name.value + ' == null');
                val = new Assign(new Value(param.name), param.value, '=');
                exprs.push(new If(lit, val));
              }
            }
            if (!splats) {
              params.push(ref);
            }
          }
        } catch (err) {
          _didIteratorError15 = true;
          _iteratorError15 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion15 && _iterator15.return) {
              _iterator15.return();
            }
          } finally {
            if (_didIteratorError15) {
              throw _iteratorError15;
            }
          }
        }

        var wasEmpty = this.body.isEmpty();
        if (splats) {
          exprs.unshift(splats);
        }
        if (exprs.length) {
          var _body$expressions2;

          (_body$expressions2 = this.body.expressions).unshift.apply(_body$expressions2, _toConsumableArray(Array.from(exprs || [])));
        }
        for (i = 0; i < params.length; i++) {
          p = params[i];
          params[i] = p.compileToFragments(o);
          o.scope.parameter(fragmentsToText(params[i]));
        }
        var uniqs = [];
        this.eachParamName(function (name, node) {
          if (Array.from(uniqs).includes(name)) {
            node.error('multiple parameters named ' + name);
          }
          return uniqs.push(name);
        });
        if (!wasEmpty && !this.noReturn) {
          this.body.makeReturn();
        }
        var code = 'function';
        if (this.isGenerator) {
          code += '*';
        }
        if (this.ctor) {
          code += ' ' + this.name;
        }
        code += '(';
        var answer = [this.makeCode(code)];
        for (i = 0; i < params.length; i++) {
          var _answer2;

          p = params[i];
          if (i) {
            answer.push(this.makeCode(', '));
          }
          (_answer2 = answer).push.apply(_answer2, _toConsumableArray(Array.from(p || [])));
        }
        answer.push(this.makeCode(') {'));
        if (!this.body.isEmpty()) {
          answer = answer.concat(this.makeCode('\n'), this.body.compileWithDeclarations(o), this.makeCode('\n' + this.tab));
        }
        answer.push(this.makeCode('}'));

        if (this.ctor) {
          return [this.makeCode(this.tab)].concat(_toConsumableArray(Array.from(answer)));
        }
        if (this.front || o.level >= LEVEL_ACCESS) {
          return this.wrapInBraces(answer);
        }return answer;
      }
    }, {
      key: 'eachParamName',
      value: function eachParamName(iterator) {
        return Array.from(this.params).map(function (param) {
          return param.eachName(iterator);
        });
      }

      // Short-circuit `traverseChildren` method to prevent it from crossing scope boundaries
      // unless `crossScope` is `true`.

    }, {
      key: 'traverseChildren',
      value: function traverseChildren(crossScope, func) {
        if (crossScope) {
          return _get(Code.prototype.__proto__ || Object.getPrototypeOf(Code.prototype), 'traverseChildren', this).call(this, crossScope, func);
        }
      }
    }]);

    return Code;
  }(Base);
  Code.initClass();
  return Code;
}();

// ### Param

// A parameter in a function definition. Beyond a typical JavaScript parameter,
// these parameters can also attach themselves to the context of the function,
// as well as be a splat, gathering up a group of parameters into an array.
exports.Param = Param = function () {
  Param = function (_Base21) {
    _inherits(Param, _Base21);

    _createClass(Param, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['name', 'value'];
      }
    }]);

    function Param(name, value, splat) {
      _classCallCheck(this, Param);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this56 = _possibleConstructorReturn(this, (Param.__proto__ || Object.getPrototypeOf(Param)).call(this));
        }
        var thisFn = function () {
          return _this56;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this56.name = name;
      _this56.value = value;
      _this56.splat = splat;
      var message = isUnassignable(_this56.name.unwrapAll().value);
      if (message) {
        _this56.name.error(message);
      }
      if (_this56.name instanceof Obj && _this56.name.generated) {
        var token = _this56.name.objects[0].operatorToken;
        token.error('unexpected ' + token.value);
      }
      return _possibleConstructorReturn(_this56);
    }

    _createClass(Param, [{
      key: 'compileToFragments',
      value: function compileToFragments(o) {
        return this.name.compileToFragments(o, LEVEL_LIST);
      }
    }, {
      key: 'asReference',
      value: function asReference(o) {
        if (this.reference) {
          return this.reference;
        }
        var node = this.name;
        if (node.this) {
          var name = node.properties[0].name.value;
          if (Array.from(JS_FORBIDDEN).includes(name)) {
            name = '_' + name;
          }
          node = new IdentifierLiteral(o.scope.freeVariable(name));
        } else if (node.isComplex()) {
          node = new IdentifierLiteral(o.scope.freeVariable('arg'));
        }
        node = new Value(node);
        if (this.splat) {
          node = new Splat(node);
        }
        node.updateLocationDataIfMissing(this.locationData);
        return this.reference = node;
      }
    }, {
      key: 'isComplex',
      value: function isComplex() {
        return this.name.isComplex();
      }

      // Iterates the name or names of a `Param`.
      // In a sense, a destructured parameter represents multiple JS parameters. This
      // method allows to iterate them all.
      // The `iterator` function will be called as `iterator(name, node)` where
      // `name` is the name of the parameter and `node` is the AST node corresponding
      // to that name.

    }, {
      key: 'eachName',
      value: function eachName(iterator, name) {
        if (name == null) {
          name = this.name;
        }
        var atParam = function atParam(obj) {
          return iterator('@' + obj.properties[0].name.value, obj);
        };
        // * simple literals `foo`
        if (name instanceof Literal) {
          return iterator(name.value, name);
        }
        // * at-params `@foo`
        if (name instanceof Value) {
          return atParam(name);
        }
        var _iteratorNormalCompletion18 = true;
        var _didIteratorError18 = false;
        var _iteratorError18 = undefined;

        try {
          for (var _iterator18 = Array.from(name.objects != null ? name.objects : [])[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
            var obj = _step18.value;

            // * destructured parameter with default value
            if (obj instanceof Assign && obj.context == null) {
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
              var node = obj.name.unwrap();
              iterator(node.value, node);
            } else if (obj instanceof Value) {
              // * destructured parameters within destructured parameters `[{a}]`
              if (obj.isArray() || obj.isObject()) {
                this.eachName(iterator, obj.base);
                // * at-params within destructured parameters `{@foo}`
              } else if (obj.this) {
                atParam(obj);
                // * simple destructured parameters {foo}
              } else {
                iterator(obj.base.value, obj.base);
              }
            } else if (!(obj instanceof Expansion)) {
              obj.error('illegal parameter ' + obj.compile());
            }
          }
        } catch (err) {
          _didIteratorError18 = true;
          _iteratorError18 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion18 && _iterator18.return) {
              _iterator18.return();
            }
          } finally {
            if (_didIteratorError18) {
              throw _iteratorError18;
            }
          }
        }
      }
    }]);

    return Param;
  }(Base);
  Param.initClass();
  return Param;
}();

// ### Splat

// A splat, either as a parameter to a function, an argument to a call,
// or as part of a destructuring assignment.
exports.Splat = Splat = function () {
  Splat = function (_Base22) {
    _inherits(Splat, _Base22);

    _createClass(Splat, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['name'];

        this.prototype.isAssignable = YES;
      }
    }]);

    function Splat(name) {
      _classCallCheck(this, Splat);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this57 = _possibleConstructorReturn(this, (Splat.__proto__ || Object.getPrototypeOf(Splat)).call(this));
        }
        var thisFn = function () {
          return _this57;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this57.name = name.compile ? name : new Literal(name);
      return _possibleConstructorReturn(_this57);
    }

    _createClass(Splat, [{
      key: 'assigns',
      value: function assigns(name) {
        return this.name.assigns(name);
      }
    }, {
      key: 'compileToFragments',
      value: function compileToFragments(o) {
        return this.name.compileToFragments(o);
      }
    }, {
      key: 'unwrap',
      value: function unwrap() {
        return this.name;
      }

      // Utility function that converts an arbitrary number of elements, mixed with
      // splats, to a proper array.

    }], [{
      key: 'compileSplattedArray',
      value: function compileSplattedArray(o, list, apply) {
        var concatPart = void 0;
        var node = void 0;
        var index = -1;
        while ((node = list[++index]) && !(node instanceof Splat)) {
          continue;
        }
        if (index >= list.length) {
          return [];
        }
        if (list.length === 1) {
          node = list[0];
          var fragments = node.compileToFragments(o, LEVEL_LIST);
          if (apply) {
            return fragments;
          }
          return [].concat(node.makeCode(utility('slice', o) + '.call('), fragments, node.makeCode(')'));
        }
        var args = list.slice(index);
        for (var i = 0; i < args.length; i++) {
          node = args[i];
          var compiledNode = node.compileToFragments(o, LEVEL_LIST);
          args[i] = node instanceof Splat ? [].concat(node.makeCode(utility('slice', o) + '.call('), compiledNode, node.makeCode(')')) : [].concat(node.makeCode('['), compiledNode, node.makeCode(']'));
        }
        if (index === 0) {
          node = list[0];
          concatPart = node.joinFragmentArrays(args.slice(1), ', ');
          return args[0].concat(node.makeCode('.concat('), concatPart, node.makeCode(')'));
        }
        var base = function () {
          var result = [];
          var _iteratorNormalCompletion19 = true;
          var _didIteratorError19 = false;
          var _iteratorError19 = undefined;

          try {
            for (var _iterator19 = Array.from(list.slice(0, index))[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
              node = _step19.value;

              result.push(node.compileToFragments(o, LEVEL_LIST));
            }
          } catch (err) {
            _didIteratorError19 = true;
            _iteratorError19 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion19 && _iterator19.return) {
                _iterator19.return();
              }
            } finally {
              if (_didIteratorError19) {
                throw _iteratorError19;
              }
            }
          }

          return result;
        }();
        base = list[0].joinFragmentArrays(base, ', ');
        concatPart = list[index].joinFragmentArrays(args, ', ');
        var last = list[list.length - 1];
        return [].concat(list[0].makeCode('['), base, list[index].makeCode('].concat('), concatPart, last.makeCode(')'));
      }
    }]);

    return Splat;
  }(Base);
  Splat.initClass();
  return Splat;
}();

// ### Expansion

// Used to skip values inside an array destructuring (pattern matching) or
// parameter list.
exports.Expansion = Expansion = function () {
  Expansion = function (_Base23) {
    _inherits(Expansion, _Base23);

    function Expansion() {
      _classCallCheck(this, Expansion);

      return _possibleConstructorReturn(this, (Expansion.__proto__ || Object.getPrototypeOf(Expansion)).apply(this, arguments));
    }

    _createClass(Expansion, [{
      key: 'compileNode',
      value: function compileNode(o) {
        return this.error('Expansion must be used inside a destructuring assignment or parameter list');
      }
    }, {
      key: 'asReference',
      value: function asReference(o) {
        return this;
      }
    }, {
      key: 'eachName',
      value: function eachName(iterator) {}
    }], [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.isComplex = NO;
      }
    }]);

    return Expansion;
  }(Base);
  Expansion.initClass();
  return Expansion;
}();

// ### While

// A while loop, the only sort of low-level loop exposed by CoffeeScript. From
// it, all other loops can be manufactured. Useful in cases where you need more
// flexibility or more speed than a comprehension can provide.
exports.While = While = function () {
  While = function (_Base24) {
    _inherits(While, _Base24);

    _createClass(While, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['condition', 'guard', 'body'];

        this.prototype.isStatement = YES;
      }
    }]);

    function While(condition, options) {
      _classCallCheck(this, While);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this59 = _possibleConstructorReturn(this, (While.__proto__ || Object.getPrototypeOf(While)).call(this));
        }
        var thisFn = function () {
          return _this59;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this59.condition = (options != null ? options.invert : undefined) ? condition.invert() : condition;
      _this59.guard = options != null ? options.guard : undefined;
      return _possibleConstructorReturn(_this59);
    }

    _createClass(While, [{
      key: 'makeReturn',
      value: function makeReturn(res) {
        if (res) {
          return _get(While.prototype.__proto__ || Object.getPrototypeOf(While.prototype), 'makeReturn', this).apply(this, arguments);
        }
        this.returns = !this.jumps({ loop: true });
        return this;
      }
    }, {
      key: 'addBody',
      value: function addBody(body) {
        this.body = body;
        return this;
      }
    }, {
      key: 'jumps',
      value: function jumps() {
        var expressions = this.body.expressions;

        if (!expressions.length) {
          return false;
        }
        var _iteratorNormalCompletion20 = true;
        var _didIteratorError20 = false;
        var _iteratorError20 = undefined;

        try {
          for (var _iterator20 = Array.from(expressions)[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
            var node = _step20.value;

            var jumpNode;
            if (jumpNode = node.jumps({ loop: true })) {
              return jumpNode;
            }
          }
        } catch (err) {
          _didIteratorError20 = true;
          _iteratorError20 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion20 && _iterator20.return) {
              _iterator20.return();
            }
          } finally {
            if (_didIteratorError20) {
              throw _iteratorError20;
            }
          }
        }

        return false;
      }

      // The main difference from a JavaScript *while* is that the CoffeeScript
      // *while* can be used as a part of a larger expression -- while loops may
      // return an array containing the computed result of each iteration.

    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var rvar = void 0;
        o.indent += TAB;
        var set = '';
        var body = this.body;

        if (body.isEmpty()) {
          body = this.makeCode('');
        } else {
          if (this.returns) {
            body.makeReturn(rvar = o.scope.freeVariable('results'));
            set = '' + this.tab + rvar + ' = [];\n';
          }
          if (this.guard) {
            if (body.expressions.length > 1) {
              body.expressions.unshift(new If(new Parens(this.guard).invert(), new StatementLiteral('continue')));
            } else if (this.guard) {
              body = Block.wrap([new If(this.guard, body)]);
            }
          }
          body = [].concat(this.makeCode('\n'), body.compileToFragments(o, LEVEL_TOP), this.makeCode('\n' + this.tab));
        }
        var answer = [].concat(this.makeCode(set + this.tab + 'while ('), this.condition.compileToFragments(o, LEVEL_PAREN), this.makeCode(') {'), body, this.makeCode('}'));
        if (this.returns) {
          answer.push(this.makeCode('\n' + this.tab + 'return ' + rvar + ';'));
        }
        return answer;
      }
    }]);

    return While;
  }(Base);
  While.initClass();
  return While;
}();

// ### Op

// Simple Arithmetic and logical operations. Performs some conversion from
// CoffeeScript operations into their JavaScript equivalents.
exports.Op = Op = function () {
  var CONVERSIONS = void 0;
  var INVERSIONS = void 0;
  Op = function (_Base25) {
    _inherits(Op, _Base25);

    _createClass(Op, null, [{
      key: 'initClass',
      value: function initClass() {
        // The map of conversions from CoffeeScript to JavaScript symbols.
        CONVERSIONS = {
          '==': '===',
          '!=': '!==',
          of: 'in',
          yieldfrom: 'yield*'
        };

        // The map of invertible operators.
        INVERSIONS = {
          '!==': '===',
          '===': '!=='
        };

        this.prototype.children = ['first', 'second'];
      }
    }]);

    function Op(op, first, second, flip) {
      var _ret6;

      _classCallCheck(this, Op);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this60 = _possibleConstructorReturn(this, (Op.__proto__ || Object.getPrototypeOf(Op)).call(this));
        }
        var thisFn = function () {
          return _this60;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      if (op === 'in') {
        var _ret3;

        return _ret3 = new In(first, second), _possibleConstructorReturn(_this60, _ret3);
      }
      if (op === 'do') {
        var _ret4;

        return _ret4 = _this60.generateDo(first), _possibleConstructorReturn(_this60, _ret4);
      }
      if (op === 'new') {
        if (first instanceof Call && !first.do && !first.isNew) {
          var _ret5;

          return _ret5 = first.newInstance(), _possibleConstructorReturn(_this60, _ret5);
        }
        if (first instanceof Code && first.bound || first.do) {
          first = new Parens(first);
        }
      }
      _this60.operator = CONVERSIONS[op] || op;
      _this60.first = first;
      _this60.second = second;
      _this60.flip = !!flip;
      return _ret6 = _this60, _possibleConstructorReturn(_this60, _ret6);
    }

    _createClass(Op, [{
      key: 'isNumber',
      value: function isNumber() {
        return this.isUnary() && ['+', '-'].includes(this.operator) && this.first instanceof Value && this.first.isNumber();
      }
    }, {
      key: 'isYield',
      value: function isYield() {
        return ['yield', 'yield*'].includes(this.operator);
      }
    }, {
      key: 'isUnary',
      value: function isUnary() {
        return !this.second;
      }
    }, {
      key: 'isComplex',
      value: function isComplex() {
        return !this.isNumber();
      }

      // Am I capable of
      // [Python-style comparison chaining](https://docs.python.org/3/reference/expressions.html#not-in)?

    }, {
      key: 'isChainable',
      value: function isChainable() {
        return ['<', '>', '>=', '<=', '===', '!=='].includes(this.operator);
      }
    }, {
      key: 'invert',
      value: function invert() {
        var fst = void 0;var op = void 0;
        if (this.isChainable() && this.first.isChainable()) {
          var allInvertable = true;
          var curr = this;
          while (curr && curr.operator) {
            if (allInvertable) {
              allInvertable = curr.operator in INVERSIONS;
            }
            curr = curr.first;
          }
          if (!allInvertable) {
            return new Parens(this).invert();
          }
          curr = this;
          while (curr && curr.operator) {
            curr.invert = !curr.invert;
            curr.operator = INVERSIONS[curr.operator];
            curr = curr.first;
          }
          return this;
        }if (op = INVERSIONS[this.operator]) {
          this.operator = op;
          if (this.first.unwrap() instanceof Op) {
            this.first.invert();
          }
          return this;
        }if (this.second) {
          return new Parens(this).invert();
        }if (this.operator === '!' && (fst = this.first.unwrap()) instanceof Op && ['!', 'in', 'instanceof'].includes(fst.operator)) {
          return fst;
        }
        return new Op('!', this);
      }
    }, {
      key: 'unfoldSoak',
      value: function unfoldSoak(o) {
        return ['++', '--', 'delete'].includes(this.operator) && _unfoldSoak(o, this, 'first');
      }
    }, {
      key: 'generateDo',
      value: function generateDo(exp) {
        var ref = void 0;
        var passedParams = [];
        var func = exp instanceof Assign && (ref = exp.value.unwrap()) instanceof Code ? ref : exp;
        var _iteratorNormalCompletion21 = true;
        var _didIteratorError21 = false;
        var _iteratorError21 = undefined;

        try {
          for (var _iterator21 = Array.from(func.params || [])[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
            var param = _step21.value;

            if (param.value) {
              passedParams.push(param.value);
              delete param.value;
            } else {
              passedParams.push(param);
            }
          }
        } catch (err) {
          _didIteratorError21 = true;
          _iteratorError21 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion21 && _iterator21.return) {
              _iterator21.return();
            }
          } finally {
            if (_didIteratorError21) {
              throw _iteratorError21;
            }
          }
        }

        var call = new Call(exp, passedParams);
        call.do = true;
        return call;
      }
    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var isChain = this.isChainable() && this.first.isChainable();
        // In chains, there's no need to wrap bare obj literals in parens,
        // as the chained expression is wrapped.
        if (!isChain) {
          this.first.front = this.front;
        }
        if (this.operator === 'delete' && o.scope.check(this.first.unwrapAll().value)) {
          this.error('delete operand may not be argument or var');
        }
        if (['--', '++'].includes(this.operator)) {
          var message = isUnassignable(this.first.unwrapAll().value);
          if (message) {
            this.first.error(message);
          }
        }
        if (this.isYield()) {
          return this.compileYield(o);
        }
        if (this.isUnary()) {
          return this.compileUnary(o);
        }
        if (isChain) {
          return this.compileChain(o);
        }
        switch (this.operator) {
          case '?':
            return this.compileExistence(o);
          case '**':
            return this.compilePower(o);
          case '//':
            return this.compileFloorDivision(o);
          case '%%':
            return this.compileModulo(o);
          default:
            var lhs = this.first.compileToFragments(o, LEVEL_OP);
            var rhs = this.second.compileToFragments(o, LEVEL_OP);
            var answer = [].concat(lhs, this.makeCode(' ' + this.operator + ' '), rhs);
            if (o.level <= LEVEL_OP) {
              return answer;
            }return this.wrapInBraces(answer);
        }
      }

      // Mimic Python's chained comparisons when multiple comparison operators are
      // used sequentially. For example:
      //
      //     bin/coffee -e 'console.log 50 < 65 > 10'
      //     true

    }, {
      key: 'compileChain',
      value: function compileChain(o) {
        var shared = void 0;

        var _Array$from29 = Array.from(this.first.second.cache(o));

        var _Array$from30 = _slicedToArray(_Array$from29, 2);

        this.first.second = _Array$from30[0];
        shared = _Array$from30[1];

        var fst = this.first.compileToFragments(o, LEVEL_OP);
        var fragments = fst.concat(this.makeCode(' ' + (this.invert ? '&&' : '||') + ' '), shared.compileToFragments(o), this.makeCode(' ' + this.operator + ' '), this.second.compileToFragments(o, LEVEL_OP));
        return this.wrapInBraces(fragments);
      }

      // Keep reference to the left expression, unless this an existential assignment

    }, {
      key: 'compileExistence',
      value: function compileExistence(o) {
        var fst = void 0;var ref = void 0;
        if (this.first.isComplex()) {
          ref = new IdentifierLiteral(o.scope.freeVariable('ref'));
          fst = new Parens(new Assign(ref, this.first));
        } else {
          fst = this.first;
          ref = fst;
        }
        return new If(new Existence(fst), ref, { type: 'if' }).addElse(this.second).compileToFragments(o);
      }

      // Compile a unary **Op**.

    }, {
      key: 'compileUnary',
      value: function compileUnary(o) {
        var parts = [];
        var op = this.operator;
        parts.push([this.makeCode(op)]);
        if (op === '!' && this.first instanceof Existence) {
          this.first.negated = !this.first.negated;
          return this.first.compileToFragments(o);
        }
        if (o.level >= LEVEL_ACCESS) {
          return new Parens(this).compileToFragments(o);
        }
        var plusMinus = ['+', '-'].includes(op);
        if (['new', 'typeof', 'delete'].includes(op) || plusMinus && this.first instanceof Op && this.first.operator === op) {
          parts.push([this.makeCode(' ')]);
        }
        if (plusMinus && this.first instanceof Op || op === 'new' && this.first.isStatement(o)) {
          this.first = new Parens(this.first);
        }
        parts.push(this.first.compileToFragments(o, LEVEL_OP));
        if (this.flip) {
          parts.reverse();
        }
        return this.joinFragmentArrays(parts, '');
      }
    }, {
      key: 'compileYield',
      value: function compileYield(o) {
        var needle = void 0;
        var parts = [];
        var op = this.operator;
        if (o.scope.parent == null) {
          this.error('yield can only occur inside functions');
        }
        if ((needle = 'expression', Array.from(Object.keys(this.first)).includes(needle)) && !(this.first instanceof Throw)) {
          if (this.first.expression != null) {
            parts.push(this.first.expression.compileToFragments(o, LEVEL_OP));
          }
        } else {
          if (o.level >= LEVEL_PAREN) {
            parts.push([this.makeCode('(')]);
          }
          parts.push([this.makeCode(op)]);
          if ((this.first.base != null ? this.first.base.value : undefined) !== '') {
            parts.push([this.makeCode(' ')]);
          }
          parts.push(this.first.compileToFragments(o, LEVEL_OP));
          if (o.level >= LEVEL_PAREN) {
            parts.push([this.makeCode(')')]);
          }
        }
        return this.joinFragmentArrays(parts, '');
      }
    }, {
      key: 'compilePower',
      value: function compilePower(o) {
        // Make a Math.pow call
        var pow = new Value(new IdentifierLiteral('Math'), [new Access(new PropertyName('pow'))]);
        return new Call(pow, [this.first, this.second]).compileToFragments(o);
      }
    }, {
      key: 'compileFloorDivision',
      value: function compileFloorDivision(o) {
        var floor = new Value(new IdentifierLiteral('Math'), [new Access(new PropertyName('floor'))]);
        var second = this.second.isComplex() ? new Parens(this.second) : this.second;
        var div = new Op('/', this.first, second);
        return new Call(floor, [div]).compileToFragments(o);
      }
    }, {
      key: 'compileModulo',
      value: function compileModulo(o) {
        var mod = new Value(new Literal(utility('modulo', o)));
        return new Call(mod, [this.first, this.second]).compileToFragments(o);
      }
    }, {
      key: 'toString',
      value: function toString(idt) {
        return _get(Op.prototype.__proto__ || Object.getPrototypeOf(Op.prototype), 'toString', this).call(this, idt, this.constructor.name + ' ' + this.operator);
      }
    }]);

    return Op;
  }(Base);
  Op.initClass();
  return Op;
}();

// ### In
exports.In = In = function () {
  In = function (_Base26) {
    _inherits(In, _Base26);

    _createClass(In, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['object', 'array'];

        this.prototype.invert = NEGATE;
      }
    }]);

    function In(object, array) {
      _classCallCheck(this, In);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this61 = _possibleConstructorReturn(this, (In.__proto__ || Object.getPrototypeOf(In)).call(this));
        }
        var thisFn = function () {
          return _this61;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this61.object = object;
      _this61.array = array;
      return _possibleConstructorReturn(_this61);
    }

    _createClass(In, [{
      key: 'compileNode',
      value: function compileNode(o) {
        if (this.array instanceof Value && this.array.isArray() && this.array.base.objects.length) {
          var hasSplat = void 0;
          var _iteratorNormalCompletion22 = true;
          var _didIteratorError22 = false;
          var _iteratorError22 = undefined;

          try {
            for (var _iterator22 = Array.from(this.array.base.objects)[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
              var obj = _step22.value;

              if (obj instanceof Splat) {
                hasSplat = true;
                break;
              }
            }
            // `compileOrTest` only if we have an array literal with no splats
          } catch (err) {
            _didIteratorError22 = true;
            _iteratorError22 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion22 && _iterator22.return) {
                _iterator22.return();
              }
            } finally {
              if (_didIteratorError22) {
                throw _iteratorError22;
              }
            }
          }

          if (!hasSplat) {
            return this.compileOrTest(o);
          }
        }
        return this.compileLoopTest(o);
      }
    }, {
      key: 'compileOrTest',
      value: function compileOrTest(o) {
        var _Array$from31 = Array.from(this.object.cache(o, LEVEL_OP)),
            _Array$from32 = _slicedToArray(_Array$from31, 2),
            sub = _Array$from32[0],
            ref = _Array$from32[1];

        var _Array$from33 = Array.from(this.negated ? [' !== ', ' && '] : [' === ', ' || ']),
            _Array$from34 = _slicedToArray(_Array$from33, 2),
            cmp = _Array$from34[0],
            cnj = _Array$from34[1];

        var tests = [];
        for (var i = 0; i < this.array.base.objects.length; i++) {
          var item = this.array.base.objects[i];
          if (i) {
            tests.push(this.makeCode(cnj));
          }
          tests = tests.concat(i ? ref : sub, this.makeCode(cmp), item.compileToFragments(o, LEVEL_ACCESS));
        }
        if (o.level < LEVEL_OP) {
          return tests;
        }return this.wrapInBraces(tests);
      }
    }, {
      key: 'compileLoopTest',
      value: function compileLoopTest(o) {
        var _Array$from35 = Array.from(this.object.cache(o, LEVEL_LIST)),
            _Array$from36 = _slicedToArray(_Array$from35, 2),
            sub = _Array$from36[0],
            ref = _Array$from36[1];

        var fragments = [].concat(this.makeCode(utility('indexOf', o) + '.call('), this.array.compileToFragments(o, LEVEL_LIST), this.makeCode(', '), ref, this.makeCode(') ' + (this.negated ? '< 0' : '>= 0')));
        if (fragmentsToText(sub) === fragmentsToText(ref)) {
          return fragments;
        }
        fragments = sub.concat(this.makeCode(', '), fragments);
        if (o.level < LEVEL_LIST) {
          return fragments;
        }return this.wrapInBraces(fragments);
      }
    }, {
      key: 'toString',
      value: function toString(idt) {
        return _get(In.prototype.__proto__ || Object.getPrototypeOf(In.prototype), 'toString', this).call(this, idt, this.constructor.name + (this.negated ? '!' : ''));
      }
    }]);

    return In;
  }(Base);
  In.initClass();
  return In;
}();

// ### Try

// A classic *try/catch/finally* block.
exports.Try = Try = function () {
  Try = function (_Base27) {
    _inherits(Try, _Base27);

    _createClass(Try, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['attempt', 'recovery', 'ensure'];

        this.prototype.isStatement = YES;
      }
    }]);

    function Try(attempt, errorVariable, recovery, ensure) {
      _classCallCheck(this, Try);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this62 = _possibleConstructorReturn(this, (Try.__proto__ || Object.getPrototypeOf(Try)).call(this));
        }
        var thisFn = function () {
          return _this62;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this62.attempt = attempt;
      _this62.errorVariable = errorVariable;
      _this62.recovery = recovery;
      _this62.ensure = ensure;
      return _possibleConstructorReturn(_this62);
    }

    _createClass(Try, [{
      key: 'jumps',
      value: function jumps(o) {
        return this.attempt.jumps(o) || (this.recovery != null ? this.recovery.jumps(o) : undefined);
      }
    }, {
      key: 'makeReturn',
      value: function makeReturn(res) {
        if (this.attempt) {
          this.attempt = this.attempt.makeReturn(res);
        }
        if (this.recovery) {
          this.recovery = this.recovery.makeReturn(res);
        }
        return this;
      }

      // Compilation is more or less as you would expect -- the *finally* clause
      // is optional, the *catch* is not.

    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var _this63 = this;

        o.indent += TAB;
        var tryPart = this.attempt.compileToFragments(o, LEVEL_TOP);

        var catchPart = function () {
          var generatedErrorVariableName = void 0;
          if (_this63.recovery) {
            generatedErrorVariableName = o.scope.freeVariable('error', { reserve: false });
            var placeholder = new IdentifierLiteral(generatedErrorVariableName);
            if (_this63.errorVariable) {
              var message = isUnassignable(_this63.errorVariable.unwrapAll().value);
              if (message) {
                _this63.errorVariable.error(message);
              }
              _this63.recovery.unshift(new Assign(_this63.errorVariable, placeholder));
            }
            return [].concat(_this63.makeCode(' catch ('), placeholder.compileToFragments(o), _this63.makeCode(') {\n'), _this63.recovery.compileToFragments(o, LEVEL_TOP), _this63.makeCode('\n' + _this63.tab + '}'));
          }if (!_this63.ensure && !_this63.recovery) {
            generatedErrorVariableName = o.scope.freeVariable('error', { reserve: false });
            return [_this63.makeCode(' catch (' + generatedErrorVariableName + ') {}')];
          }
          return [];
        }();

        var ensurePart = this.ensure ? [].concat(this.makeCode(' finally {\n'), this.ensure.compileToFragments(o, LEVEL_TOP), this.makeCode('\n' + this.tab + '}')) : [];

        return [].concat(this.makeCode(this.tab + 'try {\n'), tryPart, this.makeCode('\n' + this.tab + '}'), catchPart, ensurePart);
      }
    }]);

    return Try;
  }(Base);
  Try.initClass();
  return Try;
}();

// ### Throw

// Simple node to throw an exception.
exports.Throw = Throw = function () {
  Throw = function (_Base28) {
    _inherits(Throw, _Base28);

    _createClass(Throw, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['expression'];

        this.prototype.isStatement = YES;
        this.prototype.jumps = NO;

        // A **Throw** is already a return, of sorts...
        this.prototype.makeReturn = THIS;
      }
    }]);

    function Throw(expression) {
      _classCallCheck(this, Throw);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this64 = _possibleConstructorReturn(this, (Throw.__proto__ || Object.getPrototypeOf(Throw)).call(this));
        }
        var thisFn = function () {
          return _this64;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this64.expression = expression;
      return _possibleConstructorReturn(_this64);
    }

    _createClass(Throw, [{
      key: 'compileNode',
      value: function compileNode(o) {
        return [].concat(this.makeCode(this.tab + 'throw '), this.expression.compileToFragments(o), this.makeCode(';'));
      }
    }]);

    return Throw;
  }(Base);
  Throw.initClass();
  return Throw;
}();

// ### Existence

// Checks a variable for existence -- not *null* and not *undefined*. This is
// similar to `.nil?` in Ruby, and avoids having to consult a JavaScript truth
// table.
exports.Existence = Existence = function () {
  Existence = function (_Base29) {
    _inherits(Existence, _Base29);

    _createClass(Existence, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['expression'];

        this.prototype.invert = NEGATE;
      }
    }]);

    function Existence(expression) {
      _classCallCheck(this, Existence);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this65 = _possibleConstructorReturn(this, (Existence.__proto__ || Object.getPrototypeOf(Existence)).call(this));
        }
        var thisFn = function () {
          return _this65;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this65.expression = expression;
      return _possibleConstructorReturn(_this65);
    }

    _createClass(Existence, [{
      key: 'compileNode',
      value: function compileNode(o) {
        this.expression.front = this.front;
        var code = this.expression.compile(o, LEVEL_OP);
        if (this.expression.unwrap() instanceof IdentifierLiteral && !o.scope.check(code)) {
          var _Array$from37 = Array.from(this.negated ? ['===', '||'] : ['!==', '&&']),
              _Array$from38 = _slicedToArray(_Array$from37, 2),
              cmp = _Array$from38[0],
              cnj = _Array$from38[1];

          code = 'typeof ' + code + ' ' + cmp + ' "undefined" ' + cnj + ' ' + code + ' ' + cmp + ' null';
        } else {
          // do not use strict equality here; it will break existing code
          code = code + ' ' + (this.negated ? '==' : '!=') + ' null';
        }
        return [this.makeCode(o.level <= LEVEL_COND ? code : '(' + code + ')')];
      }
    }]);

    return Existence;
  }(Base);
  Existence.initClass();
  return Existence;
}();

// ### Parens

// An extra set of parentheses, specified explicitly in the source. At one time
// we tried to clean up the results by detecting and removing redundant
// parentheses, but no longer -- you can put in as many as you please.
//
// Parentheses are a good way to force any statement to become an expression.
exports.Parens = Parens = function () {
  Parens = function (_Base30) {
    _inherits(Parens, _Base30);

    _createClass(Parens, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['body'];
      }
    }]);

    function Parens(body) {
      _classCallCheck(this, Parens);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this66 = _possibleConstructorReturn(this, (Parens.__proto__ || Object.getPrototypeOf(Parens)).call(this));
        }
        var thisFn = function () {
          return _this66;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this66.body = body;
      return _possibleConstructorReturn(_this66);
    }

    _createClass(Parens, [{
      key: 'unwrap',
      value: function unwrap() {
        return this.body;
      }
    }, {
      key: 'isComplex',
      value: function isComplex() {
        return this.body.isComplex();
      }
    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var expr = this.body.unwrap();
        if (expr instanceof Value && expr.isAtomic()) {
          expr.front = this.front;
          return expr.compileToFragments(o);
        }
        var fragments = expr.compileToFragments(o, LEVEL_PAREN);
        var bare = o.level < LEVEL_OP && (expr instanceof Op || expr instanceof Call || expr instanceof For && expr.returns) && (o.level < LEVEL_COND || fragments.length <= 3);
        if (bare) {
          return fragments;
        }return this.wrapInBraces(fragments);
      }
    }]);

    return Parens;
  }(Base);
  Parens.initClass();
  return Parens;
}();

// ### StringWithInterpolations

// Strings with interpolations are in fact just a variation of `Parens` with
// string concatenation inside.

exports.StringWithInterpolations = StringWithInterpolations = function (_Parens) {
  _inherits(StringWithInterpolations, _Parens);

  function StringWithInterpolations() {
    _classCallCheck(this, StringWithInterpolations);

    return _possibleConstructorReturn(this, (StringWithInterpolations.__proto__ || Object.getPrototypeOf(StringWithInterpolations)).apply(this, arguments));
  }

  _createClass(StringWithInterpolations, [{
    key: 'compileNode',

    // Uncomment the following line in CoffeeScript 2, to allow all interpolated
    // strings to be output using the ES2015 syntax:
    // unwrap: -> this

    value: function compileNode(o) {
      // This method produces an interpolated string using the new ES2015 syntax,
      // which is opt-in by using tagged template literals. If this
      // StringWithInterpolations isn’t inside a tagged template literal,
      // fall back to the CoffeeScript 1.x output.
      // (Remove this check in CoffeeScript 2.)
      if (!o.inTaggedTemplateCall) {
        return _get(StringWithInterpolations.prototype.__proto__ || Object.getPrototypeOf(StringWithInterpolations.prototype), 'compileNode', this).apply(this, arguments);
      }

      // Assumption: expr is Value>StringLiteral or Op
      var expr = this.body.unwrap();

      var elements = [];
      expr.traverseChildren(false, function (node) {
        if (node instanceof StringLiteral) {
          elements.push(node);
          return true;
        }if (node instanceof Parens) {
          elements.push(node);
          return false;
        }
        return true;
      });

      var fragments = [];
      fragments.push(this.makeCode('`'));
      var _iteratorNormalCompletion23 = true;
      var _didIteratorError23 = false;
      var _iteratorError23 = undefined;

      try {
        for (var _iterator23 = Array.from(elements)[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
          var element = _step23.value;

          if (element instanceof StringLiteral) {
            var value = element.value.slice(1, -1);
            // Backticks and `${` inside template literals must be escaped.
            value = value.replace(/(\\*)(`|\$\{)/g, function (match, backslashes, toBeEscaped) {
              if (backslashes.length % 2 === 0) {
                return backslashes + '\\' + toBeEscaped;
              }
              return match;
            });
            fragments.push(this.makeCode(value));
          } else {
            fragments.push(this.makeCode('${'));
            fragments.push.apply(fragments, _toConsumableArray(Array.from(element.compileToFragments(o, LEVEL_PAREN) || [])));
            fragments.push(this.makeCode('}'));
          }
        }
      } catch (err) {
        _didIteratorError23 = true;
        _iteratorError23 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion23 && _iterator23.return) {
            _iterator23.return();
          }
        } finally {
          if (_didIteratorError23) {
            throw _iteratorError23;
          }
        }
      }

      fragments.push(this.makeCode('`'));

      return fragments;
    }
  }]);

  return StringWithInterpolations;
}(Parens);

// ### For

// CoffeeScript's replacement for the *for* loop is our array and object
// comprehensions, that compile into *for* loops here. They also act as an
// expression, able to return the result of each filtered iteration.
//
// Unlike Python array comprehensions, they can be multi-line, and you can pass
// the current index of the loop as a second parameter. Unlike Ruby blocks,
// you can map and filter in a single pass.
exports.For = For = function () {
  For = function (_While) {
    _inherits(For, _While);

    _createClass(For, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['body', 'source', 'guard', 'step'];
      }
    }]);

    function For(body, source) {
      _classCallCheck(this, For);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this68 = _possibleConstructorReturn(this, (For.__proto__ || Object.getPrototypeOf(For)).call(this));
        }
        var thisFn = function () {
          return _this68;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this68.source = source.source;
      _this68.guard = source.guard;
      _this68.step = source.step;
      _this68.name = source.name;
      _this68.index = source.index;

      _this68.body = Block.wrap([body]);
      _this68.own = !!source.own;
      _this68.object = !!source.object;
      _this68.from = !!source.from;
      if (_this68.from && _this68.index) {
        _this68.index.error('cannot use index with for-from');
      }
      if (_this68.own && !_this68.object) {
        source.ownTag.error('cannot use own with for-' + (_this68.from ? 'from' : 'in'));
      }
      if (_this68.object) {
        var _Array$from39 = Array.from([_this68.index, _this68.name]);

        var _Array$from40 = _slicedToArray(_Array$from39, 2);

        _this68.name = _Array$from40[0];
        _this68.index = _Array$from40[1];
      }
      if (_this68.index instanceof Value && !_this68.index.isAssignable()) {
        _this68.index.error('index cannot be a pattern matching expression');
      }
      _this68.range = _this68.source instanceof Value && _this68.source.base instanceof Range && !_this68.source.properties.length && !_this68.from;
      _this68.pattern = _this68.name instanceof Value;
      if (_this68.range && _this68.index) {
        _this68.index.error('indexes do not apply to range loops');
      }
      if (_this68.range && _this68.pattern) {
        _this68.name.error('cannot pattern match over range loops');
      }
      _this68.returns = false;
      return _possibleConstructorReturn(_this68);
    }

    // Welcome to the hairiest method in all of CoffeeScript. Handles the inner
    // loop, filtering, stepping, and result saving for array, object, and range
    // comprehensions. Some of the generated code can be shared in common, and
    // some cannot.


    _createClass(For, [{
      key: 'compileNode',
      value: function compileNode(o) {
        var forPartFragments = void 0;var ivar = void 0;var name = void 0;var namePart = void 0;var resultPart = void 0;var returnResult = void 0;var rvar = void 0;var step = void 0;var stepNum = void 0;var stepVar = void 0;var svar = void 0;
        var body = Block.wrap([this.body]);
        var last = body.expressions[body.expressions.length - 1];
        if ((last != null ? last.jumps() : undefined) instanceof Return) {
          this.returns = false;
        }
        var source = this.range ? this.source.base : this.source;
        var scope = o.scope;

        if (!this.pattern) {
          name = this.name && this.name.compile(o, LEVEL_LIST);
        }
        var index = this.index && this.index.compile(o, LEVEL_LIST);
        if (name && !this.pattern) {
          scope.find(name);
        }
        if (index && !(this.index instanceof Value)) {
          scope.find(index);
        }
        if (this.returns) {
          rvar = scope.freeVariable('results');
        }
        if (this.from) {
          if (this.pattern) {
            ivar = scope.freeVariable('x', { single: true });
          }
        } else {
          ivar = this.object && index || scope.freeVariable('i', { single: true });
        }
        var kvar = (this.range || this.from) && name || index || ivar;
        var kvarAssign = kvar !== ivar ? kvar + ' = ' : '';
        if (this.step && !this.range) {
          var _Array$from41 = Array.from(this.cacheToCodeFragments(this.step.cache(o, LEVEL_LIST, isComplexOrAssignable)));

          var _Array$from42 = _slicedToArray(_Array$from41, 2);

          step = _Array$from42[0];
          stepVar = _Array$from42[1];

          if (this.step.isNumber()) {
            stepNum = Number(stepVar);
          }
        }
        if (this.pattern) {
          name = ivar;
        }
        var varPart = '';
        var guardPart = '';
        var defPart = '';
        var idt1 = this.tab + TAB;
        if (this.range) {
          forPartFragments = source.compileToFragments(merge(o, {
            index: ivar, name: name, step: this.step, isComplex: isComplexOrAssignable
          }));
        } else {
          svar = this.source.compile(o, LEVEL_LIST);
          if ((name || this.own) && !(this.source.unwrap() instanceof IdentifierLiteral)) {
            var ref = void 0;
            defPart += '' + this.tab + (ref = scope.freeVariable('ref')) + ' = ' + svar + ';\n';
            svar = ref;
          }
          if (name && !this.pattern && !this.from) {
            namePart = name + ' = ' + svar + '[' + kvar + ']';
          }
          if (!this.object && !this.from) {
            var increment = void 0;var lvar = void 0;
            if (step !== stepVar) {
              defPart += '' + this.tab + step + ';\n';
            }
            var down = stepNum < 0;
            if (!this.step || stepNum == null || !down) {
              lvar = scope.freeVariable('len');
            }
            var declare = '' + kvarAssign + ivar + ' = 0, ' + lvar + ' = ' + svar + '.length';
            var declareDown = '' + kvarAssign + ivar + ' = ' + svar + '.length - 1';
            var compare = ivar + ' < ' + lvar;
            var compareDown = ivar + ' >= 0';
            if (this.step) {
              if (stepNum != null) {
                if (down) {
                  compare = compareDown;
                  declare = declareDown;
                }
              } else {
                compare = stepVar + ' > 0 ? ' + compare + ' : ' + compareDown;
                declare = '(' + stepVar + ' > 0 ? (' + declare + ') : ' + declareDown + ')';
              }
              increment = ivar + ' += ' + stepVar;
            } else {
              increment = '' + (kvar !== ivar ? '++' + ivar : ivar + '++');
            }
            forPartFragments = [this.makeCode(declare + '; ' + compare + '; ' + kvarAssign + increment)];
          }
        }
        if (this.returns) {
          resultPart = '' + this.tab + rvar + ' = [];\n';
          returnResult = '\n' + this.tab + 'return ' + rvar + ';';
          body.makeReturn(rvar);
        }
        if (this.guard) {
          if (body.expressions.length > 1) {
            body.expressions.unshift(new If(new Parens(this.guard).invert(), new StatementLiteral('continue')));
          } else if (this.guard) {
            body = Block.wrap([new If(this.guard, body)]);
          }
        }
        if (this.pattern) {
          body.expressions.unshift(new Assign(this.name, this.from ? new IdentifierLiteral(kvar) : new Literal(svar + '[' + kvar + ']')));
        }
        var defPartFragments = [].concat(this.makeCode(defPart), this.pluckDirectCall(o, body));
        if (namePart) {
          varPart = '\n' + idt1 + namePart + ';';
        }
        if (this.object) {
          forPartFragments = [this.makeCode(kvar + ' in ' + svar)];
          if (this.own) {
            guardPart = '\n' + idt1 + 'if (!' + utility('hasProp', o) + '.call(' + svar + ', ' + kvar + ')) continue;';
          }
        } else if (this.from) {
          forPartFragments = [this.makeCode(kvar + ' of ' + svar)];
        }
        var bodyFragments = body.compileToFragments(merge(o, { indent: idt1 }), LEVEL_TOP);
        if (bodyFragments && bodyFragments.length > 0) {
          bodyFragments = [].concat(this.makeCode('\n'), bodyFragments, this.makeCode('\n'));
        }
        return [].concat(defPartFragments, this.makeCode('' + (resultPart || '') + this.tab + 'for ('), forPartFragments, this.makeCode(') {' + guardPart + varPart), bodyFragments, this.makeCode(this.tab + '}' + (returnResult || '')));
      }
    }, {
      key: 'pluckDirectCall',
      value: function pluckDirectCall(o, body) {
        var defs = [];
        for (var idx = 0; idx < body.expressions.length; idx++) {
          var expr = body.expressions[idx];
          expr = expr.unwrapAll();
          if (!(expr instanceof Call)) {
            continue;
          }
          var val = expr.variable != null ? expr.variable.unwrapAll() : undefined;
          if (!(val instanceof Code) && (!(val instanceof Value) || !((val.base != null ? val.base.unwrapAll() : undefined) instanceof Code) || val.properties.length !== 1 || !['call', 'apply'].includes(val.properties[0].name != null ? val.properties[0].name.value : undefined))) {
            continue;
          }
          var fn = (val.base != null ? val.base.unwrapAll() : undefined) || val;
          var ref = new IdentifierLiteral(o.scope.freeVariable('fn'));
          var base = new Value(ref);
          if (val.base) {
            var _Array$from43 = Array.from([base, val]);

            var _Array$from44 = _slicedToArray(_Array$from43, 2);

            val.base = _Array$from44[0];
            base = _Array$from44[1];
          }
          body.expressions[idx] = new Call(base, expr.args);
          defs = defs.concat(this.makeCode(this.tab), new Assign(ref, fn).compileToFragments(o, LEVEL_TOP), this.makeCode(';\n'));
        }
        return defs;
      }
    }]);

    return For;
  }(While);
  For.initClass();
  return For;
}();

// ### Switch

// A JavaScript *switch* statement. Converts into a returnable expression on-demand.
exports.Switch = Switch = function () {
  Switch = function (_Base31) {
    _inherits(Switch, _Base31);

    _createClass(Switch, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['subject', 'cases', 'otherwise'];

        this.prototype.isStatement = YES;
      }
    }]);

    function Switch(subject, cases, otherwise) {
      _classCallCheck(this, Switch);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this69 = _possibleConstructorReturn(this, (Switch.__proto__ || Object.getPrototypeOf(Switch)).call(this));
        }
        var thisFn = function () {
          return _this69;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this69.subject = subject;
      _this69.cases = cases;
      _this69.otherwise = otherwise;
      return _possibleConstructorReturn(_this69);
    }

    _createClass(Switch, [{
      key: 'jumps',
      value: function jumps(o) {
        if (o == null) {
          o = { block: true };
        }
        var _iteratorNormalCompletion24 = true;
        var _didIteratorError24 = false;
        var _iteratorError24 = undefined;

        try {
          for (var _iterator24 = Array.from(this.cases)[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
            var _ref = _step24.value;

            var _ref2 = _slicedToArray(_ref, 2);

            var conds = _ref2[0];
            var block = _ref2[1];

            var jumpNode;
            if (jumpNode = block.jumps(o)) {
              return jumpNode;
            }
          }
        } catch (err) {
          _didIteratorError24 = true;
          _iteratorError24 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion24 && _iterator24.return) {
              _iterator24.return();
            }
          } finally {
            if (_didIteratorError24) {
              throw _iteratorError24;
            }
          }
        }

        return this.otherwise != null ? this.otherwise.jumps(o) : undefined;
      }
    }, {
      key: 'makeReturn',
      value: function makeReturn(res) {
        var _iteratorNormalCompletion25 = true;
        var _didIteratorError25 = false;
        var _iteratorError25 = undefined;

        try {
          for (var _iterator25 = Array.from(this.cases)[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
            var pair = _step25.value;
            pair[1].makeReturn(res);
          }
        } catch (err) {
          _didIteratorError25 = true;
          _iteratorError25 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion25 && _iterator25.return) {
              _iterator25.return();
            }
          } finally {
            if (_didIteratorError25) {
              throw _iteratorError25;
            }
          }
        }

        if (res) {
          if (!this.otherwise) {
            this.otherwise = new Block([new Literal('void 0')]);
          }
        }
        if (this.otherwise != null) {
          this.otherwise.makeReturn(res);
        }
        return this;
      }
    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        var idt1 = o.indent + TAB;
        var idt2 = o.indent = idt1 + TAB;
        var fragments = [].concat(this.makeCode(this.tab + 'switch ('), this.subject ? this.subject.compileToFragments(o, LEVEL_PAREN) : this.makeCode('false'), this.makeCode(') {\n'));
        for (var i = 0; i < this.cases.length; i++) {
          var body;var cond;

          var _cases$i = _slicedToArray(this.cases[i], 2),
              conditions = _cases$i[0],
              block = _cases$i[1];

          var _iteratorNormalCompletion26 = true;
          var _didIteratorError26 = false;
          var _iteratorError26 = undefined;

          try {
            for (var _iterator26 = Array.from(flatten([conditions]))[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
              cond = _step26.value;

              if (!this.subject) {
                cond = cond.invert();
              }
              fragments = fragments.concat(this.makeCode(idt1 + 'case '), cond.compileToFragments(o, LEVEL_PAREN), this.makeCode(':\n'));
            }
          } catch (err) {
            _didIteratorError26 = true;
            _iteratorError26 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion26 && _iterator26.return) {
                _iterator26.return();
              }
            } finally {
              if (_didIteratorError26) {
                throw _iteratorError26;
              }
            }
          }

          if ((body = block.compileToFragments(o, LEVEL_TOP)).length > 0) {
            fragments = fragments.concat(body, this.makeCode('\n'));
          }
          if (i === this.cases.length - 1 && !this.otherwise) {
            break;
          }
          var expr = this.lastNonComment(block.expressions);
          if (expr instanceof Return || expr instanceof Literal && expr.jumps() && expr.value !== 'debugger') {
            continue;
          }
          fragments.push(cond.makeCode(idt2 + 'break;\n'));
        }
        if (this.otherwise && this.otherwise.expressions.length) {
          var _fragments;

          (_fragments = fragments).push.apply(_fragments, [this.makeCode(idt1 + 'default:\n')].concat(_toConsumableArray(Array.from(this.otherwise.compileToFragments(o, LEVEL_TOP))), [this.makeCode('\n')]));
        }
        fragments.push(this.makeCode(this.tab + '}'));
        return fragments;
      }
    }]);

    return Switch;
  }(Base);
  Switch.initClass();
  return Switch;
}();

// ### If

// *If/else* statements. Acts as an expression by pushing down requested returns
// to the last line of each clause.
//
// Single-expression **Ifs** are compiled into conditional operators if possible,
// because ternaries are already proper expressions, and don't need conversion.
exports.If = If = function () {
  If = function (_Base32) {
    _inherits(If, _Base32);

    _createClass(If, null, [{
      key: 'initClass',
      value: function initClass() {
        this.prototype.children = ['condition', 'body', 'elseBody'];
      }
    }]);

    function If(condition, body, options) {
      _classCallCheck(this, If);

      {
        // Hack: trick Babel/TypeScript into allowing this before super.
        if (false) {
          var _this70 = _possibleConstructorReturn(this, (If.__proto__ || Object.getPrototypeOf(If)).call(this));
        }
        var thisFn = function () {
          return _this70;
        }.toString();
        var thisName = thisFn.match(/return (?:_assertThisInitialized\()*(\w+)\)*;/)[1];
        eval(thisName + ' = this;');
      }
      _this70.body = body;
      if (options == null) {
        options = {};
      }
      _this70.condition = options.type === 'unless' ? condition.invert() : condition;
      _this70.elseBody = null;
      _this70.isChain = false;
      var _options2 = options;
      _this70.soak = _options2.soak;
      return _possibleConstructorReturn(_this70);
    }

    _createClass(If, [{
      key: 'bodyNode',
      value: function bodyNode() {
        return this.body != null ? this.body.unwrap() : undefined;
      }
    }, {
      key: 'elseBodyNode',
      value: function elseBodyNode() {
        return this.elseBody != null ? this.elseBody.unwrap() : undefined;
      }

      // Rewrite a chain of **Ifs** to add a default case as the final *else*.

    }, {
      key: 'addElse',
      value: function addElse(elseBody) {
        if (this.isChain) {
          this.elseBodyNode().addElse(elseBody);
        } else {
          this.isChain = elseBody instanceof If;
          this.elseBody = this.ensureBlock(elseBody);
          this.elseBody.updateLocationDataIfMissing(elseBody.locationData);
        }
        return this;
      }

      // The **If** only compiles into a statement if either of its bodies needs
      // to be a statement. Otherwise a conditional operator is safe.

    }, {
      key: 'isStatement',
      value: function isStatement(o) {
        return (o != null ? o.level : undefined) === LEVEL_TOP || this.bodyNode().isStatement(o) || __guard__(this.elseBodyNode(), function (x) {
          return x.isStatement(o);
        });
      }
    }, {
      key: 'jumps',
      value: function jumps(o) {
        return this.body.jumps(o) || (this.elseBody != null ? this.elseBody.jumps(o) : undefined);
      }
    }, {
      key: 'compileNode',
      value: function compileNode(o) {
        if (this.isStatement(o)) {
          return this.compileStatement(o);
        }return this.compileExpression(o);
      }
    }, {
      key: 'makeReturn',
      value: function makeReturn(res) {
        if (res) {
          if (!this.elseBody) {
            this.elseBody = new Block([new Literal('void 0')]);
          }
        }
        if (this.body) {
          this.body = new Block([this.body.makeReturn(res)]);
        }
        if (this.elseBody) {
          this.elseBody = new Block([this.elseBody.makeReturn(res)]);
        }
        return this;
      }
    }, {
      key: 'ensureBlock',
      value: function ensureBlock(node) {
        if (node instanceof Block) {
          return node;
        }return new Block([node]);
      }

      // Compile the `If` as a regular *if-else* statement. Flattened chains
      // force inner *else* bodies into statement form.

    }, {
      key: 'compileStatement',
      value: function compileStatement(o) {
        var child = del(o, 'chainChild');
        var exeq = del(o, 'isExistentialEquals');

        if (exeq) {
          return new If(this.condition.invert(), this.elseBodyNode(), { type: 'if' }).compileToFragments(o);
        }

        var indent = o.indent + TAB;
        var cond = this.condition.compileToFragments(o, LEVEL_PAREN);
        var body = this.ensureBlock(this.body).compileToFragments(merge(o, { indent: indent }));
        var ifPart = [].concat(this.makeCode('if ('), cond, this.makeCode(') {\n'), body, this.makeCode('\n' + this.tab + '}'));
        if (!child) {
          ifPart.unshift(this.makeCode(this.tab));
        }
        if (!this.elseBody) {
          return ifPart;
        }
        var answer = ifPart.concat(this.makeCode(' else '));
        if (this.isChain) {
          o.chainChild = true;
          answer = answer.concat(this.elseBody.unwrap().compileToFragments(o, LEVEL_TOP));
        } else {
          answer = answer.concat(this.makeCode('{\n'), this.elseBody.compileToFragments(merge(o, { indent: indent }), LEVEL_TOP), this.makeCode('\n' + this.tab + '}'));
        }
        return answer;
      }

      // Compile the `If` as a conditional operator.

    }, {
      key: 'compileExpression',
      value: function compileExpression(o) {
        var cond = this.condition.compileToFragments(o, LEVEL_COND);
        var body = this.bodyNode().compileToFragments(o, LEVEL_LIST);
        var alt = this.elseBodyNode() ? this.elseBodyNode().compileToFragments(o, LEVEL_LIST) : [this.makeCode('void 0')];
        var fragments = cond.concat(this.makeCode(' ? '), body, this.makeCode(' : '), alt);
        if (o.level >= LEVEL_COND) {
          return this.wrapInBraces(fragments);
        }return fragments;
      }
    }, {
      key: 'unfoldSoak',
      value: function unfoldSoak() {
        return this.soak && this;
      }
    }]);

    return If;
  }(Base);
  If.initClass();
  return If;
}();

// Constants
// ---------

var UTILITIES = {

  // Correctly set up a prototype chain for inheritance, including a reference
  // to the superclass for `super()` calls, and copies of any static properties.
  extend: function extend(o) {
    return 'function(child, parent) { for (var key in parent) { if (' + utility('hasProp', o) + '.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }';
  },


  // Create a function bound to the current value of "this".
  bind: function bind() {
    return 'function(fn, me){ return function(){ return fn.apply(me, arguments); }; }';
  },


  // Discover if an item is in an array.
  indexOf: function indexOf() {
    return '[].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; }';
  },
  modulo: function modulo() {
    return 'function(a, b) { return (+a % (b = +b) + b) % b; }';
  },


  // Shortcuts to speed up the lookup time for native functions.
  hasProp: function hasProp() {
    return '{}.hasOwnProperty';
  },
  slice: function slice() {
    return '[].slice';
  }
};

// Levels indicate a node's position in the AST. Useful for knowing if
// parens are necessary or superfluous.
var LEVEL_TOP = 1; // ...;
var LEVEL_PAREN = 2; // (...)
var LEVEL_LIST = 3; // [...]
var LEVEL_COND = 4; // ... ? x : y
var LEVEL_OP = 5; // !...
var LEVEL_ACCESS = 6; // ...[0]

// Tabs are two spaces for pretty printing.
var TAB = '  ';

var SIMPLENUM = /^[+-]?\d+$/;

// Helper Functions
// ----------------

// Helper for ensuring that utility functions are assigned at the top level.
var utility = function utility(name, o) {
  var root = o.scope.root;

  if (name in root.utilities) {
    return root.utilities[name];
  }
  var ref = root.freeVariable(name);
  root.assign(ref, UTILITIES[name](o));
  return root.utilities[name] = ref;
};

var multident = function multident(code, tab) {
  code = code.replace(/\n/g, '$&' + tab);
  return code.replace(/\s+$/, '');
};

var isLiteralArguments = function isLiteralArguments(node) {
  return node instanceof IdentifierLiteral && node.value === 'arguments';
};

var isLiteralThis = function isLiteralThis(node) {
  return node instanceof ThisLiteral || node instanceof Code && node.bound || node instanceof SuperCall;
};

var isComplexOrAssignable = function isComplexOrAssignable(node) {
  return node.isComplex() || (typeof node.isAssignable === 'function' ? node.isAssignable() : undefined);
};

// Unfold a node's child if soak, then tuck the node under created `If`
var _unfoldSoak = function _unfoldSoak(o, parent, name) {
  var ifn = void 0;
  if (!(ifn = parent[name].unfoldSoak(o))) {
    return;
  }
  parent[name] = ifn.body;
  ifn.body = new Value(parent);
  return ifn;
};

function __guard__(value, transform) {
  return typeof value !== 'undefined' && value !== null ? transform(value) : undefined;
}
function __range__(left, right, inclusive) {
  var range = [];
  var ascending = left < right;
  var end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}