import util from 'util';
import hasColor from 'has-color';
import stripAnsi from 'strip-ansi';
import ansicolor from 'ansicolor';
import ansi256css from './ansi256css';
import cssToAnsi from './css-to-ansi';
import pkg from '../package';

// THEMES
import genericLogging from './themes/generic-logging';

// TEXT MODIFIERS
import palette from './text-modifiers/palette';
import trap from './text-modifiers/trap';
import zalgo from './text-modifiers/zalgo';

// MAPS
import america from './maps/america';
import rainbow from './maps/rainbow';
import rainbowCrayon from './maps/rainbowCrayon';
import random from './maps/random';
import zebra from './maps/zebra';

const MODES = {NODE: 0, BROWSER: 1};

const logLevels = ['log', 'info', 'warn', 'error'];

const codes = {};

const basics = {
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

function forEachKV (obj, func) {
    Object.entries(obj).forEach(([key, val]) => {
        func(key, val, obj);
    });
}

function setupCodes () {
    forEachKV(basics, (styleName, [begin, end]) => {
        codes[styleName] = ['\u001b[' + begin + 'm', '\u001b[' + end + 'm'];
    });

    forEachKV(cssToAnsi, (color, code) => {
        if (basics[color] != null) {
            color += '_';
        }
        codes[color] = ['\u001b[38;5;' + code + 'm', '\u001b[39m'];
        codes['bg' + color[0].toUpperCase() + color.slice(1).toLowerCase()] = ['\u001b[48;5;' + code + 'm', '\u001b[49m'];
    });

    addColorFuncs(colors, []); // Also relies on codes
}

function sequencer (str, opts, map) {
    const exploded = split(str);
    return exploded.map((letter, i, exploded) => map(letter, i, exploded, opts)).join('');
}

function setNewMethod (obj, name, fs) {
    const f = makeStyleFunc(fs);
    delete obj[name];
    obj[name] = f;
    return f;
}

/**
* Adds functions like `.red` to an object
*/
function addColorFuncs (obj, prevStyles) {
    function _setCodeStyleMethod (name, style) {
        Object.defineProperty(obj, name, {
            enumerable: true,
            configurable: true,
            get: function () {
                const newStyles = [styleFunc(...codes[name])].concat(prevStyles);
                // Applies the style, `name`, to the colors
                return setNewMethod(obj, name, newStyles);
            }
        });
    };
    forEachKV(codes, _setCodeStyleMethod);

    function _setCodeNumberMethods (_, n) {
        ['' + n, '_' + n].forEach(function (x) {
            Object.defineProperty(obj, x, {
                enumerable: true,
                configurable: true,
                get: function () {
                    const newStyles = [foregroundCode(n)].concat(prevStyles);
                    // Sets the foreground color of the colors to `n`;
                    return setNewMethod(obj, n, newStyles);
                }
            });
        });
        Object.defineProperty(obj, 'bg' + n, {
            enumerable: true,
            configurable: true,
            get: function () {
                const newStyles = [backgroundCode(n)].concat(prevStyles);
                // Sets the background color of the colors to `n`
                return setNewMethod(obj, n, newStyles);
            }
        });
    };
    Array(256).fill().forEach(_setCodeNumberMethods);

    function _setGroundingMethods (name, newStyleFuncs) {
        obj[name] = (...desc) => {
            return makeStyleFunc(newStyleFuncs(...desc).concat(prevStyles));
        };
    }

    [
        // Sets the foreground color for the colors
        ['foreground', (x) => [foregroundCode(getColorNumber(x))]],
        // Sets the background color for the colors
        ['background', (x) => [backgroundCode(getColorNumber(x))]],
        // Takes two arguments -- a foreground color and a background color -- and applies those styles to the colors
        ['fgbg', (fg, bg) => [
            foregroundCode(getColorNumber(fg)), backgroundCode(getColorNumber(bg))]
        ],
        // Applies any styles and colors you pass in; accepts multiple arguments
        ['color', general.bind(null, obj)]
    ].forEach(([name, newStyleFuncs]) => {
        _setGroundingMethods(name, newStyleFuncs);
    });
    obj.fg = obj.foreground;
    obj.bg = obj.background;
    obj._ = obj.colors = obj.color;

    function addProperty (obj, prop, func) {
        Object.defineProperty(obj, prop, {
            enumerable: true,
            configurable: true,
            get: function () {
                const newStyles = [func].concat(prevStyles);
                // Applies styling to the colors!
                return setNewMethod(obj, prop, newStyles);
            }
        });
    }

    function useString (ret) {
        return Array.isArray(ret) ? lastStringValue : ret;
    }

    forEachKV(colors.themes, (name, thm) => {
        addProperty(obj, name, (str, opts = {}) => {
            if (Array.isArray(thm)) {
                return thm.reduce((out, nme) => useString(colors[nme](out, opts)), str);
            }
            return useString(colors[thm](str, opts));
        });
    });
    forEachKV(colors.textModifiers, (name, textMod) => {
        addProperty(obj, name, (str, opts) => useString(textMod(str, opts)));
    });
    forEachKV(colors.maps, (name, map) => {
        addProperty(obj, name, (str, opts) => sequencer(str, opts, (...args) => useString(map(...args))));
    });
}

function styleFunc (begin, end) {
    return (s) => begin + s + end;
}

let lastStringValue;

/**
* Returns a function that applies a list of styles
* Styles are encoded using an Array of functions
*/
function makeStyleFunc (styles) {
    function f (...args) {
        const opts = args.slice(-1)[0];
        const hasOpts = opts && typeof opts === 'object';
        let s = hasOpts ? util.format(...args.slice(0, -1)) : util.format(...args);
        function addStyles (styles, s) {
            return styles.reduce((s, style) => {
                s = style(s, hasOpts ? opts : {addStyles: addStyles.bind(null, styles.slice(1))});
                lastStringValue = s;
                return s;
            }, s);
        }
        if (hasOpts) {
            opts.addStyles = addStyles.bind(null, styles.slice(1));
        }
        if (!s && hasOpts) {
            const oldStyles = styles[0];
            styles[0] = (s) => oldStyles(s, opts);
            return f;
        }
        s = addStyles(styles, s);
        // lastStringValue = s;
        // f.stringValue = s; // Might be useful to expose
        return colors.getMode() === MODES.NODE
            ? [s]
            : [...ansicolor.parse(s).browserConsoleArguments];
    }
    addColorFuncs(f, styles);
    logLevels.forEach(function (level) {
        f[level] = (...args) => colors.logger[level](
            ...f(util.format(...args))
        );
    });
    return f;
}

function getColorNumber (desc) {
    const num = ansi256css(desc);
    if (num == null) {
        throw new Error("Don't understand the color '" + desc + "'");
    }
    return num;
}

function foregroundCode (number) {
    return styleFunc('\u001b[38;5;' + number + 'm', '\u001b[39m');
}

function backgroundCode (number) {
    return styleFunc('\u001b[48;5;' + number + 'm', '\u001b[49m');
}

function ansiStyle (desc) {
    const re = /^(bg|background):?/i;
    if (!re.test(desc)) {
        return foregroundCode(getColorNumber(desc));
    }
    return backgroundCode(getColorNumber(desc.replace(re, '')));
}

/**
* Turns something like ['red blue', 'white'] into ['red', 'blue', 'white']
*/
function splitFlatten (list) {
    function split (x) {
        return typeof x === 'string' ? x.split(/\s+/) : [x];
    }
    return [].concat(...list.map((x) => split(x)));
}

function general (obj, ...styles) {
    function t (x) {
        if (codes[x] != null) {
            return styleFunc(...codes[x]);
        }
        let s;
        try {
            s = ansiStyle(x);
        } catch (e) {
            s = x in obj && ((str) => {
                obj[x](str);
                return lastStringValue;
            });
        }
        if (s === undefined) {
            throw new Error('Unrecognized style supplied to colors()');
        }
        return s;
    };
    return splitFlatten(styles).reverse().map((x) => t(x));
}

function split (str) {
    let exploded = [];
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

const colors = (...styles) => makeStyleFunc(general(colors, ...styles));

colors.supportsColor = hasColor;

colors.stripColor = colors.strip = stripAnsi;

colors.split = split;

let _enabled;
Object.defineProperty(colors, 'enabled', {
    enumerable: true,
    configurable: true,
    get: function () {
        return _enabled;
    },
    set: function (val) {
        _enabled = val;
        setModeByEnabled();
    }
});
colors.enabled = hasColor;

colors.join = (...args) => {
    if (colors.getMode() === MODES.NODE) {
        return [args.reduce((prev, arg) => prev + (Array.isArray(arg) ? arg[0] : arg), '')];
    }
    const styleArgs = [];
    return [args.reduce((prev, arg) => {
        const isArr = Array.isArray(arg);
        if (isArr) {
            styleArgs.push(...arg.slice(1));
        }
        return prev + (isArr ? arg[0] : arg);
    }, ''), ...styleArgs];
};

if (colors.logger == null) {
    colors.logger = console;
}

logLevels.forEach(function (level) {
    return Object.defineProperty(colors, level, {
        enumerable: true,
        configurable: true,
        get: function () {
            return (...args) => {
                colors.logger[level](
                    ...colors.join(...args)
                );
            };
        }
    });
});

Object.defineProperty(colors, 'success', {
    enumerable: true,
    configurable: true,
    get: function () {
        return (colors.logger && colors.logger.success) || function (...args) {
            return colors.green.log(...args);
        };
    }
});

colors.version = pkg.version;
colors.splitFlatten = splitFlatten;

colors.themes = {'generic-logging': genericLogging};
colors.textModifiers = {palette, trap, zalgo};
colors.maps = {america, rainbow, rainbowCrayon, random, zebra};

// Define `setTheme`, `setMaps`, `setTextModifiers` methods
['theme', 'textModifier', 'map'].forEach((type, i, types) => {
    const typePlural = type + 's';
    colors['set' + type[0].toUpperCase() + type.slice(1) + (type === 'theme' ? '' : 's')] = function (obj, force) {
        forEachKV(obj, (key, val) => {
            types.forEach((typ) => {
                const typePlural = typ + 's';
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
    if (key && typeof key === 'object') {
        return forEachKV(key, colors.setBasic);
    }
    if (!Array.isArray(val) || val.length !== 2) {
        throw new Error('Basic values must be two-item arrays');
    }
    basics[key] = val;
    setupCodes();
};

let mode;
colors.getMode = () => mode;
function setMode (m) {
    if (!Object.values(MODES).some((val) => m === val)) {
        throw new Error('Please supply a supported constant MODE value to `setMode`');
    }
    mode = m;
};
function setModeByEnabled () {
    setMode(colors.enabled ? MODES.NODE : MODES.BROWSER);
}
setModeByEnabled();

colors.setMode = setMode;
colors.MODES = MODES;

setupCodes();

export default colors;
