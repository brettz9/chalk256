import colors from '../color-everywhere';

/**
* Displays all the colors
*/
const VERY_DARK_COLORS = [0, 16, 17, 18, 232, 233, 234, 235];
const arr256 = Array(256).fill();

export default function (text, options) {
    return colors.inverse(
        arr256.map((_, i) => {
            return colors(i)('  ' + (VERY_DARK_COLORS.includes(i) ? colors.bgWhite(i) : i) + '  ');
        }).join('')
    );
};
