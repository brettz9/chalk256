import colors from '../color-everywhere';

const rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta']; // RoY G BiV
export default function (letter, i, exploded) {
    if (letter === ' ') {
        return letter;
    }
    return colors[rainbowColors[i++ % rainbowColors.length]](letter);
};
