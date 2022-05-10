// lib debug
const log = console.log.bind(console);
const toString = JSON.stringify.bind(JSON);
const logString = x => log(toString(x));
const assert = require('assert');

// lib typecheck

const isNumber = x => typeof x == "number";
const isString = x => typeof x == "string";
const isObject = x => typeof x == "object";
const isDefined = x => x !== undefined;

// lib string

const splitStringIn = n => s => {
  checkAllAreStrings([s]);
  const r = s.split('').reduce((acc, c) => {
    if (acc.current.length === n) {
      return {
        ...acc,
        current: [c],
        total: acc.total.concat([acc.current])
      };
    } else {
      return {
        ...acc,
        current: acc.current.concat([c]),
      };
    }
  }, { current: [], total: [] });
  return r.total.concat([r.current]).map(xs => xs.join(''));
};

// lib collection

const repeat = n => x => {
  checkAllAreNumbers([n]);
  checkAllAreDefined([x]);
  let xs = [];
  for (let i = 0; i < n; i++) {
    xs.push(x);
  }
  return xs;
};

const flatRepeat = n => x => repeat(n)(x).flatMap(x => x);

const trim = n => xs => {
  const notes = flatten(xs).map(modifiers);
  checkAllAreNotes(notes);
  let totalLength = 0;
  let trimmed = [];
  for (let i = 0; i < xs.length && totalLength < n; i++) {
    trimmed.push(notes[i]);
    totalLength += notes[i].length;
  }
  return trimmed;
}

// constructors - typecheck
const isGroup = x => Array.isArray(x.notes);
const isNote = x => x.fret !== undefined;
const isTuning = x =>
  isObject(x) && Object.keys(x).every(k => k.match(/^s\d$/) !== null);

function checkAllAreDefined(xs) {
  if (!xs.every(isDefined)) {
    throw "checkAllAreDefined";
  }
}

function checkIsArray(x) {
  if (!Array.isArray(x)) {
    throw "checkIsArray";
  }
}

function checkAllAreStrings(xs) {
  if (!xs.every(isString)) {
    throw "checkAllAreStrings";
  }
}

function checkAllAreNumbers(xs) {
  xs.forEach(x => {
    assert(isNumber(x), `${x} is a number`);
  });
}

function checkAllAreNotes(xs) {
  if (!xs.every(isNote)) {
    throw `checkAllAreNotes: ${toString(xs)}`;
  }
}

function checkAllNotesTuningConsistency(notes, tuning) {
  const stringQty = Object.keys(tuning).length;
  notes.forEach(n => {
    assert(n.string !== undefined, `note (${toString(n)}) has string`);
    assert(n.string <= stringQty, `note (${toString(n)}) has string number <= to amount of strings in tuning (${stringQty})`);
  });
}

function checkAllNotesHaveStrings(notes) {
  if (!notes.every(n => n.string !== undefined)) {
    throw "checkAllNotesHaveStrings";
  }
}

function checkAllAreTuning(xs) {
  if (!xs.every(isTuning)) {
    throw "checkAllAreTuning";
  }
}

function checkNoDuplicates(xs) {
  const ys = new Set();
  xs.forEach(x => {
    ys.add(x);
  });
  if (ys.size !== xs.length) {
    throw `checkNoDuplicates: ${toString(xs)}`;
  }
}

function checkAllEqual(xs) {
  const ys = new Set();
  xs.forEach(x => {
    ys.add(x);
  });
  if (ys.size !== 1) {
    throw `checkAllEqual: ${JSON.stringify(xs)}`;
  }
}

function checkNumberGreaterThan(a,b) {
  checkAllAreNumbers([a, b]);
  if (a <= b) {
    throw `checkNumberGreaterThan(${a}, ${b})`;
  }
}

const checkNumberGreaterThanZero = n => checkNumberGreaterThan(n, 0);

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

// (Note|Group)[] => Note[]
const flatten = program => {
  return program.reduce((acc, x) => {
    return acc.concat(x.notes ? x.notes : x);
  }, []);
};

