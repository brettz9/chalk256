(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.colors = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
module.exports = function () {
	return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
};

},{}],2:[function(require,module,exports){
(function (process){
'use strict';
module.exports = (function () {
	if (process.argv.indexOf('--no-color') !== -1) {
		return false;
	}

	if (process.argv.indexOf('--color') !== -1) {
		return true;
	}

	if (process.stdout && !process.stdout.isTTY) {
		return false;
	}

	if (process.platform === 'win32') {
		return true;
	}

	if ('COLORTERM' in process.env) {
		return true;
	}

	if (process.env.TERM === 'dumb') {
		return false;
	}

	if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
		return true;
	}

	return false;
})();

}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
'use strict';
var ansiRegex = require('ansi-regex')();

module.exports = function (str) {
	return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};

},{"ansi-regex":1}],5:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],6:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],7:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":6,"_process":3,"inherits":5}],8:[function(require,module,exports){
module.exports={
  "name": "color-everywhere",
  "version": "0.1.0",
  "description": "Add colors to text on your terminal. A faster replacement for chalk that also adds 256 color support",
  "main": "dist/color-everywhere-node.min.js",
  "browser": "dist/color-everywhere.min.js",
  "dependencies": {
  },
  "devDependencies": {
      "babel-plugin-add-module-exports": "0.2.1",
      "babel-polyfill": "6.20.0",
      "babel-preset-es2015": "6.18.0",
      "babelify": "7.3.0",
      "eslint": "3.13.1",
      "eslint-config-standard": "6.2.1",
      "eslint-plugin-compat": "1.0.0",
      "eslint-plugin-promise": "3.4.0",
      "eslint-plugin-standard": "2.0.1",
      "grunt": "1.0.1",
      "grunt-browserify": "5.0.0",
      "grunt-cli": "1.2.0",
      "grunt-contrib-clean": "1.0.0",
      "grunt-contrib-concat": "1.0.1",
      "grunt-contrib-connect": "1.0.2",
      "grunt-contrib-nodeunit": "1.0.0",
      "grunt-contrib-qunit": "1.2.0",
      "grunt-contrib-uglify": "2.0.0",
      "grunt-contrib-watch": "1.0.0",
      "grunt-mocha-test": "0.13.2",
      "grunt-mocha-chai-sinon": "0.0.9",
      "gruntify-eslint": "3.1.0",
      "has-color": "0.1.7",
      "mocha": "3.2.0",
      "strip-ansi": "3.0.1",
      "util": "0.10.3"
},
  "scripts": {
      "dev": "grunt dev",
      "dev-browser": "grunt dev-browser",
      "dev-node": "grunt dev-node",
      "build": "grunt build",
      "build-browser": "grunt build-browser",
      "build-node": "grunt build-node",
      "mocha": "grunt mocha",

      "test": "grunt build && npm run mocha",
      "node-test": "grunt build-node && npm run mocha",
      "browser-test": "grunt dev-browser",
      "start": "npm run browser-test"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/brettz9/chalk256.git"
  },
  "author": "Brett Zamir",
  "contributors": [],
  "keywords": ["colors", "crayon", "chalk"],
  "engines": {
    "node": ">=6.9.2"
  },
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/brettz9/chalk256/issues"
  },
  "homepage": "https://github.com/brettz9/chalk256"
}

},{}],9:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // A module that returns an ANSI color code given either a CSS color name, a hex string, or an ANSI color code as a number

var _cssToAnsi = require('./css-to-ansi');

