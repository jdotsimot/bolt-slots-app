// Run with: npm test   (uses Node's built-in test runner, no extra packages)
//
// Guards against coordinates being written without a decimal point.
// Mazak and Fanuc-style controls read X-5 as -0.0005" in G20, so a single
// missing point sends the tool to the wrong place.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateGCode, MACHINES } from '../src/utils/generators/index.js';
import { fmt } from '../src/utils/generators/format.js';

// Address words that carry a distance or feed and must always have a decimal.
const DECIMAL_WORDS = /([XYZIJKRF])([-+]?[0-9.]+)/g;

const stripComments = (line) => line.replace(/\([^)]*\)/g, '');

const numericWords = (program) => {
    const words = [];
    program.split('\n').forEach((raw, i) => {
        const line = stripComments(raw);
        for (const m of line.matchAll(DECIMAL_WORDS)) {
            words.push({ address: m[1], text: m[2], lineNo: i + 1, line: raw });
        }
    });
    return words;
};

// A spread of real-world sizes, including whole-number lengths (the case
// that used to lose the decimal point on the left end) and odd fractions.
const SIZES = [];
for (const parallelLength of [10, 12, 12.5, 13, 24, 36.25, 48]) {
    for (const slotWidth of [0.875, 1.0, 1.25, 1.5]) {
        for (const [slotLength, footHeight, parallelWidth] of [[2, 1.5, 3], [1.5, 0.75, 2.5], [3, 1, 4]]) {
            SIZES.push({ slotWidth, slotLength, parallelWidth, parallelLength, footHeight });
        }
    }
}

const MACHINE_LIST = [MACHINES.MAZAK, MACHINES.BIG_MILLS];

test('fmt always writes a decimal point', () => {
    assert.equal(fmt(5), '5.000');
    assert.equal(fmt(-5), '-5.000');
    assert.equal(fmt(0), '0.000');
    assert.equal(fmt(-0), '0.000');
    assert.equal(fmt(-0.0001), '0.000');
    assert.equal(fmt(-11.5), '-11.500');
    assert.equal(fmt(105, 1), '105.0');
    assert.throws(() => fmt(NaN));
    assert.throws(() => fmt(Infinity));
});

for (const machine of MACHINE_LIST) {
    test(`${machine}: every coordinate and feed has a decimal point, both ends`, () => {
        for (const size of SIZES) {
            const program = generateGCode(machine, size);
            const words = numericWords(program);
            assert.ok(words.length > 0, 'program has coordinates');
            for (const w of words) {
                assert.ok(
                    w.text.includes('.'),
                    `${machine} ${JSON.stringify(size)}: line ${w.lineNo} "${w.line}" has ${w.address}${w.text} with no decimal point`
                );
                assert.ok(
                    !/^-0\.0*$/.test(w.text),
                    `${machine} ${JSON.stringify(size)}: line ${w.lineNo} "${w.line}" has negative zero`
                );
            }
        }
    });

    test(`${machine}: left end X moves mirror the right end exactly`, () => {
        for (const size of SIZES) {
            const program = generateGCode(machine, size);
            const xs = numericWords(program).filter((w) => w.address === 'X').map((w) => w.text);
            const positives = new Set(xs.filter((x) => !x.startsWith('-')));
            const negatives = new Set(xs.filter((x) => x.startsWith('-')).map((x) => x.slice(1)));
            assert.deepEqual(
                [...negatives].sort(),
                [...positives].sort(),
                `${machine} ${JSON.stringify(size)}: left X values ${[...negatives]} do not mirror right X values ${[...positives]}`
            );
        }
    });
}