// number => A => A
const string = n => x => {
  if (isGroup(x)) {
    return { ...x, notes: x.notes.map(string(n)) };
  } else if (isNote(x)) {
    return { ...x, string: n };
  } else if (Array.isArray(x)) {
    return x.map(string(n));
  } else {
    throw new Error(`Unknown type: ${JSON.stringify(x)}`);
  }
}
const s7 = string(7);
const s6 = string(6);
const s5 = string(5);
const s4 = string(4);
const s3 = string(3);
const s2 = string(2);
const s1 = string(1);

const modifiers = note => {
  const n = { ...note };
  delete n.dotted;
  return note.dotted ? {...n, length: n.length + n.length / 2 } : n;
}

const chord = xs => {
  const notes = flatten(xs).map(modifiers);
  checkAllAreNotes(notes);
  checkNoDuplicates(notes.map(x => x.string));
  checkAllEqual(notes.map(x => x.length));
  const length = notes.length;
  const marked = notes.map((x, i) =>
    ({ ...x,
      inChord: i == 0          ? 'start'
             : i == length - 1 ? 'end'
             : 'in'})
  );
  return marked;
}
const bar = size => rootString => noteCons => rootFret => {
  checkNumberGreaterThan(size, 1);
  checkNumberGreaterThan(rootString, 1);
  checkNumberGreaterThan(rootFret, -1);
  checkNumberGreaterThan(rootString + 1, size);
  let notes = [];
  for (let i = rootString; i > 0 && notes.length < size; i--) {
    notes.push(string(i)(noteCons(rootFret)))
  }
  return chord(notes);
}
const dropBar = bar(3);
const dropBar7 = dropBar(7);
const dropBar6 = dropBar(6);
const open = size => rootString => noteCons => bar(size)(rootString)(noteCons)(0);
const open3 = open(3);

const powerChord = rootString => noteCons => rootFret => {
  checkNumberGreaterThan(rootString, 2);
  checkNumberGreaterThanZero(rootFret);
  return chord([
    string(rootString)(noteCons(rootFret)),
    string(rootString-1)(noteCons(rootFret + 2)),
    string(rootString-2)(noteCons(rootFret + 2)),
  ]);
};
const powerChord7 = powerChord(7);
const powerChord6 = powerChord(6);
const powerChord5 = powerChord(5);
const annotate = a => x => {
  if (isNote(x)) {
    const note = x;
    const marked = { ...note, annotation: a };
    return marked;
  } else if (isGroup(x)) {
    return { ...x, notes: x.notes.map(annotate(a)) };
  } else if (Array.isArray(x)) {
    return x.map(annotate(a));
  } else {
    throw `Cannot annotate: ${toString(x)}`;
  }
}

// constructors - performance
const muted = note => ({...note, fret: 'x'});
const palmMuted = annotate("'");

// constructors - convenience
let e = eighth;
let de = fret => dotted(eighth(fret));
let s = sixteenth;
let ss = fret => silence(s(fret));
let ms = fret => muted(s(fret));
let pe = fret => palmMuted(eighth(fret));

const renderNote = (note, startTime) => c => {
  checkAllAreNotes([note]);
  checkAllAreNumbers([startTime]);
  // log(`note ${note.fretRender} starts at ${startTime}`);
  const barSep = "[bar-end]";
  const quanta = 1/16;
  let quantaSum = 0;
  // minus 1 because we don't want sustain when sustainLength = 1.
  const sustainLength = (note.length / quanta) - 1;
  // let s = '';
  let s = note.fretRender + ' ';
  quantaSum += quanta; // meaning "add bit of the note duration to the bar."
  // log(`${note.fret} startTime + quantaSum (${startTime} + ${quantaSum})`, startTime + quantaSum);
  if ((startTime + quantaSum) % 1 == 0) {
    s += barSep;
  }
  for (let i = 0; i < sustainLength; i++) {
    s += c;
    quantaSum += quanta;
    // log(`    ${note.fret} startTime + quantaSum (${startTime} + ${quantaSum})`, startTime + quantaSum);
    if ((startTime + quantaSum) % 1 == 0) {
      s += barSep;
    }
  }
  return s;
};

