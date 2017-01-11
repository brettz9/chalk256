/* globals colors */
if (typeof global !== 'undefined') {
    const pkg = require('../package');
    global.colors = require('../' + pkg.main);
}

describe('color-everywhere', () => {
    colors.enabled = true;

    it('Can be called like `colors.red`', () => {
        expect(colors.red('test me!')).to.equal('\u001b[31mtest me!\u001b[39m');
    });

    it('Can be called like `colors(\'red\')`', () => {
        expect(colors('red')('test me!')).to.equal('\u001b[31mtest me!\u001b[39m');
    });

    it('Can be called with a chain of things like `colors.red.bgBrightWhite`', () => {
        expect(colors.red.bgBrightWhite('test me!')).to.equal('\u001b[31m\u001b[107mtest me!\u001b[49m\u001b[39m');
    });

    it('Can be called with complicated parameters spearate by spaces and commas', () => {
        expect(colors('bgred', '#ffcc00 underline')('test me!')).to.equal('\u001b[48;5;196m\u001b[38;5;220m\u001b[4mtest me!\u001b[24m\u001b[39m\u001b[49m');
    });

    it('Can be called with hex codes', () => {
        expect(colors('#ffcc00')('test me!')).to.equal('\u001b[38;5;220mtest me!\u001b[39m');
        expect(colors('#ffcc00 bgNavy')('test me!')).to.equal('\u001b[38;5;220m\u001b[48;5;19mtest me!\u001b[49m\u001b[39m');
    });

    it('Has log functions', () => {
        // We just don't want these to throw
        colors.cyan.log('test me!');
        colors('cyan').log('test me!');
        colors.red.bgWhite.error('test me!');
        colors.red.bgWhite.log('test me!');
        // colors.red.bgWhite.debug 'test me!');
        colors.red.bgWhite.warn('test me!');
    });

    it('Mimicks the API of this old colors module', () => {
        colors.success('test me!');
    });

    it('Has a rainbow feature', () => {
        expect(colors.inverse.rainbow(121231231321232321)).to.equal('\u001b[7m\u001b[38;5;12m1\u001b[39m\u001b[38;5;19m2\u001b[39m\u001b[38;5;38m1\u001b[39m\u001b[38;5;57m2\u001b[39m\u001b[38;5;76m3\u001b[39m\u001b[38;5;95m1\u001b[39m\u001b[38;5;114m2\u001b[39m\u001b[38;5;133m3\u001b[39m\u001b[38;5;152m1\u001b[39m\u001b[38;5;171m3\u001b[39m\u001b[38;5;190m2\u001b[39m\u001b[38;5;209m1\u001b[39m\u001b[38;5;228m2\u001b[39m\u001b[38;5;247m3\u001b[39m\u001b[38;5;10m2\u001b[39m\u001b[38;5;29m3\u001b[39m\u001b[38;5;60m2\u001b[39m\u001b[38;5;79m0\u001b[39m\u001b[27m');
    });
});
