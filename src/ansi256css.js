// A module that returns an ANSI color code given either a CSS color name, a hex string, or an ANSI color code as a number

import cssToAnsi from './css-to-ansi';

// Maps a 6 digit hex string describing a CSS color onto the ANSI 256 color palette
function fromHex (hex) {
    const [red, green, blue] = [
        hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)
    ].map((x) => Math.round(parseInt(x, 16) / 255 * 5));

    return 16 + red * 36 + green * 6 + blue;
}

module.exports = function (code) {
    // Returns an ANSI color number given an ANSI color number, CSS color name, or CSS hex color
    switch (typeof code) {
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
        return cssToAnsi[code.toLowerCase()];
    }
};
