import { config } from '../shared/dusterJobConfig';
import { FeatureLevels } from '../shared/FeatureLevels';

const jobLevels = new FeatureLevels(config.levels);
// console.log(config.levels);

// test linear and binary search
const testPoints = [ 0, 1, 99, 100, 299, 300, 599, 600, 1099, 1100, 2099, 2100, 4099, 4100, 9099, 9100, 19099, 19100, 34099, 34100, 54099, 54100, 55111 ];
// const testPoints = [ 101 ];

test('linear and binary search yields the same result', () => {
    for (let i = 0; i < testPoints.length; ++i) {
        const points = testPoints[i];
        const info = jobLevels.getLevelInfoLinear(points);
        // console.log(`linear: ${points} -> ${info.lvl}, iterations: ${jobLevels.linIterations}`);

        const info2 = jobLevels.getLevelInfoBinary(points);
        // console.log(`binary: ${points} -> ${info2.lvl}, iterations: ${jobLevels.binIterations}`);

        expect(info.lvl).toBe(info2.lvl);
    }
});

// compare the average number of iterations
const testsCount = 1000;
let linIterations = 0;
let binIterations = 0;

for (let i = 0; i < testsCount; ++i) {
    const points = Math.floor(Math.random() * 59000);

    jobLevels.getLevelInfoLinear(points);
    linIterations += jobLevels.linIterations;

    jobLevels.getLevelInfoBinary(points);
    binIterations += jobLevels.binIterations;
}
const linK = linIterations / testsCount;
const binK = binIterations / testsCount;

test(`linear: ${linK}, binary: ${binK}, binary faster in ${linK / binK} times`, () => {
    expect(binK).toBeLessThan(linK);
});
