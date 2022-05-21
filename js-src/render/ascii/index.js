const { columnsToArray, assert, repeat } = require('../../std');

const { asColumns } = require('../../music/algebra');

const { modifiers } = require('../../music/composition');

const { silence } = require('../../music/primitives');

const { flatten } = require('../../music/flatten');

const { isSilence, isNote } = require('../../music/predicates');

const {
  checkAllAreNotes,
  checkAllAreNumbers,
  checkAllNotesTuningConsistency,
  checkAllNotesHaveStrings,
  checkAllAreTuning,
  checkIsArray,
} = require('../../music/exceptions');

// src/render/ascii/guitar/index.ts
const renderNote = (note, startTime) => (c) => {
  checkAllAreNotes([note]);
  checkAllAreNumbers([startTime]);
  const barSep = '[bar-end]';
  const quanta = 1 / 16;
  let quantaSum = 0;
  // minus 1 because we don't want sustain when sustainLength = 1.
  const sustainLength = note.length / quanta - 1;
  // let s = '';
  let s = note.fretRender + ' ';
  quantaSum += quanta; // meaning "add bit of the note duration to the bar."
  if ((startTime + quantaSum) % 1 == 0) {
    s += barSep;
  }
  for (let i = 0; i < sustainLength; i++) {
    s += c;
    quantaSum += quanta;
    if ((startTime + quantaSum) % 1 == 0) {
      s += barSep;
    }
  }
  return s;
};

// src/render/ascii/guitar/index.ts
const renderSilentString = (currentLine, n, totalLength) => {
  // const silenced = silence(n);
  // const silenced = { ...silence(n), fretRender: '-'.padEnd(n.fretRender.length, ' ') };
  const silenced = {
    ...silence(n),
    fretRender: '-'.padEnd(n.fretRender.length, ' '),
  };
  assert.equal(silenced.fretRender.trim(), '-');
  let isChordStart = n.inChord == 'start';
  if (isChordStart) {
    return currentLine + renderNote(silenced, totalLength)('- ');
  } else if (n.inChord == 'in' || n.inChord == 'end') {
    return currentLine;
  } else {
    return currentLine + renderNote(silenced, totalLength)('- ');
  }
};

// src/render/ascii/guitar/index.ts
const renderActiveStringChord = (
  currentLine,
  n,
  lastChordStartIndex,
  totalLength
) => {
  assert(lastChordStartIndex !== undefined);
  const isChordStart = n.inChord == 'start';
  if (isChordStart) {
    return currentLine + renderNote(n, totalLength)('= ');
  } else if (n.inChord == 'in' || n.inChord == 'end') {
    return (
      currentLine.substring(0, lastChordStartIndex) +
      renderNote(n, totalLength)('= ')
    );
  } else {
    throw new Error('Invalid call to renderActiveStringChord');
  }
};

// src/render/ascii/guitar/index.ts
const renderActiveStringSingleNote = (currentLine, n, totalLength) => {
  // assert.doesNotMatch(n.fret.toString(), /-/);
  let sustainSymbol = isSilence(n) ? '- ' : '= ';
  return currentLine + renderNote(n, totalLength)(sustainSymbol);
};

// src/render/ascii/guitar/index.ts
const renderHeader = (processed, title) => {
  const lines = processed.lines;
  const headerText = `Title: ${title}`;
  const headerBar = repeat(headerText.length)('=').join('');
  const header = [headerBar, headerText, headerBar].join('\n');
  return header;
};

const renderAnnotations = (annotations) => {
  checkIsArray(annotations);
  if (annotations.length == 0) {
    return '';
  } else {
    const maxIndex = annotations.concat([]).reverse()[0][0];
    const annotationsObj = annotations.reduce((acc, a) => {
      return { ...acc, [a[0]]: a[1] };
    }, {});
    let text = '';
    for (let i = 0; i <= maxIndex; i++) {
      text += annotationsObj[i] || ' ';
    }
    return text;
  }
};

// src/render/ascii/guitar/index.ts
const addPadding = (columns) => {
  const paddedColumns = columns.map((col) => {
    const maxLength = col.reduce((acc, note) => {
      const length = `${note.fret}`.length;
      return length > acc ? length : acc;
    }, 0);
    return col.map((note) => ({
      ...note,
      fretRender: `${note.fret}`.padEnd(maxLength, ' '),
    }));
  });
  return paddedColumns;
};

// src/render/ascii/guitar/index.ts
const withRenderedFrets = (notes, tuning) => {
  const columns = asColumns(notes, tuning);
  const paddedColumns = addPadding(columns);
  return columnsToArray(paddedColumns);
};

// src/render/ascii/guitar/index.ts
const renderStrings = (rawNotes, tuning) => {
  checkAllAreTuning([tuning]);
  checkAllAreNotes(rawNotes);
  const defaultStrings = Object.keys(tuning).sort((a, b) => (a > b ? -1 : 1));
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
          updatedTabLine = renderActiveStringChord(
            currentTabLine,
            n,
            lastChordStartIndex,
            totalLength
          );
        } else {
          updatedTabLine = renderActiveStringSingleNote(
            currentTabLine,
            n,
            totalLength
          );
        }
      }
      lines[tabLineKey] = updatedTabLine;
    }
    if (n.annotation) {
      annotations.push([annotationPosition, n.annotation]);
    }
    // let totalLength = acc.totalLength;
    if (n.inChord == undefined || n.inChord == 'end') {
      totalLength += n.length;
    }
    // return { ...acc, lines, totalLength: acc.totalLength + n.length };
    return { ...acc, lines, totalLength };
  }, initialState);
  return { ...processed, annotations: renderAnnotations(annotations) };
};

const formatLines = (processed, tuning) => {
  const lines = processed.lines;
  const formattedLines = Object.keys(lines)
    .reverse()
    .reduce((acc, k) => {
      return {
        ...acc,
        [k]: lines[k]
          .split('[bar-end]')
          .filter((s) => s.length > 0)
          .map((s) => `${tuning[k]} ${s}`),
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

const renderFormatterLines = (formattedLines) => {
  const o = {};
  Object.keys(formattedLines).forEach((k) => {
    formattedLines[k].forEach((s, i) => {
      o[i] = (o[i] || []).concat([s]);
    });
  });
  return Object.keys(o)
    .map((k) => {
      return o[k].join('\n');
    })
    .join('\n\n');
};

function renderASCII(program, config) {
  const { tuning, title } = config;
  const notes = flatten(program).map(modifiers).filter(isNote);
  checkAllAreNotes(notes);
  checkAllNotesTuningConsistency(notes, tuning);
  checkAllNotesHaveStrings(notes);
  const processed = renderStrings(notes, tuning);
  const formattedLines = formatLines(processed, tuning);
  const out = [
    renderHeader(processed, title),
    renderFormatterLines(formattedLines),
  ].join('\n');
  return out;
}

exports.renderASCII = renderASCII;
