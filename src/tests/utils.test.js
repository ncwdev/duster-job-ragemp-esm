import * as utils from '../shared/utils';

const iterations = 1000;

test('getRandomIndexNoRepeat(2, 0)', () => {
    for (let i = 0; i < iterations; ++i) {
        expect(utils.getRandomIndexNoRepeat(2, 0)).toBe(1);
    }
});

test('getRandomIndexNoRepeat(2, 1)', () => {
    for (let i = 0; i < iterations; ++i) {
        expect(utils.getRandomIndexNoRepeat(2, 1)).toBe(0);
    }
});

test('getRandomIndexNoRepeat(3, x)', () => {
    for (let i = 0; i < iterations; ++i) {
        const curIndex = utils.getRandomInt(0, 3);
        expect(utils.getRandomIndexNoRepeat(3, curIndex)).not.toBe(curIndex);
        expect(utils.getRandomIndexNoRepeat(3, curIndex)).not.toBe(3);
    }
});
