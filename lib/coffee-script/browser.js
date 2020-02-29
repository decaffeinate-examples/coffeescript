function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * DS209: Avoid top-level return
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// This **Browser** compatibility layer extends core CoffeeScript functions
// to make things work smoothly when compiling code directly in the browser.
// We add support for loading remote Coffee scripts via **XHR**, and
// `text/coffeescript` script tags, source maps via data-URLs, and so on.

var CoffeeScript = require('./coffee-script');
CoffeeScript.require = require;
var compile = CoffeeScript.compile;

// Use standard JavaScript `eval` to eval code.

CoffeeScript.eval = function (code, options) {
  if (options == null) {
    options = {};
  }
  if (options.bare == null) {
    options.bare = true;
  }
  return eval(compile(code, options));
};

// Running code does not provide access to this scope.
CoffeeScript.run = function (code, options) {
  if (options == null) {
    options = {};
  }
  options.bare = true;
  options.shiftLine = true;
  return Function(compile(code, options))();
};

// If we're not in a browser environment, we're finished with the public API.
if (typeof window === 'undefined' || window === null) {
  return;
}

// Include source maps where possible. If we've got a base64 encoder, a
// JSON serializer, and tools for escaping unicode characters, we're good to go.
// Ported from https://developer.mozilla.org/en-US/docs/DOM/window.btoa
if (typeof btoa !== 'undefined' && btoa !== null && typeof JSON !== 'undefined' && JSON !== null) {
  compile = function compile(code, options) {
    if (options == null) {
      options = {};
    }
    options.inlineMap = true;
    return CoffeeScript.compile(code, options);
  };
}

// Load a remote script from the current domain via XHR.
CoffeeScript.load = function (url, callback, options, hold) {
  if (options == null) {
    options = {};
  }
  if (hold == null) {
    hold = false;
  }
  options.sourceFiles = [url];
  var xhr = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP') : new window.XMLHttpRequest();
  xhr.open('GET', url, true);
  if ('overrideMimeType' in xhr) {
    xhr.overrideMimeType('text/plain');
  }
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      var param = void 0;
      if ([0, 200].includes(xhr.status)) {
        param = [xhr.responseText, options];
        if (!hold) {
          CoffeeScript.run.apply(CoffeeScript, _toConsumableArray(Array.from(param || [])));
        }
      } else {
        throw new Error('Could not load ' + url);
      }
      if (callback) {
        return callback(param);
      }
    }
  };
  return xhr.send(null);
};

// Activate CoffeeScript in the browser by having it compile and evaluate
// all script tags with a content-type of `text/coffeescript`.
// This happens on page load.
var runScripts = function runScripts() {
  var scripts = window.document.getElementsByTagName('script');
  var coffeetypes = ['text/coffeescript', 'text/literate-coffeescript'];
  var coffees = Array.from(scripts).filter(function (s) {
    return Array.from(coffeetypes).includes(s.type);
  });
  var index = 0;

  var execute = function execute() {
    var param = coffees[index];
    if (param instanceof Array) {
      CoffeeScript.run.apply(CoffeeScript, _toConsumableArray(Array.from(param || [])));
      index++;
      return execute();
    }
  };

  for (var i = 0; i < coffees.length; i++) {
    var script = coffees[i];
    (function (script, i) {
      var options = { literate: script.type === coffeetypes[1] };
      var source = script.src || script.getAttribute('data-src');
      if (source) {
        return CoffeeScript.load(source, function (param) {
          coffees[i] = param;
          return execute();
        }, options, true);
      } else {
        options.sourceFiles = ['embedded'];
        return coffees[i] = [script.innerHTML, options];
      }
    })(script, i);
  }

  return execute();
};

// Listen for window load, both in decent browsers and in IE.
if (window.addEventListener) {
  window.addEventListener('DOMContentLoaded', runScripts, false);
} else {
  window.attachEvent('onload', runScripts);
}