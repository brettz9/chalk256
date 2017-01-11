import util from 'util';
import hasColor from 'has-color';
import stripAnsi from 'strip-ansi';
import ansi256css from './ansi256css';
import cssToAnsi from './css-to-ansi';
import pkg from '../package';

const logLevels = ['log', 'info', 'warn', 'error'];
const VERY_DARK_COLORS = [0, 16, 17, 18, 232, 233, 234, 235];

const codes = {};

const basics = {
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

Object.keys(basics).forEach((styleName) => {
    const [begin, end] = basics[styleName];
    codes[styleName] = ['\u001b[' + begin + 'm', '\u001b[' + end + 'm'];
});

Object.keys(cssToAnsi).forEach((color) => {
    const code = cssToAnsi[color];
    if (basics[color] != null) {
        color += '_';
    }
    codes[color] = ['\u001b[38;5;' + code + 'm', '\u001b[39m'];
    codes['bg' + color[0].toUpperCase() + color.slice(1).toLowerCase()] = ['\u001b[48;5;' + code + 'm', '\u001b[49m'];
});

function _rainbow (s) {
    return stripAnsi(s).split('').map((c, i) => {
        return colors(i * 19 % 256 + 12 * (VERY_DARK_COLORS.includes(i)))(c);
    }).join('');
}

/**
* Adds functions like `.red` to an object
*/
function addColorFuncs (obj, prevStyles) {
    function _fn (name, style) {
        return Object.defineProperty(obj, name, {
            enumerable: true,
            configurable: true,
            get: function () {
                const newStyles = [styleFunc(...codes[name])].concat(prevStyles);
                // Applies the style, `name`, to the colors
                const f = makeStyleFunc(newStyles);
                delete obj[name];
                obj[name] = f;
                return f;
            }
        });
    };
    Object.keys(codes).forEach((name) => {
        const style = codes[name];
        _fn(name, style);
    });
    function _fn1 (n) {
        ['' + n, '_' + n].forEach(function (x) {
            Object.defineProperty(obj, x, {
                enumerable: true,
                configurable: true,
                get: function () {
                    const newStyles = [foregroundCode(n)].concat(prevStyles);
                    // Sets the foreground color of the colors to `n`;
                    const f = makeStyleFunc(newStyles);
                    delete obj[n];
                    obj[n] = f;
                    return f;
                }
            });
        });
        return Object.defineProperty(obj, 'bg' + n, {
            enumerable: true,
            configurable: true,
            get: function () {
                const newStyles = [backgroundCode(n)].concat(prevStyles);
                // Sets the background color of the colors to `n`
                const f = makeStyleFunc(newStyles);
                delete obj[n];
                obj[n] = f;
                return f;
            }
        });
    };
    Array(256).fill().forEach(_fn1);

    function _fn2 (name, newStyleFunc) {
        const f = obj[name] = (...desc) => {
            return makeStyleFunc(newStyleFunc(...desc).concat(prevStyles));
        };
        return f;
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
        ['color', general]
    ].forEach(([name, newStyleFunc]) => {
        _fn2(name, newStyleFunc);
    });
    obj.fg = obj.foreground;
    obj.bg = obj.background;
    obj._ = obj.color;
    Object.defineProperty(obj, 'rainbow', {
        enumerable: true,
        configurable: true,
        get: function () {
            const newStyles = [_rainbow].concat(prevStyles);
            // Applies rainbow styling to the colors!
            const f = makeStyleFunc(newStyles);
            delete obj.rainbow;
            obj.rainbow = f;
            return f;
        }
    });
}

function styleFunc (begin, end) {
    return (s) => begin + s + end;
}

/**
* Returns a function that applies a list of styles
* Styles are encoded using an Array of functions
*/
function makeStyleFunc (styles) {
    function f (...args) {
        let s = util.format(...args);
        if (colors.enabled) {
            styles.forEach((style) => {
                s = style(s);
            });
        }
        return s;
    }
    addColorFuncs(f, styles);
    logLevels.forEach(function (level) {
        const func = f[level] = (...args) => colors.logger[level](
            f(util.format(...args))
        );
        return func;
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

function general (...styles) {
    function t (x) {
        if (codes[x] != null) {
            return styleFunc(...codes[x]);
        }
        return ansiStyle(x);
    };
    return splitFlatten(styles).reverse().map((x) => t(x));
}

const colors = (...styles) => makeStyleFunc(general(...styles));

addColorFuncs(colors, []);

colors.supportsColor = hasColor;

colors.stripColor = stripAnsi;

if (colors.enabled == null) {
    colors.enabled = hasColor;
}

if (colors.logger == null) {
    colors.logger = console;
}

logLevels.forEach(function (level) {
    return Object.defineProperty(colors, level, {
        enumerable: true,
        configurable: true,
        get: function () {
            return colors.logger[level];
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

/**
* Displays all the colors
*/
colors.palette = () => colors.log(colors.inverse((
    Array(256).fill().map((_, i) => {
        return colors(i)('  ' + (VERY_DARK_COLORS.includes(i) ? colors.bgWhite(i) : i) + '  ');
    }).join('')
)));

colors.version = pkg.version;
colors.splitFlatten = splitFlatten;

export default colors;
