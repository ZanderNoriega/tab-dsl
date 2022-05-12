const {
  flatRepeat,
  repeat,
  log,
} = require('./src/std');

const {
  sixteenth,
  sixteenths,
  silence,
  quarter,
  half,
  de,
  s,
  e,
  ss,
} = require('./src/music/primitives');

const {
  powerChord5,
  powerChord6,
  open3,
  dropBar6
} = require('./src/music/chords');

const {
  palmMuted,
  pe,
  ms,
} = require('./src/music/performance');

const {
  trim,
  s7,
  s4,
  s3,
  s2,
  s1,
} = require('./src/music/composition');

const {
  renderASCII,
} = require('./src/render/ascii/render');

// constructors - convenience
// Test 0
let chuggies = palmMuted(sixteenths([0,1,0])); 
const t0 = {
  program: [
    ...trim(8)(flatRepeat(15)([
      ...s7([chuggies, de(2), pe(0), pe(0)]),
      ...s7([chuggies, de(2), pe(0), pe(0)]),
      ...s7([chuggies]),
    ]))
  ],
  config: {
    title: "Meshuggah - New Millenium Cyanide Christ",
    tuning: {
      s1: 'Eb',
      s2: 'Bb',
      s3: 'Gb',
      s4: 'Db',
      s5: 'Ab',
      s6: 'Eb',
      s7: 'Bb',
    }
  }
};

const smellsStart = rootFret => [
  powerChord6(de)(rootFret),
  powerChord6(s)(rootFret),
  powerChord6(e)(rootFret),
];
const smellsEnd = rootFret => [
  powerChord5(e)(1),
  ...repeat(2)(powerChord5(s)(rootFret)),
];

// Test 1
const t1 = {
  program: [
    ...smellsStart(1),
    powerChord6(ss)(1),
    ...repeat(3)(powerChord6(ms)(1)),
    ...smellsEnd(1),
    open3(5)(e),
    ...smellsStart(4),
    ...repeat(4)(powerChord6(ms)(4)),
    ...smellsEnd(4),
    powerChord5(ss)(4),
    open3(5)(sixteenth)
  ],
  config: {
    title: "Nirvana - Smells Like Teen Spirit",
    tuning: {
      s1: 'E',
      s2: 'B',
      s3: 'G',
      s4: 'D',
      s5: 'A',
      s6: 'E',
    }
  }
}

const t2 = {
  program:
    [ 0, 11, 12, 0, 11, 8, 0, 8, 0, 8, 7, 0, 8, 5 ].map(dropBar6(sixteenth))
  ,
  config: {
    title: "Deftones - My Own Summer",
    tuning: {
      s1: 'E',
      s2: 'B',
      s3: 'G',
      s4: 'D',
      s5: 'A',
      s6: 'D',
    }
  }
};

const t3 = {
  program: [
    // ...repeat(9)(s7(de(1))),
    s7(de(1)),
    s7(de(2)),
    s7(de(3)),
    s7(de(4)),
    s7(de(5)),
    s7(de(6)),
    s7(de(7)),
    s7(de(8)),
    s7(de(9)),
  ],
  config: {
    title: "Zander Noriega - Steredenn",
    tuning: {
      s1: 'Eb',
      s2: 'Bb',
      s3: 'Gb',
      s4: 'Db',
      s5: 'Ab',
      s6: 'Eb',
      s7: 'Ab',
    }
  }
};

const q = quarter;
const h = half;
const stac = noteCons => fret => {
  const n = noteCons(fret);
  const halved = { ...n, length: n.length / 2 };
  return [
    halved,
    silence(halved)
  ];
};

const t4 = {
  program: [
    // bar 1
    s4(stac(h)(9)),
    s4(stac(h)(14)),
    // bar 2
    s4(stac(q)(12)),
    s4(stac(q)(11)),
    s4(stac(h)(9)),
    // bar 3
    s4(stac(q)(9)),
    s4(stac(q)(14)),
    s3(stac(q)(12)),
    s3(stac(e)(11)),
    s3(stac(e)(10)),
    // bar 4
    s3(stac(q)(11)),

    s4(sixteenth(9)),
    s4(sixteenth(14)),
    s3(sixteenth(12)),
    s2(sixteenth(11)),

    s1(sixteenth(9)),
    s1(sixteenth(14)),
    s1(sixteenth(9)),
    s2(sixteenth(11)),

    s3(sixteenth(12)),
    s4(sixteenth(14)),
    s4(sixteenth(12)),
    s4(sixteenth(11)),

    // bar 5
    s4(sixteenth(14)),
  ],
  config: {
    title: "Zander Noriega - Exercise 1",
    tuning: {
      s1: 'Eb',
      s2: 'Bb',
      s3: 'Gb',
      s4: 'Db',
      s5: 'Ab',
      s6: 'Eb',
      s7: 'Ab',
    }
  }
};

function runTest(t) {
  log(renderASCII(t.program, t.config));
}

[
  t0,
  t1,
  t2,
  t3,
  t4
].forEach(runTest);
