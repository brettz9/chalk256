export default function (text, options) {
    text = text || '   he is here   ';

    const soul = {
        up: [
            '̍', '̎', '̄', '̅',
            '̿', '̑', '̆', '̐',
            '͒', '͗', '͑', '̇',
            '̈', '̊', '͂', '̓',
            '̈', '͊', '͋', '͌',
            '̃', '̂', '̌', '͐',
            '̀', '́', '̋', '̏',
            '̒', '̓', '̔', '̽',
            '̉', 'ͣ', 'ͤ', 'ͥ',
            'ͦ', 'ͧ', 'ͨ', 'ͩ',
            'ͪ', 'ͫ', 'ͬ', 'ͭ',
            'ͮ', 'ͯ', '̾', '͛',
            '͆', '̚'
        ],
        down: [
            '̖', '̗', '̘', '̙',
            '̜', '̝', '̞', '̟',
            '̠', '̤', '̥', '̦',
            '̩', '̪', '̫', '̬',
            '̭', '̮', '̯', '̰',
            '̱', '̲', '̳', '̹',
            '̺', '̻', '̼', 'ͅ',
            '͇', '͈', '͉', '͍',
            '͎', '͓', '͔', '͕',
            '͖', '͙', '͚', '̣'
        ],
        mid: [
            '̕', '̛', '̀', '́',
            '͘', '̡', '̢', '̧',
            '̨', '̴', '̵', '̶',
            '͜', '͝', '͞',
            '͟', '͠', '͢', '̸',
            '̷', '͡', ' ҉'
        ]
    };
    const all = [].concat(soul.up, soul.down, soul.mid);

    function randomNumber (range) {
        return Math.floor(Math.random() * range);
    }

    function isChar (chr) {
        return all.some((c) => c === chr);
    }

    function heComes (text, options) {
        let result = '';

        options = options || {};
        options.up = typeof options.up !== 'undefined' ? options.up : true;
        options.mid = typeof options.mid !== 'undefined' ? options.mid : true;
        options.down = typeof options.down !== 'undefined' ? options.down : true;
        options.size = typeof options.size !== 'undefined' ? options.size : 'maxi';

        text = text.split('');

        text.forEach((l) => {
            if (isChar(l)) {
                return;
            }
            result += l;
            const counts = {up: 0, down: 0, mid: 0};
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

            ['up', 'mid', 'down'].forEach((index) => {
                for (let i = 0; i <= counts[index]; i++) {
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