var _cssToAnsi2 = _interopRequireDefault(_cssToAnsi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Maps a 6 digit hex string describing a CSS color onto the ANSI 256 color palette
function fromHex(hex) {
    var _map = [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map(function (x) {
        return Math.round(parseInt(x, 16) / 255 * 5);
    }),
        _map2 = _slicedToArray(_map, 3),
        red = _map2[0],
        green = _map2[1],
        blue = _map2[2];

    return 16 + red * 36 + green * 6 + blue;
}

module.exports = function (code) {
    // Returns an ANSI color number given an ANSI color number, CSS color name, or CSS hex color
    switch (typeof code === 'undefined' ? 'undefined' : _typeof(code)) {
        case 'number':
            return code;
        case 'string':
            if (/^#?(?:[0-9a-f]{3}){1,2}$/i.test(code)) {
                if (code[0] === '#') {
                    code = code.slice(1);
                }
                if (code.length < 6) {
                    return fromHex(code[0] + code[0] + code[1] + code[1] + code[2] + code[2]);
                }
                return fromHex(code);
            }
            return _cssToAnsi2.default[code.toLowerCase()];
    }
};

},{"./css-to-ansi":11}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _hasColor = require('has-color');

var _hasColor2 = _interopRequireDefault(_hasColor);

var _stripAnsi = require('strip-ansi');

var _stripAnsi2 = _interopRequireDefault(_stripAnsi);

var _ansi256css = require('./ansi256css');

var _ansi256css2 = _interopRequireDefault(_ansi256css);

var _cssToAnsi = require('./css-to-ansi');

var _cssToAnsi2 = _interopRequireDefault(_cssToAnsi);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var logLevels = ['log', 'info', 'warn', 'error'];
var VERY_DARK_COLORS = [0, 16, 17, 18, 232, 233, 234, 235];

var codes = {};

var basics = {
    reset: [0, 0],
    bold: [1, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    blink: [5, 25],
    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    brightRed: [91, 39],
    brightGreen: [92, 39],
    brightYellow: [93, 39],
    brightBlue: [94, 39],
    brightMagenta: [95, 39],
    brightCyan: [96, 39],
    brightWhite: [97, 39],
    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgGray: [100, 49],
    bgBrightRed: [101, 49],
    bgBrightGreen: [102, 49],
    bgBrightYellow: [103, 49],
    bgBrightBlue: [104, 49],
    bgBrightMagenta: [105, 49],
    bgBrightCyan: [106, 49],
    bgBrightWhite: [107, 49]
};

basics.grey = basics.gray;
basics.bgGrey = basics.bgGray;

Object.keys(basics).forEach(function (styleName) {
    var _basics$styleName = _slicedToArray(basics[styleName], 2),
        begin = _basics$styleName[0],
        end = _basics$styleName[1];

    codes[styleName] = ['\x1B[' + begin + 'm', '\x1B[' + end + 'm'];
});

Object.keys(_cssToAnsi2.default).forEach(function (color) {
    var code = _cssToAnsi2.default[color];
    if (basics[color] != null) {
        color += '_';
    }
    codes[color] = ['\x1B[38;5;' + code + 'm', '\x1B[39m'];
    codes['bg' + color[0].toUpperCase() + color.slice(1).toLowerCase()] = ['\x1B[48;5;' + code + 'm', '\x1B[49m'];
});

function _rainbow(s) {
    return (0, _stripAnsi2.default)(s).split('').map(function (c, i) {
        return colors(i * 19 % 256 + 12 * VERY_DARK_COLORS.includes(i))(c);
    }).join('');
}

/**
* Adds functions like `.red` to an object
*/
function addColorFuncs(obj, prevStyles) {
    function _fn(name, style) {
        return Object.defineProperty(obj, name, {
            enumerable: true,
            configurable: true,
            get: function get() {
                var newStyles = [styleFunc.apply(undefined, _toConsumableArray(codes[name]))].concat(prevStyles);
                // Applies the style, `name`, to the colors
                var f = makeStyleFunc(newStyles);
                delete obj[name];
                obj[name] = f;
                return f;
            }
        });
    };
    Object.keys(codes).forEach(function (name) {
        var style = codes[name];
        _fn(name, style);
    });
    function _fn1(n) {
        ['' + n, '_' + n].forEach(function (x) {
            Object.defineProperty(obj, x, {
                enumerable: true,
                configurable: true,
                get: function get() {
                    var newStyles = [foregroundCode(n)].concat(prevStyles);
                    // Sets the foreground color of the colors to `n`;
                    var f = makeStyleFunc(newStyles);
                    delete obj[n];
                    obj[n] = f;
                    return f;
                }
            });
        });
        return Object.defineProperty(obj, 'bg' + n, {
            enumerable: true,
            configurable: true,
            get: function get() {
                var newStyles = [backgroundCode(n)].concat(prevStyles);
                // Sets the background color of the colors to `n`
                var f = makeStyleFunc(newStyles);
                delete obj[n];
                obj[n] = f;
                return f;
            }
        });
    };
    Array(256).fill().forEach(_fn1);

    function _fn2(name, newStyleFunc) {
        var f = obj[name] = function () {
            return makeStyleFunc(newStyleFunc.apply(undefined, arguments).concat(prevStyles));
        };
        return f;
    }

    [
    // Sets the foreground color for the colors
    ['foreground', function (x) {
        return [foregroundCode(getColorNumber(x))];
    }],
    // Sets the background color for the colors
    ['background', function (x) {
        return [backgroundCode(getColorNumber(x))];
    }],
    // Takes two arguments -- a foreground color and a background color -- and applies those styles to the colors
    ['fgbg', function (fg, bg) {
        return [foregroundCode(getColorNumber(fg)), backgroundCode(getColorNumber(bg))];
    }],
    // Applies any styles and colors you pass in; accepts multiple arguments
    ['color', general]].forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            name = _ref2[0],
            newStyleFunc = _ref2[1];

        _fn2(name, newStyleFunc);
    });
    obj.fg = obj.foreground;
    obj.bg = obj.background;
    obj._ = obj.color;
    Object.defineProperty(obj, 'rainbow', {
        enumerable: true,
        configurable: true,
        get: function get() {
            var newStyles = [_rainbow].concat(prevStyles);
            // Applies rainbow styling to the colors!
            var f = makeStyleFunc(newStyles);
            delete obj.rainbow;
            obj.rainbow = f;
            return f;
        }
    });
}

