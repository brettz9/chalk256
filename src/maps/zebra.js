import colors from '../color-everywhere';
export default function (letter, i, exploded) {
    return i % 2 === 0 ? letter : colors.inverse(letter);
};
