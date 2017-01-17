(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.colors = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
module.exports = function () {
	return /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
};

},{}],2:[function(require,module,exports){
"use strict";

const

    O = require ('es7-object-polyfill'),
      
    colorCodes = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', '', 'default'],
    styleCodes = ['', 'bright', 'dim', 'italic', 'underline', '', '', 'inverse'],

    brightCssColors = { black:   [0,     0,   0],
                        red:     [255,  51,   0],
                        green:   [51,  204,  51],
                        yellow:  [255, 153,  51],
                        blue:    [26,  140, 255],
                        magenta: [255,   0, 255],
                        cyan:    [0,   204, 255],
                        white:   [255, 255, 255]    },

    cssColors = {   black:   [0,     0,   0],
                    red:     [204,   0,   0],
                    green:   [0,   204,   0],
                    yellow:  [204, 102,   0],
                    blue:    [0,     0, 255],
                    magenta: [204,   0, 204],
                    cyan:    [0,   153, 255],
                    white:   [255, 255, 255]    },

    types = {   0:  'style',
                2:  'unstyle',
                3:  'color',
                4:  'bgColor',
                10: 'bgColorBright' },

    subtypes = {    color:         colorCodes,
                    bgColor:       colorCodes,
                    bgColorBright: colorCodes,
                    style:         styleCodes,
                    unstyle:       styleCodes    }

class Color {

    constructor (background, name, brightness) {

        this.background = background
        this.name       = name
        this.brightness = brightness
    }

    get inverse () {
        return new Color (!this.background, this.name || (this.background ? 'black' : 'white'), this.brightness) }

    css (inverted, brightness_) {

        const color = inverted ? this.inverse : this

        const brightness = color.brightness || brightness_

        const prop = (color.background ? 'background:' : 'color:'),
              rgb  = ((brightness === Code.bright) ? brightCssColors : cssColors)[color.name]

        return rgb ? (prop + 'rgba(' + [...rgb, (brightness === Code.dim) ? 0.5 : 1].join (',') + ');') : ''
    }
}

class Code {

    constructor (n) {
        if (n !== undefined) { this.value = Number (n) } }

    get type () {
       return types[Math.floor (this.value / 10)] }

    get subtype () {
        return (subtypes[this.type] || [])[this.value % 10] }

    get str () {
        return this.value ? ('\u001b\[' + this.value + 'm') : '' }

    get isBrightness () {
        return (this.value === Code.noBrightness) || (this.value === Code.bright) || (this.value === Code.dim) }
}

Object.assign (Code, {

    bright:       1,
    dim:          2,
    inverse:      7,
    noBrightness: 22,
    noItalic:     23,
    noUnderline:  24,
    noInverse:    27,
    noColor:      39,
    noBgColor:    49
})

const camel = (a, b) => a + b.charAt (0).toUpperCase () + b.slice (1)

class Colors {

    constructor (s) {

        if (s) {

            const r = /\u001b\[(\d+)m/g

            const spans = s.split (/\u001b\[\d+m/)
            const codes = []

            for (let match; match = r.exec (s);) codes.push (match[1])

            this.spans = spans.map ((s, i) => ({ text: s, code: new Code (codes[i]) })) 
        }

        else {
            this.spans = []
        }
    }

    get str () {
        return this.spans.reduce ((str, p, i) => str + p.text + (p.code ? p.code.str : ''), '') }

/*  Arranges colors in stack and reconstructs proper linear form from that stack    */

    get normalized () {

        const stackBgColor    = [new Code (Code.noBgColor)],
              stackBrightness = [new Code (Code.noBrightness)]
        
        const colorStacks = {
                    color: [new Code (Code.noColor)],
                    bgColor: stackBgColor,
                    bgColorBright: stackBgColor },

              styleStacks = {
                    bright: stackBrightness,
                    dim: stackBrightness,
                    underline: [new Code (Code.noUnderline)],
                    inverse: [new Code (Code.noInverse)],
                    italic: [new Code (Code.noItalic)] }

        return O.assign (new Colors (), {

            spans: this.spans.map ((p, i) => {

                switch (p.code.type) {

                    case 'color':
                    case 'bgColor':
                    case 'bgColorBright':

                        const stack = colorStacks[p.code.type]

                        if (p.code.subtype !== 'default') { stack.unshift (p.code) }
                        else { stack.shift (); return O.assign ({}, p, { code: stack[0] }) }
                        break

                    case 'style':

                        styleStacks[p.code.subtype].unshift (p.code)
                        break

                    case 'unstyle':

                        const s = styleStacks[p.code.subtype]
                        s.shift (); return O.assign ({}, p, { code: s[0] })
                        break
                }
                
                return p
            })
        })
    }

    get styledWithCSS () {

        var color      = new Color (),
            bgColor    = new Color (true /* background */),
            brightness = undefined,
            styles     = new Set ()

        return O.assign (new Colors (), {

            spans: this.spans.map (p => { const c = p.code

                const inverted  = styles.has ('inverse'),
                      underline = styles.has ('underline')   ? 'font-style: underline;' : '',                      
                      italic    = styles.has ('italic')      ? 'text-decoration: italic;' : '',
                      bold      = brightness === Code.bright ? 'font-weight: bold;' : ''

                const styledPart = O.assign ({ css: bold + italic + underline +
                                                        color  .css (inverted, brightness) +
                                                        bgColor.css (inverted) }, p)
                if (c.isBrightness) {
                    brightness = c.value }

                else {

                    switch (p.code.type) {

                        case 'color'        : color   = new Color (false, c.subtype);              break
                        case 'bgColor'      : bgColor = new Color (true,  c.subtype);              break
                        case 'bgColorBright': bgColor = new Color (true,  c.subtype, Code.bright); break

                        case 'style'  : styles.add    (c.subtype); break
                        case 'unstyle': styles.delete (c.subtype); break } }

                return styledPart

            }).filter (s => s.text.length > 0)
        })
    }

/*  Outputs with WebInspector-compatible format     */

    get browserConsoleArguments () {

        const spans = this.styledWithCSS.spans

        return [spans.map (p => ('%c' + p.text)).join (''),
             ...spans.map (p => p.css)]
    }

/*  Installs unsafe String extensions   */

    static get nice () {

        const def = k => O.defineProperty (String.prototype, k,  { get: function () { return Colors[k] (this) } })

        colorCodes.forEach ((k, i) => {
            if (!(k in String.prototype)) {
                [                   k,
                 camel ('bg',       k),
                 camel ('bgBright', k)].forEach (def) } })

        styleCodes.forEach ((k, i) => { if (!(k in String.prototype)) def (k) })

        return Colors
    }

/*  Parsing front-end   */

    static parse (s) {
        return new Colors (s).normalized.styledWithCSS
    }

/*  Iteration protocol  */

    [Symbol.iterator] () {
        return this.spans[Symbol.iterator] ()
    }
}

const normalize = s => new Colors (s).normalized.str
const wrap = (open, close) => s => normalize (('\u001b[' + open + 'm') + s + ('\u001b[' + close + 'm'))

colorCodes.forEach ((k, i) => {
    if (k) {
        Colors[k]                     = wrap (30  + i, Code.noColor)
        Colors[camel ('bg',       k)] = wrap (40  + i, Code.noBgColor)
        Colors[camel ('bgBright', k)] = wrap (100 + i, Code.noBgColor) } })

styleCodes.forEach ((k, i) => {
    if (k) {
        Colors[k] = wrap (i, ((k === 'bright') || (k === 'dim')) ? Code.noBrightness : (20 + i)) } })

module.exports = Colors



},{"es7-object-polyfill":3}],3:[function(require,module,exports){
module.exports = (function () {
	"use strict";

	var ownKeys      = require ('reflect.ownkeys')
	var reduce       = Function.bind.call(Function.call, Array.prototype.reduce);
	var isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
	var concat       = Function.bind.call(Function.call, Array.prototype.concat);

	if (!Object.values) {
		 Object.values = function values(O) {
			return reduce(ownKeys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []) } }

	if (!Object.entries) {
		 Object.entries = function entries(O) {
			return reduce(ownKeys(O), (e, k) => concat(e, typeof k === 'string' && isEnumerable(O, k) ? [[k, O[k]]] : []), []) } }

	return Object

}) ();
},{"reflect.ownkeys":6}],4:[function(require,module,exports){
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
},{"_process":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
if (typeof Reflect === 'object' && typeof Reflect.ownKeys === 'function') {
  module.exports = Reflect.ownKeys;
} else if (typeof Object.getOwnPropertySymbols === 'function') {
  module.exports = function Reflect_ownKeys(o) {
    return (
      Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o))
    );
  }
} else {
  module.exports = Object.getOwnPropertyNames;
}

},{}],7:[function(require,module,exports){
'use strict';
var ansiRegex = require('ansi-regex')();

module.exports = function (str) {
	return typeof str === 'string' ? str.replace(ansiRegex, '') : str;
};

},{"ansi-regex":1}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],10:[function(require,module,exports){
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
},{"./support/isBuffer":9,"_process":5,"inherits":8}],11:[function(require,module,exports){
module.exports={
  "name": "color-everywhere",
  "version": "0.1.0",
  "description": "Add colors to text on your terminal. A faster replacement for chalk that also adds 256 color support",
  "main": "dist/color-everywhere-node.js",
  "browser": "dist/color-everywhere.js",
  "dependencies": {},
  "devDependencies": {
    "ansicolor": "^1.0.1",
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
    "grunt-mocha-chai-sinon": "0.0.9",
    "grunt-mocha-test": "0.13.2",
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
  "keywords": [
    "colors",
    "crayon",
    "chalk"
  ],
  "engines": {
    "node": ">=6.9.2"
  },
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/brettz9/chalk256/issues"
  },
  "homepage": "https://github.com/brettz9/chalk256"
}

},{}],12:[function(require,module,exports){
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

},{"./css-to-ansi":14}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

// THEMES


// TEXT MODIFIERS


// MAPS


var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _hasColor = require('has-color');

var _hasColor2 = _interopRequireDefault(_hasColor);

var _stripAnsi = require('strip-ansi');

var _stripAnsi2 = _interopRequireDefault(_stripAnsi);

var _ansicolor = require('ansicolor');

var _ansicolor2 = _interopRequireDefault(_ansicolor);

var _ansi256css = require('./ansi256css');

var _ansi256css2 = _interopRequireDefault(_ansi256css);

var _cssToAnsi = require('./css-to-ansi');

var _cssToAnsi2 = _interopRequireDefault(_cssToAnsi);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

var _genericLogging = require('./themes/generic-logging');

var _genericLogging2 = _interopRequireDefault(_genericLogging);

var _palette = require('./text-modifiers/palette');

var _palette2 = _interopRequireDefault(_palette);

var _trap = require('./text-modifiers/trap');

var _trap2 = _interopRequireDefault(_trap);

var _zalgo = require('./text-modifiers/zalgo');

var _zalgo2 = _interopRequireDefault(_zalgo);

var _america = require('./maps/america');

var _america2 = _interopRequireDefault(_america);

var _rainbow = require('./maps/rainbow');

var _rainbow2 = _interopRequireDefault(_rainbow);

var _rainbowCrayon = require('./maps/rainbowCrayon');

var _rainbowCrayon2 = _interopRequireDefault(_rainbowCrayon);

var _random = require('./maps/random');

var _random2 = _interopRequireDefault(_random);

var _zebra = require('./maps/zebra');

var _zebra2 = _interopRequireDefault(_zebra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var MODES = { NODE: 0, BROWSER: 1 };

var logLevels = ['log', 'info', 'warn', 'error'];

var codes = {};

var basics = {
    reset: [0, 0],
    bold: [1, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    blink: [5, 25],

    // clearscreen: ['2J', 0], // no 'm' at end
    // home: ['H', 0], // no 'm' at end
    // at55: ['10;10H', 0], // no 'm' at end
    blinkrapid: [6, 25],
    hidden: [8, 28],
    dim: [2, 22],
    strikethrough: [9, 29],
    font1: [11, 10],
    font2: [12, 10],
    font3: [13, 10],
    font4: [14, 10],
    font5: [15, 10],
    font6: [16, 10],
    font7: [17, 10],
    font8: [18, 10],
    font9: [19, 10],
    fraktur: [20, 23],
    frame: [51, 54],
    circle: [52, 54],
    overline: [53, 55],
    iunderline: [60, 65],
    idoubleunderline: [61, 65],
    ioverline: [62, 65],
    idoubleoverline: [63, 65],
    istress: [64, 65],

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

function forEachKV(obj, func) {
    Object.keys(obj).forEach(function (key) {
        func(key, obj[key], obj);
    });
}

function setupCodes() {
    forEachKV(basics, function (styleName, _ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            begin = _ref2[0],
            end = _ref2[1];

        codes[styleName] = ['\x1B[' + begin + 'm', '\x1B[' + end + 'm'];
    });

    forEachKV(_cssToAnsi2.default, function (color, code) {
        if (basics[color] != null) {
            color += '_';
        }
        codes[color] = ['\x1B[38;5;' + code + 'm', '\x1B[39m'];
        codes['bg' + color[0].toUpperCase() + color.slice(1).toLowerCase()] = ['\x1B[48;5;' + code + 'm', '\x1B[49m'];
    });

    addColorFuncs(colors, []); // Also relies on codes
}

function sequencer(str, opts, map) {
    var exploded = split(str);
    return exploded.map(function (letter, i, exploded) {
        return map(letter, i, exploded, opts);
    }).join('');
}

function setNewMethod(obj, name, fs) {
    var f = makeStyleFunc(fs);
    delete obj[name];
    obj[name] = f;
    return f;
}

/**
* Adds functions like `.red` to an object
*/
function addColorFuncs(obj, prevStyles) {
    function _setCodeStyleMethod(name, style) {
        Object.defineProperty(obj, name, {
            enumerable: true,
            configurable: true,
            get: function get() {
                var newStyles = [styleFunc.apply(undefined, _toConsumableArray(codes[name]))].concat(prevStyles);
                // Applies the style, `name`, to the colors
                return setNewMethod(obj, name, newStyles);
            }
        });
    };
    forEachKV(codes, _setCodeStyleMethod);

    function _setCodeNumberMethods(_, n) {
        ['' + n, '_' + n].forEach(function (x) {
            Object.defineProperty(obj, x, {
                enumerable: true,
                configurable: true,
                get: function get() {
                    var newStyles = [foregroundCode(n)].concat(prevStyles);
                    // Sets the foreground color of the colors to `n`;
                    return setNewMethod(obj, n, newStyles);
                }
            });
        });
        Object.defineProperty(obj, 'bg' + n, {
            enumerable: true,
            configurable: true,
            get: function get() {
                var newStyles = [backgroundCode(n)].concat(prevStyles);
                // Sets the background color of the colors to `n`
                return setNewMethod(obj, n, newStyles);
            }
        });
    };
    Array(256).fill().forEach(_setCodeNumberMethods);

    function _setGroundingMethods(name, newStyleFuncs) {
        obj[name] = function () {
            return makeStyleFunc(newStyleFuncs.apply(undefined, arguments).concat(prevStyles));
        };
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
    ['color', general.bind(null, obj)]].forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            name = _ref4[0],
            newStyleFuncs = _ref4[1];

        _setGroundingMethods(name, newStyleFuncs);
    });
    obj.fg = obj.foreground;
    obj.bg = obj.background;
    obj._ = obj.colors = obj.color;

    function addProperty(obj, prop, func) {
        Object.defineProperty(obj, prop, {
            enumerable: true,
            configurable: true,
            get: function get() {
                var newStyles = [func].concat(prevStyles);
                // Applies styling to the colors!
                return setNewMethod(obj, prop, newStyles);
            }
        });
    }

    function useString(ret) {
        return Array.isArray(ret) ? lastStringValue : ret;
    }

    forEachKV(colors.themes, function (name, thm) {
        addProperty(obj, name, function (str) {
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            if (Array.isArray(thm)) {
                return thm.reduce(function (out, nme) {
                    return useString(colors[nme](out, opts));
                }, str);
            }
            return useString(colors[thm](str, opts));
        });
    });
    forEachKV(colors.textModifiers, function (name, textMod) {
        addProperty(obj, name, function (str, opts) {
            return useString(textMod(str, opts));
        });
    });
    forEachKV(colors.maps, function (name, map) {
        addProperty(obj, name, function (str, opts) {
            return sequencer(str, opts, function () {
                return useString(map.apply(undefined, arguments));
            });
        });
    });
}

function styleFunc(begin, end) {
    return function (s) {
        return begin + s + end;
    };
}

var lastStringValue = void 0;

/**
* Returns a function that applies a list of styles
* Styles are encoded using an Array of functions
*/
function makeStyleFunc(styles) {
    function f() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var opts = args.slice(-1)[0];
        var hasOpts = opts && (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) === 'object';
        var s = hasOpts ? _util2.default.format.apply(_util2.default, _toConsumableArray(args.slice(0, -1))) : _util2.default.format.apply(_util2.default, args);
        function addStyles(styles, s) {
            return styles.reduce(function (s, style) {
                s = style(s, hasOpts ? opts : { addStyles: addStyles.bind(null, styles.slice(1)) });
                lastStringValue = s;
                return s;
            }, s);
        }
        if (hasOpts) {
            opts.addStyles = addStyles.bind(null, styles.slice(1));
        }
        if (!s && hasOpts) {
            var _ret = function () {
                var oldStyles = styles[0];
                styles[0] = function (s) {
                    return oldStyles(s, opts);
                };
                return {
                    v: f
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
        s = addStyles(styles, s);
        // lastStringValue = s;
        // f.stringValue = s; // Might be useful to expose
        if (colors.getMode() === MODES.NODE) {
            return [s];
        }
        return [].concat(_toConsumableArray(_ansicolor2.default.parse(s).browserConsoleArguments));
    }
    addColorFuncs(f, styles);
    logLevels.forEach(function (level) {
        f[level] = function () {
            var _colors$logger;

            return (_colors$logger = colors.logger)[level].apply(_colors$logger, _toConsumableArray(f(_util2.default.format.apply(_util2.default, arguments))));
        };
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
    var _ref5;

    function split(x) {
        return typeof x === 'string' ? x.split(/\s+/) : [x];
    }
    return (_ref5 = []).concat.apply(_ref5, _toConsumableArray(list.map(function (x) {
        return split(x);
    })));
}

function general(obj) {
    function t(x) {
        if (codes[x] != null) {
            return styleFunc.apply(undefined, _toConsumableArray(codes[x]));
        }
        var s = void 0;
        try {
            s = ansiStyle(x);
        } catch (e) {
            s = x in obj && function (str) {
                obj[x](str);
                return lastStringValue;
            };
        }
        if (s === undefined) {
            throw new Error('Unrecognized style supplied to colors()');
        }
        return s;
    };

    for (var _len2 = arguments.length, styles = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        styles[_key2 - 1] = arguments[_key2];
    }

    return splitFlatten(styles).reverse().map(function (x) {
        return t(x);
    });
}

function split(str) {
    var exploded = [];
    str.replace(/((?:\u001b\[.*?m)*)([^\u001b]*)/g, function (_, n1, n2) {
        if (n1) {
            exploded.push(n1);
        }
        if (n2) {
            exploded = exploded.concat(n2.split(''));
        }
    });
    return exploded;
}

var colors = function colors() {
    for (var _len3 = arguments.length, styles = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        styles[_key3] = arguments[_key3];
    }

    return makeStyleFunc(general.apply(undefined, [colors].concat(styles)));
};

colors.supportsColor = _hasColor2.default;

colors.stripColor = colors.strip = _stripAnsi2.default;

colors.split = split;

var _enabled = void 0;
Object.defineProperty(colors, 'enabled', {
    enumerable: true,
    configurable: true,
    get: function get() {
        return _enabled;
    },
    set: function set(val) {
        _enabled = val;
        setModeByEnabled();
    }
});
colors.enabled = _hasColor2.default;

colors.join = function () {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
    }

    if (colors.getMode() === MODES.NODE) {
        return [args.reduce(function (prev, arg) {
            return prev + (Array.isArray(arg) ? arg[0] : arg);
        }, '')];
    }
    var styleArgs = [];
    return [args.reduce(function (prev, arg) {
        var isArr = Array.isArray(arg);
        if (isArr) {
            styleArgs.push.apply(styleArgs, _toConsumableArray(arg.slice(1)));
        }
        return prev + (isArr ? arg[0] : arg);
    }, '')].concat(styleArgs);
};

if (colors.logger == null) {
    colors.logger = console;
}

logLevels.forEach(function (level) {
    return Object.defineProperty(colors, level, {
        enumerable: true,
        configurable: true,
        get: function get() {
            return function () {
                var _colors$logger2;

                (_colors$logger2 = colors.logger)[level].apply(_colors$logger2, _toConsumableArray(colors.join.apply(colors, arguments)));
            };
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

colors.version = _package2.default.version;
colors.splitFlatten = splitFlatten;

colors.themes = { 'generic-logging': _genericLogging2.default };
colors.textModifiers = { palette: _palette2.default, trap: _trap2.default, zalgo: _zalgo2.default };
colors.maps = { america: _america2.default, rainbow: _rainbow2.default, rainbowCrayon: _rainbowCrayon2.default, random: _random2.default, zebra: _zebra2.default };

// Define `setTheme`, `setMaps`, `setTextModifiers` methods
['theme', 'textModifier', 'map'].forEach(function (type, i, types) {
    var typePlural = type + 's';
    colors['set' + type[0].toUpperCase() + type.slice(1) + (type === 'theme' ? '' : 's')] = function (obj, force) {
        forEachKV(obj, function (key, val) {
            types.forEach(function (typ) {
                var typePlural = typ + 's';
                if ((!force || type !== typ) && key in colors[typePlural]) {
                    throw new Error('The supplied ' + typ + ', ' + key + ', is already present on the `' + typePlural + '` object; please delete first if you wish to replace.');
                }
            });
            colors[typePlural][key] = val;
        });
        addColorFuncs(colors, []);
    };
});

colors.setBasic = function (key, val) {
    if (key && (typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
        return forEachKV(key, colors.setBasic);
    }
    if (!Array.isArray(val) || val.length !== 2) {
        throw new Error('Basic values must be two-item arrays');
    }
    basics[key] = val;
    setupCodes();
};

var mode = void 0;
colors.getMode = function () {
    return mode;
};
function setMode(m) {
    if (!Object.keys(MODES).some(function (name) {
        return m === MODES[name];
    })) {
        throw new Error('Please supply a supported constant MODE value to `setMode`');
    }
    mode = m;
};
function setModeByEnabled() {
    setMode(colors.enabled ? MODES.NODE : MODES.BROWSER);
}
setModeByEnabled();

colors.setMode = setMode;
colors.MODES = MODES;

setupCodes();

exports.default = colors;
module.exports = exports['default'];

},{"../package":11,"./ansi256css":12,"./css-to-ansi":14,"./maps/america":15,"./maps/rainbow":16,"./maps/rainbowCrayon":17,"./maps/random":18,"./maps/zebra":19,"./text-modifiers/palette":20,"./text-modifiers/trap":21,"./text-modifiers/zalgo":22,"./themes/generic-logging":23,"ansicolor":2,"has-color":4,"strip-ansi":7,"util":10}],14:[function(require,module,exports){
module.exports={"aliceblue":231,"antiquewhite":230,"aqua":51,"aquamarine":122,"azure":231,"beige":230,"bisque":224,"black":16,"blanchedalmond":230,"blue":21,"blueviolet":134,"brown":131,"burlywood":187,"cadetblue":109,"chartreuse":118,"chocolate":173,"coral":210,"cornflowerblue":111,"cornsilk":230,"crimson":161,"cyan":51,"darkblue":19,"darkcyan":37,"darkgoldenrod":178,"darkgray":145,"darkgreen":28,"darkkhaki":186,"darkmagenta":127,"darkolivegreen":101,"darkorange":214,"darkorchid":134,"darkred":124,"darksalmon":216,"darkseagreen":151,"darkslateblue":61,"darkslategray":66,"darkturquoise":44,"darkviolet":128,"deeppink":199,"deepskyblue":45,"dimgray":102,"dodgerblue":75,"firebrick":131,"floralwhite":231,"forestgreen":71,"fuchsia":201,"gainsboro":188,"ghostwhite":231,"gold":220,"goldenrod":179,"gray":145,"green":34,"greenyellow":155,"honeydew":231,"hotpink":212,"indianred":174,"indigo":55,"ivory":231,"khaki":229,"lavender":231,"lavenderblush":231,"lawngreen":118,"lemonchiffon":230,"lightblue":153,"lightcoral":217,"lightcyan":195,"lightgoldenrodyellow":230,"lightgray":188,"lightgreen":157,"lightpink":224,"lightsalmon":216,"lightseagreen":73,"lightskyblue":153,"lightslategray":109,"lightsteelblue":152,"lightyellow":230,"lime":46,"limegreen":77,"linen":231,"magenta":201,"maroon":124,"mediumaquamarine":115,"mediumblue":20,"mediumorchid":176,"mediumpurple":140,"mediumseagreen":78,"mediumslateblue":105,"mediumspringgreen":49,"mediumturquoise":80,"mediumvioletred":163,"midnightblue":18,"mintcream":231,"mistyrose":224,"moccasin":224,"navajowhite":223,"navy":19,"oldlace":231,"olive":142,"olivedrab":107,"orange":214,"orangered":202,"orchid":176,"palegoldenrod":229,"palegreen":157,"paleturquoise":159,"palevioletred":175,"papayawhip":230,"peachpuff":224,"peru":179,"pink":224,"plum":182,"powderblue":153,"purple":127,"red":196,"rosybrown":181,"royalblue":68,"saddlebrown":130,"salmon":216,"sandybrown":216,"seagreen":72,"seashell":231,"sienna":137,"silver":188,"skyblue":153,"slateblue":104,"slategray":109,"snow":231,"springgreen":48,"steelblue":74,"tan":187,"teal":37,"thistle":188,"tomato":209,"turquoise":80,"violet":219,"wheat":224,"white":231,"whitesmoke":231,"yellow":226,"yellowgreen":149}
},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (letter, i, exploded) {
    if (letter === ' ') return letter;
    switch (i % 3) {
        case 0:
            return _colorEverywhere2.default.red(letter);
        case 1:
            return _colorEverywhere2.default.white(letter);
        case 2:
            return _colorEverywhere2.default.blue(letter);
    }
};

var _colorEverywhere = require('../color-everywhere');

var _colorEverywhere2 = _interopRequireDefault(_colorEverywhere);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
module.exports = exports['default'];

},{"../color-everywhere":13}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (letter, i, exploded) {
    if (letter === ' ') {
        return letter;
    }
    return _colorEverywhere2.default[rainbowColors[i++ % rainbowColors.length]](letter);
};

var _colorEverywhere = require('../color-everywhere');

var _colorEverywhere2 = _interopRequireDefault(_colorEverywhere);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta']; // RoY G BiV
;
module.exports = exports['default'];

},{"../color-everywhere":13}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _colorEverywhere = require('../color-everywhere');

var _colorEverywhere2 = _interopRequireDefault(_colorEverywhere);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VERY_DARK_COLORS = [0, 16, 17, 18, 232, 233, 234, 235];

exports.default = function (letter, i, exploded) {
    return (0, _colorEverywhere2.default)(i * 19 % 256 + 12 * VERY_DARK_COLORS.includes(i))(letter);
};

module.exports = exports['default'];

},{"../color-everywhere":13}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (letter, i, exploded) {
    return letter === ' ' ? letter : _colorEverywhere2.default[available[Math.round(Math.random() * (available.length - 1))]](letter);
};

var _colorEverywhere = require('../color-everywhere');

var _colorEverywhere2 = _interopRequireDefault(_colorEverywhere);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green', 'blue', 'white', 'cyan', 'magenta'];
;
module.exports = exports['default'];

},{"../color-everywhere":13}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (letter, i, exploded) {
    return i % 2 === 0 ? letter : _colorEverywhere2.default.inverse(letter);
};

var _colorEverywhere = require('../color-everywhere');

var _colorEverywhere2 = _interopRequireDefault(_colorEverywhere);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
module.exports = exports['default'];

},{"../color-everywhere":13}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (text, options) {
    return _colorEverywhere2.default.inverse(arr256.map(function (_, i) {
        return (0, _colorEverywhere2.default)(i)('  ' + (VERY_DARK_COLORS.includes(i) ? _colorEverywhere2.default.bgWhite(i) : i) + '  ');
    }).join(''));
};

var _colorEverywhere = require('../color-everywhere');

var _colorEverywhere2 = _interopRequireDefault(_colorEverywhere);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
* Displays all the colors
*/
var VERY_DARK_COLORS = [0, 16, 17, 18, 232, 233, 234, 235];
var arr256 = Array(256).fill();

;
module.exports = exports['default'];

},{"../color-everywhere":13}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (text, options) {
    var result = '';
    text = text || 'Run the trap, drop the bass';
    text = text.split('');

    text.forEach(function (c) {
        c = c.toLowerCase();
        var chars = trap[c] || [' '];
        var rand = Math.floor(Math.random() * chars.length);
        if (typeof trap[c] !== 'undefined') {
            result += trap[c][rand];
        } else {
            result += c;
        }
    });
    return result;
};

var trap = {
    a: ['@', '\u0104', '\u023A', '\u0245', '\u0394', '\u039B', '\u0414'],
    b: ['\xDF', '\u0181', '\u0243', '\u026E', '\u03B2', '\u0E3F'],
    c: ['\xA9', '\u023B', '\u03FE'],
    d: ['\xD0', '\u018A', '\u0500', '\u0501', '\u0502', '\u0503'],
    e: ['\xCB', '\u0115', '\u018E', '\u0258', '\u03A3', '\u03BE', '\u04BC', '\u0A6C'],
    f: ['\u04FA'],
    g: ['\u0262'],
    h: ['\u0126', '\u0195', '\u04A2', '\u04BA', '\u04C7', '\u050A'],
    i: ['\u0F0F'],
    j: ['\u0134'],
    k: ['\u0138', '\u04A0', '\u04C3', '\u051E'],
    l: ['\u0139'],
    m: ['\u028D', '\u04CD', '\u04CE', '\u0520', '\u0521', '\u0D69'],
    n: ['\xD1', '\u014B', '\u019D', '\u0376', '\u03A0', '\u048A'],
    o: ['\xD8', '\xF5', '\xF8', '\u01FE', '\u0298', '\u047A', '\u05DD', '\u06DD', '\u0E4F'],
    p: ['\u01F7', '\u048E'],
    q: ['\u09CD'],
    r: ['\xAE', '\u01A6', '\u0210', '\u024C', '\u0280', '\u042F'],
    s: ['\xA7', '\u03DE', '\u03DF', '\u03E8'],
    t: ['\u0141', '\u0166', '\u0373'],
    u: ['\u01B1', '\u054D'],
    v: ['\u05D8'],
    w: ['\u0428', '\u0460', '\u047C', '\u0D70'],
    x: ['\u04B2', '\u04FE', '\u04FC', '\u04FD'],
    y: ['\xA5', '\u04B0', '\u04CB'],
    z: ['\u01B5', '\u0240']
};

;
module.exports = exports['default'];

},{}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (text, options) {
    text = text || '   he is here   ';

    var soul = {
        up: ['̍', '̎', '̄', '̅', '̿', '̑', '̆', '̐', '͒', '͗', '͑', '̇', '̈', '̊', '͂', '̓', '̈', '͊', '͋', '͌', '̃', '̂', '̌', '͐', '̀', '́', '̋', '̏', '̒', '̓', '̔', '̽', '̉', 'ͣ', 'ͤ', 'ͥ', 'ͦ', 'ͧ', 'ͨ', 'ͩ', 'ͪ', 'ͫ', 'ͬ', 'ͭ', 'ͮ', 'ͯ', '̾', '͛', '͆', '̚'],
        down: ['̖', '̗', '̘', '̙', '̜', '̝', '̞', '̟', '̠', '̤', '̥', '̦', '̩', '̪', '̫', '̬', '̭', '̮', '̯', '̰', '̱', '̲', '̳', '̹', '̺', '̻', '̼', 'ͅ', '͇', '͈', '͉', '͍', '͎', '͓', '͔', '͕', '͖', '͙', '͚', '̣'],
        mid: ['̕', '̛', '̀', '́', '͘', '̡', '̢', '̧', '̨', '̴', '̵', '̶', '͜', '͝', '͞', '͟', '͠', '͢', '̸', '̷', '͡', ' ҉']
    };
    var all = [].concat(soul.up, soul.down, soul.mid);

    function randomNumber(range) {
        return Math.floor(Math.random() * range);
    }

    function isChar(chr) {
        return all.some(function (c) {
            return c === chr;
        });
    }

    function heComes(text, options) {
        var result = '';

        options = options || {};
        options.up = typeof options.up !== 'undefined' ? options.up : true;
        options.mid = typeof options.mid !== 'undefined' ? options.mid : true;
        options.down = typeof options.down !== 'undefined' ? options.down : true;
        options.size = typeof options.size !== 'undefined' ? options.size : 'maxi';

        text = text.split('');

        text.forEach(function (l) {
            if (isChar(l)) {
                return;
            }
            result += l;
            var counts = { up: 0, down: 0, mid: 0 };
            switch (options.size) {
                case 'mini':
                    counts.up = randomNumber(8);
                    counts.mid = randomNumber(2);
                    counts.down = randomNumber(8);
                    break;
                case 'maxi':
                    counts.up = randomNumber(16) + 3;
                    counts.mid = randomNumber(4) + 1;
                    counts.down = randomNumber(64) + 3;
                    break;
                default:
                    counts.up = randomNumber(8) + 1;
                    counts.mid = randomNumber(6) / 2;
                    counts.down = randomNumber(8) + 1;
                    break;
            }

            ['up', 'mid', 'down'].forEach(function (index) {
                for (var i = 0; i <= counts[index]; i++) {
                    if (options[index]) {
                        result = result + soul[index][randomNumber(soul[index].length)];
                    }
                }
            });
        });
        return result;
    }

    // don't summon him
    return heComes(text, options);
};

;
module.exports = exports['default'];

},{}],23:[function(require,module,exports){
module.exports={
    "silly": "rainbow",
    "input": "grey",
    "verbose": "cyan",
    "prompt": "grey",
    "info": "green",
    "data": "grey",
    "help": "cyan",
    "warn": "yellow",
    "debug": "blue",
    "error": "red"
}

},{}]},{},[13])(13)
});