/* globals colors */
const isNode = typeof global !== 'undefined';
if (isNode) {
    const pkg = require('../package');
    global.colors = require('../' + pkg.main);
}

describe('color-everywhere', () => {
    colors.setMode(colors.MODES.NODE);

    it('Can be called like `colors.red`', () => {
        const expected = isNode ? ['\u001b[31mtest me!\u001b[39m'] : ['%ctest me!', 'color:rgba(204,0,0,1);'];
        expect(colors.red('test me!')).to.deep.equal(expected);
    });

    it('Can be called like `colors(\'red\')`', () => {
        const expected = isNode ? ['\u001b[31mtest me!\u001b[39m'] : ['%ctest me!', 'color:rgba(204,0,0,1);'];
        expect(colors('red')('test me!')).to.deep.equal(expected);
    });

    it('Can be called with a chain of properties like `colors.red.bgBrightWhite`', () => {
        const expected = isNode ? ['\u001b[31m\u001b[107mtest me!\u001b[49m\u001b[39m'] : ['%ctest me!', 'color:rgba(204,0,0,1);background:rgba(255,255,255,1);'];
        expect(colors.red.bgBrightWhite('test me!')).to.deep.equal(expected);
    });

    it('Can be called with complicated parameters separated by spaces and commas', () => {
        const expected = isNode ? ['\u001b[48;5;196m\u001b[38;5;220m\u001b[4mtest me!\u001b[24m\u001b[39m\u001b[49m'] : ['%ctest me!', ''];
        expect(colors('bgred', '#ffcc00 underline')('test me!')).to.deep.equal(expected);
    });

    it('Can be called with hex codes', () => {
        let expected = isNode ? ['\u001b[38;5;220mtest me!\u001b[39m'] : ['%ctest me!', ''];
        expect(colors('#ffcc00')('test me!')).to.deep.equal(expected);

        expected = isNode ? ['\u001b[38;5;220m\u001b[48;5;19mtest me!\u001b[49m\u001b[39m'] : ['%ctest me!', ''];
        expect(colors('#ffcc00 bgNavy')('test me!')).to.deep.equal(expected);
    });

    it('Can be called with numeric methods', () => {
        const expected = isNode
            ? ['\u001b[38;5;23mtest me!\u001b[39m']
            : ['%c', ''];
        expect(colors[23]('test me!')).to.deep.equal(expected);
    });

    it('Has log functions', () => {
        // We just don't want these to throw
        colors.cyan.log('test me!');
        colors('cyan').log('test me%s!', 'abc');
        colors.red.bgWhite.error('test me!');
        colors.red.bgWhite.log('test me!');
        // colors.red.bgWhite.debug('test me!');
        colors.red.bgWhite.warn('test me!');
        colors.success('test me!');
        colors.log('H', colors.yellow('ello'), colors.green('Wor'), 'l', colors.red('d'), '!');
    });

    it('Has a rainbow feature (a map returning a formatted array)', () => {
        let expected = isNode
            ? ['\u001b[7m\u001b[38;5;12m1\u001b[39m\u001b[38;5;19m2\u001b[39m\u001b[38;5;38m1\u001b[39m\u001b[38;5;57m2\u001b[39m\u001b[38;5;76m3\u001b[39m\u001b[38;5;95m1\u001b[39m\u001b[38;5;114m2\u001b[39m\u001b[38;5;133m3\u001b[39m\u001b[38;5;152m1\u001b[39m\u001b[38;5;171m3\u001b[39m\u001b[38;5;190m2\u001b[39m\u001b[38;5;209m1\u001b[39m\u001b[38;5;228m2\u001b[39m\u001b[38;5;247m3\u001b[39m\u001b[38;5;10m2\u001b[39m\u001b[38;5;29m3\u001b[39m\u001b[38;5;60m2\u001b[39m\u001b[38;5;79m0\u001b[39m\u001b[27m']
            : ['%ctest me!', ''];
        expect(colors.inverse.rainbowCrayon(121231231321232321)).to.deep.equal(expected);

        expected = isNode
            ? ['\u001b[7m\u001b[31m1\u001b[39m\u001b[33m2\u001b[39m\u001b[32m1\u001b[39m\u001b[34m2\u001b[39m\u001b[35m3\u001b[39m\u001b[31m1\u001b[39m\u001b[33m2\u001b[39m\u001b[32m3\u001b[39m\u001b[34m1\u001b[39m\u001b[35m3\u001b[39m\u001b[31m2\u001b[39m\u001b[33m1\u001b[39m\u001b[32m2\u001b[39m\u001b[34m3\u001b[39m\u001b[35m2\u001b[39m\u001b[31m3\u001b[39m\u001b[33m2\u001b[39m\u001b[32m0\u001b[39m\u001b[27m']
            : ['%ctest me!', ''];
        expect(colors.inverse.rainbow(121231231321232321)).to.deep.equal(expected);
    });

    it('Has a palette feature (text modifier returning a formatted array)', () => {
        const expected = isNode
            ? ['\u001b[7m\u001b[38;5;0m  \u001b[47m0\u001b[49m  \u001b[39m\u001b[38;5;1m  1  \u001b[39m\u001b[38;5;2m  2  \u001b[39m\u001b[38;5;3m  3  \u001b[39m\u001b[38;5;4m  4  \u001b[39m\u001b[38;5;5m  5  \u001b[39m\u001b[38;5;6m  6  \u001b[39m\u001b[38;5;7m  7  \u001b[39m\u001b[38;5;8m  8  \u001b[39m\u001b[38;5;9m  9  \u001b[39m\u001b[38;5;10m  10  \u001b[39m\u001b[38;5;11m  11  \u001b[39m\u001b[38;5;12m  12  \u001b[39m\u001b[38;5;13m  13  \u001b[39m\u001b[38;5;14m  14  \u001b[39m\u001b[38;5;15m  15  \u001b[39m\u001b[38;5;16m  \u001b[47m16\u001b[49m  \u001b[39m\u001b[38;5;17m  \u001b[47m17\u001b[49m  \u001b[39m\u001b[38;5;18m  \u001b[47m18\u001b[49m  \u001b[39m\u001b[38;5;19m  19  \u001b[39m\u001b[38;5;20m  20  \u001b[39m\u001b[38;5;21m  21  \u001b[39m\u001b[38;5;22m  22  \u001b[39m\u001b[38;5;23m  23  \u001b[39m\u001b[38;5;24m  24  \u001b[39m\u001b[38;5;25m  25  \u001b[39m\u001b[38;5;26m  26  \u001b[39m\u001b[38;5;27m  27  \u001b[39m\u001b[38;5;28m  28  \u001b[39m\u001b[38;5;29m  29  \u001b[39m\u001b[38;5;30m  30  \u001b[39m\u001b[38;5;31m  31  \u001b[39m\u001b[38;5;32m  32  \u001b[39m\u001b[38;5;33m  33  \u001b[39m\u001b[38;5;34m  34  \u001b[39m\u001b[38;5;35m  35  \u001b[39m\u001b[38;5;36m  36  \u001b[39m\u001b[38;5;37m  37  \u001b[39m\u001b[38;5;38m  38  \u001b[39m\u001b[38;5;39m  39  \u001b[39m\u001b[38;5;40m  40  \u001b[39m\u001b[38;5;41m  41  \u001b[39m\u001b[38;5;42m  42  \u001b[39m\u001b[38;5;43m  43  \u001b[39m\u001b[38;5;44m  44  \u001b[39m\u001b[38;5;45m  45  \u001b[39m\u001b[38;5;46m  46  \u001b[39m\u001b[38;5;47m  47  \u001b[39m\u001b[38;5;48m  48  \u001b[39m\u001b[38;5;49m  49  \u001b[39m\u001b[38;5;50m  50  \u001b[39m\u001b[38;5;51m  51  \u001b[39m\u001b[38;5;52m  52  \u001b[39m\u001b[38;5;53m  53  \u001b[39m\u001b[38;5;54m  54  \u001b[39m\u001b[38;5;55m  55  \u001b[39m\u001b[38;5;56m  56  \u001b[39m\u001b[38;5;57m  57  \u001b[39m\u001b[38;5;58m  58  \u001b[39m\u001b[38;5;59m  59  \u001b[39m\u001b[38;5;60m  60  \u001b[39m\u001b[38;5;61m  61  \u001b[39m\u001b[38;5;62m  62  \u001b[39m\u001b[38;5;63m  63  \u001b[39m\u001b[38;5;64m  64  \u001b[39m\u001b[38;5;65m  65  \u001b[39m\u001b[38;5;66m  66  \u001b[39m\u001b[38;5;67m  67  \u001b[39m\u001b[38;5;68m  68  \u001b[39m\u001b[38;5;69m  69  \u001b[39m\u001b[38;5;70m  70  \u001b[39m\u001b[38;5;71m  71  \u001b[39m\u001b[38;5;72m  72  \u001b[39m\u001b[38;5;73m  73  \u001b[39m\u001b[38;5;74m  74  \u001b[39m\u001b[38;5;75m  75  \u001b[39m\u001b[38;5;76m  76  \u001b[39m\u001b[38;5;77m  77  \u001b[39m\u001b[38;5;78m  78  \u001b[39m\u001b[38;5;79m  79  \u001b[39m\u001b[38;5;80m  80  \u001b[39m\u001b[38;5;81m  81  \u001b[39m\u001b[38;5;82m  82  \u001b[39m\u001b[38;5;83m  83  \u001b[39m\u001b[38;5;84m  84  \u001b[39m\u001b[38;5;85m  85  \u001b[39m\u001b[38;5;86m  86  \u001b[39m\u001b[38;5;87m  87  \u001b[39m\u001b[38;5;88m  88  \u001b[39m\u001b[38;5;89m  89  \u001b[39m\u001b[38;5;90m  90  \u001b[39m\u001b[38;5;91m  91  \u001b[39m\u001b[38;5;92m  92  \u001b[39m\u001b[38;5;93m  93  \u001b[39m\u001b[38;5;94m  94  \u001b[39m\u001b[38;5;95m  95  \u001b[39m\u001b[38;5;96m  96  \u001b[39m\u001b[38;5;97m  97  \u001b[39m\u001b[38;5;98m  98  \u001b[39m\u001b[38;5;99m  99  \u001b[39m\u001b[38;5;100m  100  \u001b[39m\u001b[38;5;101m  101  \u001b[39m\u001b[38;5;102m  102  \u001b[39m\u001b[38;5;103m  103  \u001b[39m\u001b[38;5;104m  104  \u001b[39m\u001b[38;5;105m  105  \u001b[39m\u001b[38;5;106m  106  \u001b[39m\u001b[38;5;107m  107  \u001b[39m\u001b[38;5;108m  108  \u001b[39m\u001b[38;5;109m  109  \u001b[39m\u001b[38;5;110m  110  \u001b[39m\u001b[38;5;111m  111  \u001b[39m\u001b[38;5;112m  112  \u001b[39m\u001b[38;5;113m  113  \u001b[39m\u001b[38;5;114m  114  \u001b[39m\u001b[38;5;115m  115  \u001b[39m\u001b[38;5;116m  116  \u001b[39m\u001b[38;5;117m  117  \u001b[39m\u001b[38;5;118m  118  \u001b[39m\u001b[38;5;119m  119  \u001b[39m\u001b[38;5;120m  120  \u001b[39m\u001b[38;5;121m  121  \u001b[39m\u001b[38;5;122m  122  \u001b[39m\u001b[38;5;123m  123  \u001b[39m\u001b[38;5;124m  124  \u001b[39m\u001b[38;5;125m  125  \u001b[39m\u001b[38;5;126m  126  \u001b[39m\u001b[38;5;127m  127  \u001b[39m\u001b[38;5;128m  128  \u001b[39m\u001b[38;5;129m  129  \u001b[39m\u001b[38;5;130m  130  \u001b[39m\u001b[38;5;131m  131  \u001b[39m\u001b[38;5;132m  132  \u001b[39m\u001b[38;5;133m  133  \u001b[39m\u001b[38;5;134m  134  \u001b[39m\u001b[38;5;135m  135  \u001b[39m\u001b[38;5;136m  136  \u001b[39m\u001b[38;5;137m  137  \u001b[39m\u001b[38;5;138m  138  \u001b[39m\u001b[38;5;139m  139  \u001b[39m\u001b[38;5;140m  140  \u001b[39m\u001b[38;5;141m  141  \u001b[39m\u001b[38;5;142m  142  \u001b[39m\u001b[38;5;143m  143  \u001b[39m\u001b[38;5;144m  144  \u001b[39m\u001b[38;5;145m  145  \u001b[39m\u001b[38;5;146m  146  \u001b[39m\u001b[38;5;147m  147  \u001b[39m\u001b[38;5;148m  148  \u001b[39m\u001b[38;5;149m  149  \u001b[39m\u001b[38;5;150m  150  \u001b[39m\u001b[38;5;151m  151  \u001b[39m\u001b[38;5;152m  152  \u001b[39m\u001b[38;5;153m  153  \u001b[39m\u001b[38;5;154m  154  \u001b[39m\u001b[38;5;155m  155  \u001b[39m\u001b[38;5;156m  156  \u001b[39m\u001b[38;5;157m  157  \u001b[39m\u001b[38;5;158m  158  \u001b[39m\u001b[38;5;159m  159  \u001b[39m\u001b[38;5;160m  160  \u001b[39m\u001b[38;5;161m  161  \u001b[39m\u001b[38;5;162m  162  \u001b[39m\u001b[38;5;163m  163  \u001b[39m\u001b[38;5;164m  164  \u001b[39m\u001b[38;5;165m  165  \u001b[39m\u001b[38;5;166m  166  \u001b[39m\u001b[38;5;167m  167  \u001b[39m\u001b[38;5;168m  168  \u001b[39m\u001b[38;5;169m  169  \u001b[39m\u001b[38;5;170m  170  \u001b[39m\u001b[38;5;171m  171  \u001b[39m\u001b[38;5;172m  172  \u001b[39m\u001b[38;5;173m  173  \u001b[39m\u001b[38;5;174m  174  \u001b[39m\u001b[38;5;175m  175  \u001b[39m\u001b[38;5;176m  176  \u001b[39m\u001b[38;5;177m  177  \u001b[39m\u001b[38;5;178m  178  \u001b[39m\u001b[38;5;179m  179  \u001b[39m\u001b[38;5;180m  180  \u001b[39m\u001b[38;5;181m  181  \u001b[39m\u001b[38;5;182m  182  \u001b[39m\u001b[38;5;183m  183  \u001b[39m\u001b[38;5;184m  184  \u001b[39m\u001b[38;5;185m  185  \u001b[39m\u001b[38;5;186m  186  \u001b[39m\u001b[38;5;187m  187  \u001b[39m\u001b[38;5;188m  188  \u001b[39m\u001b[38;5;189m  189  \u001b[39m\u001b[38;5;190m  190  \u001b[39m\u001b[38;5;191m  191  \u001b[39m\u001b[38;5;192m  192  \u001b[39m\u001b[38;5;193m  193  \u001b[39m\u001b[38;5;194m  194  \u001b[39m\u001b[38;5;195m  195  \u001b[39m\u001b[38;5;196m  196  \u001b[39m\u001b[38;5;197m  197  \u001b[39m\u001b[38;5;198m  198  \u001b[39m\u001b[38;5;199m  199  \u001b[39m\u001b[38;5;200m  200  \u001b[39m\u001b[38;5;201m  201  \u001b[39m\u001b[38;5;202m  202  \u001b[39m\u001b[38;5;203m  203  \u001b[39m\u001b[38;5;204m  204  \u001b[39m\u001b[38;5;205m  205  \u001b[39m\u001b[38;5;206m  206  \u001b[39m\u001b[38;5;207m  207  \u001b[39m\u001b[38;5;208m  208  \u001b[39m\u001b[38;5;209m  209  \u001b[39m\u001b[38;5;210m  210  \u001b[39m\u001b[38;5;211m  211  \u001b[39m\u001b[38;5;212m  212  \u001b[39m\u001b[38;5;213m  213  \u001b[39m\u001b[38;5;214m  214  \u001b[39m\u001b[38;5;215m  215  \u001b[39m\u001b[38;5;216m  216  \u001b[39m\u001b[38;5;217m  217  \u001b[39m\u001b[38;5;218m  218  \u001b[39m\u001b[38;5;219m  219  \u001b[39m\u001b[38;5;220m  220  \u001b[39m\u001b[38;5;221m  221  \u001b[39m\u001b[38;5;222m  222  \u001b[39m\u001b[38;5;223m  223  \u001b[39m\u001b[38;5;224m  224  \u001b[39m\u001b[38;5;225m  225  \u001b[39m\u001b[38;5;226m  226  \u001b[39m\u001b[38;5;227m  227  \u001b[39m\u001b[38;5;228m  228  \u001b[39m\u001b[38;5;229m  229  \u001b[39m\u001b[38;5;230m  230  \u001b[39m\u001b[38;5;231m  231  \u001b[39m\u001b[38;5;232m  \u001b[47m232\u001b[49m  \u001b[39m\u001b[38;5;233m  \u001b[47m233\u001b[49m  \u001b[39m\u001b[38;5;234m  \u001b[47m234\u001b[49m  \u001b[39m\u001b[38;5;235m  \u001b[47m235\u001b[49m  \u001b[39m\u001b[38;5;236m  236  \u001b[39m\u001b[38;5;237m  237  \u001b[39m\u001b[38;5;238m  238  \u001b[39m\u001b[38;5;239m  239  \u001b[39m\u001b[38;5;240m  240  \u001b[39m\u001b[38;5;241m  241  \u001b[39m\u001b[38;5;242m  242  \u001b[39m\u001b[38;5;243m  243  \u001b[39m\u001b[38;5;244m  244  \u001b[39m\u001b[38;5;245m  245  \u001b[39m\u001b[38;5;246m  246  \u001b[39m\u001b[38;5;247m  247  \u001b[39m\u001b[38;5;248m  248  \u001b[39m\u001b[38;5;249m  249  \u001b[39m\u001b[38;5;250m  250  \u001b[39m\u001b[38;5;251m  251  \u001b[39m\u001b[38;5;252m  252  \u001b[39m\u001b[38;5;253m  253  \u001b[39m\u001b[38;5;254m  254  \u001b[39m\u001b[38;5;255m  255  \u001b[39m\u001b[27m']
            : ['%c', ''];
        expect(colors.palette()).to.deep.equal(expected);
    });

    it('Supports modifying basic', () => {
        colors.setBasic({
            myRed: [31, 39]
        });
        const expected = isNode
            ? ['\u001b[31mmyRed!\u001b[39m']
            : ['%c', ''];
        expect(colors('myRed')('myRed!')).to.deep.equal(expected);
    });

    it('Supports themes', () => {
        colors.setTheme({
            serious: ['alert', 'underline'],
            alert: 'red'
        });

        let expected = isNode
            ? ['\u001b[4m\u001b[31mSome text\u001b[39m\u001b[24m']
            : ['%c', ''];
        expect(colors.serious('Some text')).to.deep.equal(expected);

        expected = isNode
            ? ['\u001b[31mSome text\u001b[39m']
            : ['%c', ''];
        expect(colors.alert('Some text')).to.deep.equal(expected);
    });

    it('Supports text modifiers (returning a string)', () => {
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
        const expected = isNode
            ? ['Lots of lists and ssseries']
            : ['%c', ''];
        expect(colors.snake('Lots of lists and series')).to.deep.equal(expected);
    });

    it('Supports text modifiers (returning a formatted array)', () => {
        function snake (text, options) {
            return text.split('').map((letter, i, exploded) => {
                const prevChar = exploded[i - 1];
                if (letter === 's' && (!prevChar || prevChar === ' ')) {
                    return colors.red('sss');
                }
                return letter;
            }).join('');
        }
        colors.setTextModifiers({snake}, true);
        const expected = isNode
            ? ['Lots of lists and \u001b[31msss\u001b[39meries']
            : ['%c', ''];
        expect(colors.snake('Lots of lists and series')).to.deep.equal(expected);
    });

    it('Supports maps (returning a string)', () => {
        function emphasizePlurals (letter, i, exploded) {
            const nextChar = exploded[i + 1];
            if (letter === 's' && (!nextChar || nextChar === ' ')) {
                return 'sss';
            }
            return letter;
        }
        colors.setMaps({emphasizePlurals});

        const expected = isNode
            ? ['Lotsss of listsss and seriesss']
            : ['%c', ''];
        expect(colors.emphasizePlurals('Lots of lists and series')).to.deep.equal(expected);
    });

    it('Supports maps (returning a formatted array)', () => {
        function emphasizePlurals (letter, i, exploded) {
            const nextChar = exploded[i + 1];
            if (letter === 's' && (!nextChar || nextChar === ' ')) {
                return colors.red('sss');
            }
            return letter;
        }
        colors.setMaps({emphasizePlurals}, true);

        const expected = isNode
            ? ['Lot\u001b[31msss\u001b[39m of list\u001b[31msss\u001b[39m and serie\u001b[31msss\u001b[39m']
            : ['%c', ''];
        expect(colors.emphasizePlurals('Lots of lists and series')).to.deep.equal(expected); // Lotsss of listsss and seriesss
    });

    it('Supports options to text modifiers', () => {
        function snake (text, options) {
            return text.split('').map((letter, i, exploded) => {
                const prevChar = exploded[i - 1];
                if (letter === 's' && (!prevChar || prevChar === ' ')) {
                    return options && typeof options === 'object' ? colors[options.color]('sss') : colors.blue('sss');
                }
                return letter;
            }).join('');
        }
        colors.setTextModifiers({snake}, true);
        const expected = isNode
            ? ['Lots of lists and \u001b[31msss\u001b[39meries']
            : ['%c', ''];
        expect(colors.snake('Lots of lists and series', {color: 'red'})).to.deep.equal(expected);
    });

    it('Supports themes, text modifiers, maps, and regular methods together', () => {
        function snake (text, options) {
            return colors.split(text).map((letter, i, exploded) => {
                const prevChar = exploded[i - 1];
                if (letter === 's' && (!prevChar || prevChar === ' ')) {
                    return options.color ? colors[options.color]('sss') : colors.blue('sss');
                }
                return letter;
                // return options.addStyles(letter);
            }).join('');
        }
        colors.setTextModifiers({snake}, true);
        function emphasizePlurals (letter, i, exploded, opts) {
            /*
            // Will recurse more with addStyles (avoid?)
            if (exploded.length === 1) {
                return letter;
            }
            */
            const nextChar = exploded[i + 1];
            if (letter === 's' && (!nextChar || nextChar === ' ')) {
                return colors.red('sss');
            }
            return letter;
        }
        colors.setMaps({emphasizePlurals}, true);
        colors.setTheme({
            serious: ['alert', 'underline'],
            alert: 'yellow'
        }, true);
        let expected = isNode
            ? ['\u001b[33m\u001b[3mLot\u001b[31msss\u001b[39m of list\u001b[31msss\u001b[39m and \u001b[35msss\u001b[39merie\u001b[31msss\u001b[39m ooo\u001b[23m\u001b[39m']
            : ['%c', ''];
        // colors.color('yellow').snake({color: 'magenta'}).emphasizePlurals({}).italic.log('Lots of lists and series ooo');
        expect(colors.snake({color: 'magenta'}).color('yellow').emphasizePlurals({}).italic('Lots of lists and series ooo')).to.deep.equal(expected);
        expected = isNode
            ? ['\u001b[4m\u001b[33m\u001b[3mLot\u001b[31msss\u001b[39m of list\u001b[31msss\u001b[39m and \u001b[35msss\u001b[39merie\u001b[31msss\u001b[39m ooo\u001b[23m\u001b[39m\u001b[24m']
            : ['%c', ''];
        expect(colors('serious snake emphasizePlurals italic')('Lots of lists and series ooo')).to.deep.equal(expected);
    });

    it('Supports joining without spaces', () => {
        const expected = isNode
            ? ['H\u001b[33mello\u001b[39m\u001b[32mWor\u001b[39ml\u001b[31md\u001b[39m!']
            : ['%c', ''];
        expect(colors.join('H', colors.yellow('ello'), colors.green('Wor'), 'l', colors.red('d'), '!')).to.deep.equal(expected);
    });

    it('Mimicks the API of this old colors module', () => {
    });
});