function styleFunc(begin, end) {
    return function (s) {
        return begin + s + end;
    };
}

/**
* Returns a function that applies a list of styles
* Styles are encoded using an Array of functions
*/
function makeStyleFunc(styles) {
    function f() {
        var s = _util2.default.format.apply(_util2.default, arguments);
        if (colors.enabled) {
            styles.forEach(function (style) {
                s = style(s);
            });
        }
        return s;
    }
    addColorFuncs(f, styles);
    logLevels.forEach(function (level) {
        var func = f[level] = function () {
            return colors.logger[level](f(_util2.default.format.apply(_util2.default, arguments)));
        };
        return func;
    });
    return f;
}

function getColorNumber(desc) {
    var num = (0, _ansi256css2.default)(desc);
    if (num == null) {
        throw new Error("Don't understand the color '" + desc + "'");
    }
    return num;
}

function foregroundCode(number) {
    return styleFunc('\x1B[38;5;' + number + 'm', '\x1B[39m');
}

function backgroundCode(number) {
    return styleFunc('\x1B[48;5;' + number + 'm', '\x1B[49m');
}

function ansiStyle(desc) {
    var re = /^(bg|background):?/i;
    if (!re.test(desc)) {
        return foregroundCode(getColorNumber(desc));
    }
    return backgroundCode(getColorNumber(desc.replace(re, '')));
}

/**
* Turns something like ['red blue', 'white'] into ['red', 'blue', 'white']
*/
function splitFlatten(list) {
    var _ref3;

    function split(x) {
        return typeof x === 'string' ? x.split(/\s+/) : [x];
    }
    return (_ref3 = []).concat.apply(_ref3, _toConsumableArray(list.map(function (x) {
        return split(x);
    })));
}

function general() {
    function t(x) {
        if (codes[x] != null) {
            return styleFunc.apply(undefined, _toConsumableArray(codes[x]));
        }
        return ansiStyle(x);
    };

    for (var _len = arguments.length, styles = Array(_len), _key = 0; _key < _len; _key++) {
        styles[_key] = arguments[_key];
    }

    return splitFlatten(styles).reverse().map(function (x) {
        return t(x);
    });
}

var colors = function colors() {
    return makeStyleFunc(general.apply(undefined, arguments));
};

addColorFuncs(colors, []);

colors.supportsColor = _hasColor2.default;

colors.stripColor = _stripAnsi2.default;

if (colors.enabled == null) {
    colors.enabled = _hasColor2.default;
}

