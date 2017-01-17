import colors from '../color-everywhere';

const available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green', 'blue', 'white', 'cyan', 'magenta'];
export default function (letter, i, exploded) {
    return letter === ' '
        ? letter
        : colors[available[Math.round(Math.random() * (available.length - 1))]](letter);
};
