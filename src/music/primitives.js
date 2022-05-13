// constructors - music

const group = xs => ({ notes: xs });
const half = x => ({ string: 7, fret: x, length: 1/2});
const quarter = x => ({ string: 7, fret: x, length: 1/4});
const eighth = x => ({ string: 7, fret: x, length: 1/8});
const eighths = xs => group(xs.map(eighth));
const sixteenth = x => ({ string: 7, fret: x, length: 1/16});
const sixteenths = xs => group(xs.map(sixteenth));
const dotted = x => ({ ...x, dotted: true});
const silence = note => ({...note, fret: '-'});

exports.group = group;
exports.half = half;
exports.quarter = quarter;
exports.eighth = eighth;
exports.eighths = eighths;
exports.sixteenth = sixteenth;
exports.sixteenths = sixteenths;
exports.dotted = dotted;
exports.silence = silence;

const e = eighth;
const de = fret => dotted(eighth(fret));
const s = sixteenth;
const ss = fret => silence(s(fret));

exports.e = e; 
exports.de = de; 
exports.s = s; 
exports.ss = ss; 