const renderSilentString = (currentLine, n, totalLength) => {
  // const silenced = silence(n);
  // const silenced = { ...silence(n), fretRender: '-'.padEnd(n.fretRender.length, ' ') };
  const silenced = { ...silence(n), fretRender: '-'.padEnd(n.fretRender.length, ' ') };
  assert.equal(silenced.fretRender.trim(), '-');
  let isChordStart = n.inChord == 'start';
  if (isChordStart) {
    return  currentLine + renderNote(silenced, totalLength)('- ');
  } else if (n.inChord == 'in' || n.inChord == 'end') {
    return currentLine;
  } else {
    return currentLine + renderNote(silenced, totalLength)('- ');
  }
}

const renderActiveStringChord = (currentLine, n, lastChordStartIndex, totalLength) => {
  assert(lastChordStartIndex !== undefined);
  const isChordStart = n.inChord == 'start';
  if (isChordStart) {
    return currentLine + renderNote(n, totalLength)('= ');
  } else if (n.inChord == 'in' || n.inChord == 'end') {
    return currentLine.substring(0, lastChordStartIndex) + renderNote(n, totalLength)('= ');
  } else {
    throw new Error('Invalid call to renderActiveStringChord');
  }
}

const renderActiveStringSingleNote = (currentLine, n, totalLength) => {
  const isChordStart = n.inChord == 'start';
  return currentLine + renderNote(n, totalLength)('= ');
}

const renderHeader = (processed, title) => {
  const lines = processed.lines;
  const headerText = `Title: ${title}`;
  const headerBar = repeat(headerText.length)('=').join('');
  const header = [ headerBar, headerText, headerBar ].join('\n');
  return header;
};
const renderAnnotations = annotations => {
  checkIsArray(annotations);
  if (annotations.length == 0) {
    return '';
  } else {
    const maxIndex = annotations.concat([]).reverse()[0][0];
    const annotationsObj = annotations.reduce((acc,a) => {
      return { ...acc, [a[0]]: a[1] };
    }, {});
    let text = ""
    for (let i = 0; i <= maxIndex; i++) {
      text += annotationsObj[i] || ' ';
    }
    return text;
  }
};

const asColumns = (notes, tuning) => {
  checkAllAreTuning([tuning]);
  checkAllAreNotes(notes);
  const columns = notes.reduce((acc, n) => {
    let columns = acc.columns.concat([]);
    let currentColumn = acc.currentColumn.concat([]);
    let stringQty = Object.keys(tuning).length;
    if (n.inChord == 'end' || n.inChord == undefined) {
      currentColumn.push(n);
      columns.push(currentColumn);
      currentColumn = [];
    } else {
      currentColumn.push(n);
    }
    return { ...acc, currentColumn, columns }
  }, { currentColumn: [], columns: [] }).columns;
  return columns;
}

const addPadding = columns => {
  const paddedColumns = columns.map(col => {
    const maxLength = col.reduce((acc, note) => {
      const length = `${note.fret}`.length;
      return length > acc ? length : acc;
    }, 0);
    return col.map(note => 
      ({ ...note, fretRender: `${note.fret}`.padEnd(maxLength, ' ') })
    );
  });
  return paddedColumns;
}

const columnsToArray = columns => {
  return columns.flatMap(x => x);
};

const withRenderedFrets = (notes, tuning) => {
  const columns = asColumns(notes, tuning);
  const paddedColumns = addPadding(columns);
  return columnsToArray(paddedColumns);
};

