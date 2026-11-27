// Formats a number for a G-code address word (X, Y, Z, I, J, F, ...).
//
// Always returns a string with an explicit decimal point and a fixed number
// of places, for positive, negative, zero and whole values alike: 5 -> "5.000",
// -5 -> "-5.000". Mazak and Fanuc-style controls read a value without a
// decimal point in least input increments (X-5 is -0.0005" in G20), so a
// missing point puts the tool somewhere completely different.
//
// Negate the number BEFORE formatting: write fmt(-x), never -fmt(x) or
// -(x).toFixed(3). A unary minus on the formatted string turns it back into
// a number and drops the decimal point on whole values.
export const fmt = (value, places = 3) => {
    const n = Number(value);
    if (!Number.isFinite(n)) {
        throw new Error(`Cannot write G-code for a non-numeric value: ${value}`);
    }
    const s = n.toFixed(places);
    // Values that round to zero print as 0.000, not -0.000.
    return /^-0\.0*$/.test(s) ? s.slice(1) : s;
};
