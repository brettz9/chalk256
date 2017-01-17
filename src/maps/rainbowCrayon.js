import colors from '../color-everywhere';

const VERY_DARK_COLORS = [0, 16, 17, 18, 232, 233, 234, 235];
export default (letter, i, exploded) => {
    return colors(i * 19 % 256 + 12 * (VERY_DARK_COLORS.includes(i)))(letter);
};
