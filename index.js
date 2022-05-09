// lib debug
const log = console.log.bind(console);
const toString = JSON.stringify.bind(JSON);
const logString = x => log(toString(x));

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
  if (!xs.every(isNumber)) {
    throw "checkAllAreNumbers";
  }
}

function checkAllAreNotes(xs) {
  if (!xs.every(isNote)) {
    throw `checkAllAreNotes: ${toString(xs)}`;
  }
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

const renderNote = note => c => {
  checkAllAreNotes([note]);
  // minus 1 because we don't want sustain when sustainLength = 1.
  const sustainLength = (note.length / (1/16)) - 1;
  // let s = '';
  let s = note.fretRender + ' ';
  for (let i = 0; i < sustainLength; i++) {
    s += c;
  }
  return s;
};

const renderSilentString = (currentLine, n) => {
  // const silenced = silence(n);
  // const silenced = { ...silence(n), fretRender: '-'.padEnd(n.fretRender.length, ' ') };
  const silenced = { ...silence(n), fretRender: '-'.padEnd(n.fretRender.length, ' ') };
  const assert = require('assert');
  assert.equal(silenced.fretRender.trim(), '-');
  let isChordStart = n.inChord == 'start';
  if (isChordStart) {
    return  currentLine + renderNote(silenced)('- ');
  } else if (n.inChord == 'in' || n.inChord == 'end') {
    return currentLine;
  } else {
    return currentLine + renderNote(silenced)('- ');
  }
}

const renderActiveString = (currentLine, n, lastChordStartIndex) => {
  const isChordStart = n.inChord == 'start';
  if (isChordStart) {
    return currentLine + renderNote(n)('= ');
  } else if (n.inChord == 'in' || n.inChord == 'end') {
    return currentLine.substring(0, lastChordStartIndex) + renderNote(n)('= ');
  } else {
    return currentLine + renderNote(n)('= ');
  }
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
  };
  const notes = withRenderedFrets(rawNotes, tuning);
  let lastChordStartIndex;
  // (number, string)[]
  // where number is an index, and string is the message to place at that index
  let annotations = [];
  const processed = notes.reduce((acc, n) => {
    const lines = { ...acc.lines };
    // sort of a "playhead" along the "tracks"
    let annotationPosition = 0;
    for (let i = 1; i <= defaultStrings.length; i++) {
      let currentLine = acc.lines[`s${i}`];
      // step the "playhead" forward (for annotation purposes)
      annotationPosition = currentLine.length;
      let isSilentString = i !== n.string;
      let isChordStart = n.inChord == 'start';
      let updatedLine;
      if (isSilentString) {
        updatedLine = renderSilentString(currentLine, n);
      } else {
        if (isChordStart) {
          lastChordStartIndex = currentLine.length;
        }
        updatedLine = renderActiveString(currentLine, n, lastChordStartIndex);
      }
      lines[`s${i}`] = updatedLine;
    }
    if (n.annotation) {
      annotations.push([annotationPosition, n.annotation]);
    }
    return { ...acc, lines };
  }, initialState);
  return { ...processed, annotations: renderAnnotations(annotations) };
};

const formatLines = (processed, tuning) => {
  const lines = processed.lines;
  const formattedLines = Object.keys(lines).reverse().reduce((acc, k) => {
    return {
      ...acc,
      // this number here "32" is hardcoded with NO awareness of note lengths, etc.
      // only works for neat simple parts with single-digit fret numbers.
      // must rethink. 
      // use note.length or something.
      [k]: splitStringIn(32)(lines[k]).map(s => {
        const assert = require('assert');
        // assert.equal(s, s.trim());
        return `${tuning[k]} ${s}`;
      })
    };
  }, {});
  const annotations = processed.annotations;
  formattedLines['::'] = splitStringIn(32)(annotations).map(s => 
    `${tuning[Object.keys(tuning)[0]].replace(/./g, ' ')} ${s}`
  );
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

function renderASCII(program, tuning, title) {
  // const settings = flatten(program).map(modifiers).filter(isSetting);
  const notes = flatten(program).map(modifiers).filter(isNote);
  checkAllAreNotes(notes);
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
  title: "Meshuggah - New Millenium Cyanide Christ",
  program: [
    ...trim(8)(flatRepeat(15)([
      ...s7([chuggies, de(2), pe(0), pe(0)]),
      ...s7([chuggies, de(2), pe(0), pe(0)]),
      ...s7([chuggies]),
    ]))
  ],
  tuning: {
    s1: 'Eb',
    s2: 'Bb',
    s3: 'Gb',
    s4: 'Db',
    s5: 'Ab',
    s6: 'Eb',
    s7: 'Bb',
  }
};

// Test 1
const t1 = {
  title: "Nirvana - Smells Like Teen Spirit",
  program: [
    powerChord6(de)(1),
    powerChord6(s)(1),
    powerChord6(e)(1),
    powerChord6(ss)(1),
    ...repeat(3)(powerChord6(ms)(1)),
    powerChord5(e)(1),
    ...repeat(2)(powerChord5(s)(1)),
    open3(5)(e),
    powerChord6(de)(4),
    powerChord6(s)(4),
    powerChord6(e)(4),
    ...repeat(4)(powerChord6(ms)(4)),
    powerChord5(e)(4),
    ...repeat(2)(powerChord5(s)(4)),
    powerChord5(ss)(4),
    open3(5)(sixteenth)
  ],
  tuning: {
    s1: 'E',
    s2: 'B',
    s3: 'G',
    s4: 'D',
    s5: 'A',
    s6: 'E',
  }
}

const t3 = {
  title: "Deftones - My Own Summer",
  program:
    [ 0, 11, 12, 0, 11, 8, 0, 8, 0, 8, 7, 0, 8, 5 ].map(dropBar6(sixteenth))
  ,
  tuning: {
    s1: 'E',
    s2: 'B',
    s3: 'G',
    s4: 'D',
    s5: 'A',
    s6: 'D',
  }
};

function runTest(t) {
  log(renderASCII(t.program, t.tuning, t.title));
}

runTest(t0);
runTest(t1);
runTest(t3);

const assert = require('assert');
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