if (colors.logger == null) {
    colors.logger = console;
}

logLevels.forEach(function (level) {
    return Object.defineProperty(colors, level, {
        enumerable: true,
        configurable: true,
        get: function get() {
            return colors.logger[level];
        }
    });
});

Object.defineProperty(colors, 'success', {
    enumerable: true,
    configurable: true,
    get: function get() {
        return colors.logger && colors.logger.success || function () {
            var _colors$green;

            return (_colors$green = colors.green).log.apply(_colors$green, arguments);
        };
    }
});

/**
* Displays all the colors
*/
colors.palette = function () {
    return colors.log(colors.inverse(Array(256).fill().map(function (_, i) {
        return colors(i)('  ' + (VERY_DARK_COLORS.includes(i) ? colors.bgWhite(i) : i) + '  ');
    }).join('')));
};

colors.version = _package2.default.version;
colors.splitFlatten = splitFlatten;

exports.default = colors;
module.exports = exports['default'];

},{"../package":8,"./ansi256css":9,"./css-to-ansi":11,"has-color":2,"strip-ansi":4,"util":7}],11:[function(require,module,exports){
module.exports={"aliceblue":231,"antiquewhite":230,"aqua":51,"aquamarine":122,"azure":231,"beige":230,"bisque":224,"black":16,"blanchedalmond":230,"blue":21,"blueviolet":134,"brown":131,"burlywood":187,"cadetblue":109,"chartreuse":118,"chocolate":173,"coral":210,"cornflowerblue":111,"cornsilk":230,"crimson":161,"cyan":51,"darkblue":19,"darkcyan":37,"darkgoldenrod":178,"darkgray":145,"darkgreen":28,"darkkhaki":186,"darkmagenta":127,"darkolivegreen":101,"darkorange":214,"darkorchid":134,"darkred":124,"darksalmon":216,"darkseagreen":151,"darkslateblue":61,"darkslategray":66,"darkturquoise":44,"darkviolet":128,"deeppink":199,"deepskyblue":45,"dimgray":102,"dodgerblue":75,"firebrick":131,"floralwhite":231,"forestgreen":71,"fuchsia":201,"gainsboro":188,"ghostwhite":231,"gold":220,"goldenrod":179,"gray":145,"green":34,"greenyellow":155,"honeydew":231,"hotpink":212,"indianred":174,"indigo":55,"ivory":231,"khaki":229,"lavender":231,"lavenderblush":231,"lawngreen":118,"lemonchiffon":230,"lightblue":153,"lightcoral":217,"lightcyan":195,"lightgoldenrodyellow":230,"lightgray":188,"lightgreen":157,"lightpink":224,"lightsalmon":216,"lightseagreen":73,"lightskyblue":153,"lightslategray":109,"lightsteelblue":152,"lightyellow":230,"lime":46,"limegreen":77,"linen":231,"magenta":201,"maroon":124,"mediumaquamarine":115,"mediumblue":20,"mediumorchid":176,"mediumpurple":140,"mediumseagreen":78,"mediumslateblue":105,"mediumspringgreen":49,"mediumturquoise":80,"mediumvioletred":163,"midnightblue":18,"mintcream":231,"mistyrose":224,"moccasin":224,"navajowhite":223,"navy":19,"oldlace":231,"olive":142,"olivedrab":107,"orange":214,"orangered":202,"orchid":176,"palegoldenrod":229,"palegreen":157,"paleturquoise":159,"palevioletred":175,"papayawhip":230,"peachpuff":224,"peru":179,"pink":224,"plum":182,"powderblue":153,"purple":127,"red":196,"rosybrown":181,"royalblue":68,"saddlebrown":130,"salmon":216,"sandybrown":216,"seagreen":72,"seashell":231,"sienna":137,"silver":188,"skyblue":153,"slateblue":104,"slategray":109,"snow":231,"springgreen":48,"steelblue":74,"tan":187,"teal":37,"thistle":188,"tomato":209,"turquoise":80,"violet":219,"wheat":224,"white":231,"whitesmoke":231,"yellow":226,"yellowgreen":149}
},{}]},{},[10])(10)
});