var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* eslint-disable
    class-methods-use-this,
    consistent-return,
    max-len,
    no-constant-condition,
    no-multi-assign,
    no-nested-ternary,
    no-param-reassign,
    no-plusplus,
    no-restricted-syntax,
    no-return-assign,
    no-shadow,
    no-unused-vars,
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
// The **Scope** class regulates lexical scoping within CoffeeScript. As you
// generate code, you create a tree of scopes in the same shape as the nested
// function bodies. Each scope knows about the variables declared within it,
// and has a reference to its parent enclosing scope. In this way, we know which
// variables are new and need to be declared with `var`, and which are shared
// with external scopes.
var Scope = void 0;
exports.Scope = Scope = function () {
  // Initialize a scope with its parent, for lookups up the chain,
  // as well as a reference to the **Block** node it belongs to, which is
  // where it should declare its variables, a reference to the function that
  // it belongs to, and a list of variables referenced in the source code
  // and therefore should be avoided when generating variables.
  function Scope(parent, expressions, method, referencedVars) {
    _classCallCheck(this, Scope);

    this.parent = parent;
    this.expressions = expressions;
    this.method = method;
    this.referencedVars = referencedVars;
    this.variables = [{ name: 'arguments', type: 'arguments' }];
    this.positions = {};
    if (!this.parent) {
      this.utilities = {};
    }

    // The `@root` is the top-level **Scope** object for a given file.
    this.root = (this.parent != null ? this.parent.root : undefined) != null ? this.parent != null ? this.parent.root : undefined : this;
  }

  // Adds a new variable or overrides an existing one.


  _createClass(Scope, [{
    key: 'add',
    value: function add(name, type, immediate) {
      if (this.shared && !immediate) {
        return this.parent.add(name, type, immediate);
      }
      if (Object.prototype.hasOwnProperty.call(this.positions, name)) {
        return this.variables[this.positions[name]].type = type;
      }
      return this.positions[name] = this.variables.push({ name: name, type: type }) - 1;
    }

    // When `super` is called, we need to find the name of the current method we're
    // in, so that we know how to invoke the same method of the parent class. This
    // can get complicated if super is being called from an inner function.
    // `namedMethod` will walk up the scope tree until it either finds the first
    // function object that has a name filled in, or bottoms out.

  }, {
    key: 'namedMethod',
    value: function namedMethod() {
      if ((this.method != null ? this.method.name : undefined) || !this.parent) {
        return this.method;
      }
      return this.parent.namedMethod();
    }

    // Look up a variable name in lexical scope, and declare it if it does not
    // already exist.

  }, {
    key: 'find',
    value: function find(name, type) {
      if (type == null) {
        type = 'var';
      }
      if (this.check(name)) {
        return true;
      }
      this.add(name, type);
      return false;
    }

    // Reserve a variable name as originating from a function parameter for this
    // scope. No `var` required for internal references.

  }, {
    key: 'parameter',
    value: function parameter(name) {
      if (this.shared && this.parent.check(name, true)) {
        return;
      }
      return this.add(name, 'param');
    }

    // Just check to see if a variable has already been declared, without reserving,
    // walks up to the root scope.

  }, {
    key: 'check',
    value: function check(name) {
      return !!(this.type(name) || (this.parent != null ? this.parent.check(name) : undefined));
    }

    // Generate a temporary variable name at the given index.

  }, {
    key: 'temporary',
    value: function temporary(name, index, single) {
      if (single == null) {
        single = false;
      }
      if (single) {
        var startCode = name.charCodeAt(0);
        var endCode = 'z'.charCodeAt(0);
        var diff = endCode - startCode;
        var newCode = startCode + index % (diff + 1);
        var letter = String.fromCharCode(newCode);
        var num = Math.floor(index / (diff + 1));
        return '' + letter + (num || '');
      }
      return '' + name + (index || '');
    }

    // Gets the type of a variable.

  }, {
    key: 'type',
    value: function type(name) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Array.from(this.variables)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var v = _step.value;
          if (v.name === name) {
            return v.type;
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

      return null;
    }

    // If we need to store an intermediate result, find an available name for a
    // compiler-generated variable. `_var`, `_var2`, and so on...

  }, {
    key: 'freeVariable',
    value: function freeVariable(name, options) {
      var temp = void 0;
      if (options == null) {
        options = {};
      }
      var index = 0;
      while (true) {
        temp = this.temporary(name, index, options.single);
        if (!this.check(temp) && !Array.from(this.root.referencedVars).includes(temp)) {
          break;
        }
        index++;
      }
      if (options.reserve != null ? options.reserve : true) {
        this.add(temp, 'var', true);
      }
      return temp;
    }

    // Ensure that an assignment is made at the top of this scope
    // (or at the top-level scope, if requested).

  }, {
    key: 'assign',
    value: function assign(name, value) {
      this.add(name, { value: value, assigned: true }, true);
      return this.hasAssignments = true;
    }

    // Does this scope have any declared variables?

  }, {
    key: 'hasDeclarations',
    value: function hasDeclarations() {
      return !!this.declaredVariables().length;
    }

    // Return the list of variables first declared in this scope.

  }, {
    key: 'declaredVariables',
    value: function declaredVariables() {
      return Array.from(this.variables).filter(function (v) {
        return v.type === 'var';
      }).map(function (v) {
        return v.name;
      }).sort();
    }

    // Return the list of assignments that are supposed to be made at the top
    // of this scope.

  }, {
    key: 'assignedVariables',
    value: function assignedVariables() {
      return Array.from(this.variables).filter(function (v) {
        return v.type.assigned;
      }).map(function (v) {
        return v.name + ' = ' + v.type.value;
      });
    }
  }]);

  return Scope;
}();