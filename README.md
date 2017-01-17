# color-everywhere

As with [crayon](https://github.com/ccheever/chalk256),
`color-everywhere` builds on [chalk](https://github.com/sindresorhus/chalk) and
[colors](https://github.com/marak/colors.js/) to
provide a clean and flexible way to use ANSI colors on your
terminal and supports 256 colors, a clean and chainable
API, a few other nifty features, and built-in logging.

Besides being rewritten in ES6, `color-everywhere`
offers the added feature (courtesy of [ansicolor](https://github.com/xpl/ansicolor))
that logging in the browser will preserve styling
as possible (rather than stripping the styling).

This change is not breaking if you use the provided logging methods, but
necessarily breaks if you are trying to supply the values to `console.log`
which expects a single ANSI-color coded argument in Node and
[two arguments](https://developer.mozilla.org/en-US/docs/Web/API/console#Styling_console_output)
in the browser.

## Usage

```js
import colors from 'color-everywhere';

// Log a string
colors.red.log('This is red');

// Style a string
console.log(colors.blue('Hello world!'))

// Use any CSS color name
colors.olivedrab.bgOldlace.info("cute");

// Use hex colors
colors("#ffcc00").log("old gold");

// Use ANSI color codes
colors(100).log("look at me");

// Combine styled and normal strings
console.log(
    colors.blue('Hello'), 'World' + colors.red('!')
);

// Compose multiple styles using the chainable API
console.log(
    colors.blue.bgRed.bold('Hello world!')
);

// Or just compose styles by passing strings to the colors function
colors('red bgblue').log('this is red on a blue background');

// Nest styles
console.log(
      colors.red('Hello', colors.underline.bgBlue('world') + '!')
);

// Pass in multiple arguments
colors.blue.info('Hello', 'World!', 'Foo', 'bar', 'biz', 'baz');

// Specify multiple styles
colors("goldenrod", "bg:blue", "inverse").underline.log("Hi!");

// Specify foreground and background colors
colors.foreground("#ffffff").background("crimson").log("school!");
colors.fg("navy").bg("#ffcc00").log("spirit!");
colors.fgbg("white", "red").underline.error("whew");
colors.red._("background:goldenrod").inverse.log("goldenrod on red");

// Specify a custom logger
import npmlog from 'npmlog';
colors.logger = npmlog;
```

For color descriptions passed to functions, you can use any of the following:

- The name of any CSS color (case-insensitive)
- Any hex color (case-insensitive, leading '#' is optional)
- Any ANSI color code 0-255 as a Number

## Other methods

The API mostly follows that of [crayon](https://github.com/ccheever/chalk256)
but with the following additions.

### colors.join(...args)

While one may supply a chain of (spread) `colors` results to `console.log`
as in the following:

```js
console.log(
    ...colors.green('Hello'), 'good', ...colors.yellow('World!')
);
```

...this introduces a space between the items.

One can join different `colors` results without a need for spreading the
*individual* arguments and without *automatically* introducing spaces
between arguments by using the root `colors.join()` method:

```js
console.log(
    ...colors.join(colors.green('Hello'), ' good ', colors.yellow('World!'))
);
```

The built-in `colors` root logging methods can be used as syntactic sugar
for the above (noting though that these logging methods therefore cannot
follow `util.format` processing):

```js
colors.log(
    colors.green('Hello'), ' good ', colors.yellow('World!')
)
```

### colors.setMode() (and `getMode` and `MODES` constants)

The default mode simply looks to the auto-determined
`colors.enabled` property to determine whether the
mode ought to be treated as being in Node or the browser.

Use this method to manually set the desired mode.

Returns one of the following constants:

```js
colors.MODES.NODE = 0;
colors.MODES.BROWSER = 1;
```

`colors.getMode()` will return the mode currently in use.

If you wish to support another mode, first add it to
`colors.MODES`.

## colors.split(str)

Split into letters and ANSI escape sequences. This can be used
within text modifiers (and is used internally by maps).

### Customization

Themes, text modifiers, and maps allow for semantic expression
of one's logging purposes as well as convenience.

#### colors.setTheme({themeName: stringOrArrayOfAliasedMethods})

```js
colors.setTheme({
  serious: ['red', 'underline'],
  alert: 'red'
});
```

One can then use the methods directly on the `colors` object:

```js
colors.serious.log('Some text');
colors.alert.log('Some text');
```

One theme (from `colors`) comes built in with default colors for
common use case semantic names ("silly", "input", "verbose",
"prompt", "info", "data", "help", "warn", "debug", "error"):

If you wish to define your own versions of these, you will need
to add a second argument of `true` when defining a theme to
allow overwriting.

Note that text modifiers and maps can also be supplied as
theme arguments, with the array form allowing these modifiers
to be combined with themselves and/or with built-in methods.

```js
colors.setTheme({
  serious: ['red', 'myMap', 'underline', 'myTextModifier'],
});
```

This form will not allow passing of distinct options, though
it can be supplied a shared config object (but be wary of
name conflicts):

```js
colors.serious({
    defaultColor: 'blue', // Modifiers and maps might use this to reapply
    // colors, overcoming the current limitation that intervening style escape
    // sequences can cause the original style to be lost
    myMapConfig: true,
    myTextModifierConfig: true
}).log('Testing!');
```

#### colors.setTextModifiers({modifierName: function (text, options) {return modifiedText;}})

Text modifiers are functions which become accessible on the
`colors` object and which can modify the whole string.

They should return the modified string. They can also
return the result of internal methods which return an
array depending on mode (or use the `getMode` method
and MODE constants to return an appropriate array
themselves).

```js
function snake (text, options) {
    return text.split('').map((letter, i, exploded) => {
        const prevChar = exploded[i - 1];
        if (letter === 's' && (!prevChar || prevChar === ' ')) {
            return 'sss';
        }
        return letter;
    }).join('');
}
colors.setTextModifiers({snake});
```

One can then use the methods directly on the `colors` object:

```js
colors.snake.log('Lots of lists and series'); // "Lots of lists and ssseries"
```

Two modifiers come built in (from `colors`), `trap` and `zalgo`,
and one is adapted from `crayon`, `palette` (though the latter
differs in not using any text parameters but printing out
all colors).

Modifiers can be supplied an options object which they may use
to tweak behavior:

```js
console.log(
    colors.snake('Lots of lists and series', {someConfig: true})
);
colors.snake({someConfig: true}).log('Lots of lists and series');
```

If you wish to define your own versions of these, you will need
to add a second argument of `true` when defining a modifier to
allow overwriting.

One property, `addStyles` is added to the passed options object
(or an object is created if none is present) to allow modifiers
the ability to apply already-added styles internally (but this
may provide some unexpected recursion).

#### colors.setMaps({mapName: function (letter, i, exploded, options) {return modifiedColors;}})

Maps are effectively text modifiers, but which modify at the level
of the individual letter. They also provide built-in splitting
into whole ANSI escape sequences (where present) as well as letters.

```js
function emphasizePlurals (letterOrEscapeSeq, i, exploded) {
    const nextChar = exploded[i + 1];
    if (letterOrEscapeSeq === 's' && (!nextChar || nextChar === ' ')) {
        return colors.red('sss');
    }
    return letterOrEscapeSeq;
}
colors.setMaps({emphasizePlurals});
```

One can then use the methods directly on the `colors` object:

```js
colors.emphasizePlurals.log('Lots of lists and series'); // "Lotsss of listsss and seriesss" (with the final s' in red)
```

Maps can be supplied an options object which they may use
to tweak behavior:

```js
console.log(
    colors.emphasizePlurals('Lots of lists and series', {someConfig: true})
);
colors.emphasizePlurals({someConfig: true}).log('Lots of lists and series');
```

The following maps come built in (from `colors`), `america`,
`rainbow`, `random`, and `zebra`. `rainbowCrayon` exposes
the `rainbow` implementation of `crayon`.

If you wish to define your own versions of these, you will need
to add a second argument of `true` when defining a map to
allow overwriting.

See text modifiers regarding `addStyles` being available on the
options object passed into maps.

#### colors.setBasic(key, [startCode, endCode])

Set a key to a color or style name and the value
to a two-item array indicating the (numeric) code
for beginning and ending a styled sequence, respectively.

Alternatively a single argument object can be supplied
whose keys are the basic key and whose values are the
two-item array of codes.

## Other methods present in `colors` but not documented in `crayon`

- `supportsColor`
- `stripColor` (`strip` was not present at all, but now added)
- `rainbow`

And the following property:
- `enabled` - By default switches to Node mode and to browser mode otherwise;
    note that changes to `enabled` status will also invoke `setMode`.

## Other methods not in `colors` and not documented on `crayon`

Note that `crayon` also has its own undocumented methods
which we have preserved without change:

- `splitFlatten` - Utility to turns something like `['red blue', 'white']`
    into `['red', 'blue', 'white']`
- `success` - Looks for `success` on the `logger` object; if not present,
    logs in green
- Numeric methods (256) - Accessed such as `colors[23]`

`crayon` also had the following undocumented methods
which we have adapted:

- `palette` - Returns all 256 colors (in `crayon` had immediately logged the
    palette)
- `colors.log/info/warn/error` - Previously logged with `util.format` on
    arguments; now performs log of `colors.join()` on them. We still do
    `util.format` processing on arguments to the chained logging methods,
    however, e.g., to `colors.red.log(...args)`.

And the following property:
- `version` - The version of this package

## Notes

- Depending on your settings, there may be a difference between the system
    red color and the color most closely matching the CSS color red. In the
    case of color name collisions, `colors.red` will give you the system
    color and `colors.red_` will give you the CSS color.
- For functions that aren't specific about whether they take a foreground
    or a background argument, you can pass `bg:<color>` or
    `background: <color>` or `bg<Color>` or similar, etc. to change the
    background color.
- The reason that this module is much faster than chalk is that chalk remakes
    the style functions each time you call them whereas `color-everywhere`
    keeps them around if you reuse them.

## API items still not ported from original `colors` API:

1. We don't export `styles` or `stylize` (our `codes` object handles instead)
2. For themes, while we do package the `generic-logging` theme and `setTheme`
    does allow objects as arguments, we do not do dynamic requiring, so you
    will have to import any other themes yourself and pass their objects to
    `setTheme`).

## API changes since fork from `crayon`

1. Added `setTheme` method and `themes` property (as in `colors`)
2. Added `setMaps` method and `maps` property (to replicate
    functionality in `colors` but also allow expansion)
3. Added `setTextModifiers` method and `textModifiers` property
    (to replicate `custom` functionality in `colors` but also allow expansion)
4. Added `setBasic` method to allow customization
5. Added `setMode` method (and `getMode` and `MODES` constants) for manual
    control of mode, potentially independent of `enabled` status
6. Added an alias `strip` for `stripColor` (as in `colors`) and an alias
    for the version of `colors` used in the middle of the chain (`_`/`color`)
    as `colors`
7. Added a `split` method for splitting a string into letters and escape sequences
8. Changed logger methods (on the root object only) not to use
    `util.format` and instead perform a logged spread of `colors.join()`
    on the supplied arguments
9. Changed `crayon` (or `color`/`_`) color-parsing function to allow
    theme, text modifier, and map names
10. Changed default `rainbow` implementation to that of the more popular
    `colors` project; the `crayon` implementation is now available as
    `rainbowCrayon`
11. Changed default `palette` implementation to work as other text modifiers,
    namely, allowing it to return an array which can be spread when
    supplied to `console.log`, but requiring a manual call to `log` in
    order to auto-log to console (`colors.palette.log()`)

## Potential future to-dos

1. HTML export, whether with `style` attributes or with semantic `class` and
    optional separate CSS stylesheet export
2. Allow styles to seep into modifiers and maps (and regardless of ordering)
    without (shared) config, or auto-add to shared config
3. Parsing CSS back into ANSI colors and styles
4. Deprecate multiple strings in `colors()` function to allow immediate
    return of loggable array when a second string is given (as with
    other methods whose final invocation can be supplied a string (and
    an optional object) and which otherwise treats a single argument (an
    options object) as continuing the chain (as per the current behavior)?
5. `String.prototype` option?