const renderStrings = (rawNotes, tuning) => {
  checkAllAreTuning([tuning]);
  checkAllAreNotes(rawNotes);
  const defaultStrings = Object.keys(tuning).sort((a, b) => a > b ? -1 : 1);
  const initialState = {
    lines: defaultStrings.reduce((acc, k) => ({ ...acc, [k]: '' }), {}),
    totalLength: 0,
  };
  const notes = withRenderedFrets(rawNotes, tuning);
  let lastChordStartIndex;
  // (number, string)[]
  // where number is an index, and string is the message to place at that index
  let annotations = [];
  const processed = notes.reduce((acc, n) => {
    const lines = { ...acc.lines };
    let totalLength = acc.totalLength;
    // sort of a "playhead" along the "tracks"
    let annotationPosition = 0;
    const FIRST_STRING = 1;
    for (let i = FIRST_STRING; i <= defaultStrings.length; i++) {
      // log(`process string ${i}`, n);
      let tabLineKey = `s${i}`;
      // one tab line per string
      let currentTabLine = acc.lines[tabLineKey];
      // step the "playhead" forward (for annotation purposes)
      annotationPosition = currentTabLine.length;
      let isSilentString = i !== n.string;
      let updatedTabLine;
      if (isSilentString) {
        updatedTabLine = renderSilentString(currentTabLine, n, totalLength);
      } else {
        if (n.inChord !== undefined) {
          let isChordStart = n.inChord == 'start';
          if (isChordStart) {
            lastChordStartIndex = currentTabLine.length;
          }
          updatedTabLine = renderActiveStringChord(currentTabLine, n, lastChordStartIndex, totalLength);
        } else {
          updatedTabLine = renderActiveStringSingleNote(currentTabLine, n, totalLength);
        }
      }
      lines[tabLineKey] = updatedTabLine;
    }
    if (n.annotation) {
      annotations.push([annotationPosition, n.annotation]);
    }
    // let totalLength = acc.totalLength;
    if (n.inChord == undefined || n.inChord == "end") {
      // log(`totalLength += n.length (${toString(n)})`);
      totalLength += n.length;
    }
    // return { ...acc, lines, totalLength: acc.totalLength + n.length };
    return { ...acc, lines, totalLength };
  }, initialState);
  log(`Total Length (i.e. Bars): (${processed.totalLength})`);
  return { ...processed, annotations: renderAnnotations(annotations) };
};

const formatLines = (processed, tuning) => {
  const lines = processed.lines;
  const formattedLines = Object.keys(lines).reverse().reduce((acc, k) => {
    return {
      ...acc,
      [k]: lines[k].split('[bar-end]').filter(s => s.length > 0).map(s => `${tuning[k]} ${s}`)
    };
  }, {});
  /*
  const annotations = processed.annotations;
  formattedLines['::'] = splitStringIn(32)(annotations).map(s => 
    `${tuning[Object.keys(tuning)[0]].replace(/./g, ' ')} ${s}`
  );
  */
  return formattedLines;
};

const renderFormatterLines = formattedLines => {
  const o = {};
  Object.keys(formattedLines).forEach(k => {
    formattedLines[k].forEach((s,i) => {
      o[i] = (o[i] || []).concat([s])
    });
  });
  return Object.keys(o).map((k) => {
    return o[k].join('\n');
  }).join('\n\n');
};

function renderASCII(program, config) {
  const { tuning, title } = config;
  // const settings = flatten(program).map(modifiers).filter(isSetting);
  const notes = flatten(program).map(modifiers).filter(isNote);
  checkAllAreNotes(notes);
  checkAllNotesTuningConsistency(notes, tuning);
  checkAllNotesHaveStrings(notes);
  const processed = renderStrings(notes, tuning);
  const formattedLines = formatLines(processed, tuning);
  const out = [
    renderHeader(processed, title),
    renderFormatterLines(formattedLines)
  ].join('\n');
  return out;
}

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

    s4(stac(sixteenth)(9)),
    s4(stac(sixteenth)(14)),
    s3(stac(sixteenth)(12)),
    s2(stac(sixteenth)(11)),

    s1(stac(sixteenth)(9)),
    s1(stac(sixteenth)(14)),
    s1(stac(sixteenth)(9)),
    s2(stac(sixteenth)(11)),

    s3(stac(sixteenth)(12)),
    s4(stac(sixteenth)(14)),
    s4(stac(sixteenth)(12)),
    s4(stac(sixteenth)(11)),

    s3(stac(q)(14)),
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

const tests = {
  flatRepeat: () => {
    const xs0 = [
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies]),
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies]),
    ];
    const xs1 = flatRepeat(2)([
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies]),
    ]);
    assert(toString(xs0) === toString(xs1));
  },
  powerChord6: () => {
    const p0 = chord([
      s6(dotted(eighth(1))),
      s5(dotted(eighth(3))),
      s4(dotted(eighth(3))),
    ]);
    const p1 = powerChord6(de)(1);
    assert(toString(p0) === toString(p1));
  },
  open3: () => {
    const x = open3(5)(e);
    const y = chord([
      s5(e(0)),
      s4(e(0)),
      s3(e(0)),
    ]);
    assert.deepEqual(x, y);
  }
};
Object.keys(tests).forEach(k => {
  tests[k]();
});
