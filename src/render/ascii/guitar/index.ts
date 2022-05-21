import {
  Guitar,
  GuitarNote,
  GuitarChordNote,
  silence,
} from '../../../music/guitar/primitives';
import { Program, compile } from '../../../music/program';
import { isSilence } from '../../../music/guitar/predicates';
import { Tuning, pitch } from '../../../music/guitar/tuning';
import { columnsToArray, repeat } from '../../../std';
import { asColumns } from '../../../music/algebra';

type SustainChar = string;
type Renderable<T> = T & { fretRender: string };

const reachedBar = (startTime: number, quantaSum: number): boolean =>
  (startTime + quantaSum) % 1 == 0;

export const renderNote =
  (note: Renderable<GuitarNote>, startTime: number) =>
  (c: SustainChar): string => {
    const barSep = '[bar-end]';
    const quanta = 1 / 16;
    let quantaSum = 0;
    // minus 1 because we don't want sustain when sustainLength = 1.
    // i.e. the note occupies just one "quanta" / ascii "slot."
    const sustainLength = note.length / quanta - 1;
    let s = note.fretRender + ' ';
    quantaSum += quanta; // meaning "add bit of the note duration to the bar."
    if (reachedBar(startTime, quantaSum)) {
      s += barSep;
    }
    for (let i = 0; i < sustainLength; i++) {
      s += c;
      quantaSum += quanta;
      if (reachedBar(startTime, quantaSum)) {
        s += barSep;
      }
    }
    return s;
  };

// As in each ASCII line
type Line = string;

// The total sum of `Note.length`'s.
// Serving a "running time"-ish role for now.
// To make decisions such as when to insert a bar separator.
// In the future we might need to keep track of proper,
// independent (musically) "global" running time.
type TotalLength = number;

export const renderSilentString = (
  currentLine: Line,
  n: Renderable<GuitarNote>,
  t: TotalLength
): Line => {
  const silenced: Renderable<GuitarNote> = {
    ...silence(n),
    fretRender: '-'.padEnd(n.fretRender.length, ' '),
  };
  let isChordStart = n.inChord == 'start';
  if (isChordStart) {
    return currentLine + renderNote(silenced, t)('- ');
  } else if (n.inChord == 'in' || n.inChord == 'end') {
    return currentLine;
  } else {
    return currentLine + renderNote(silenced, t)('- ');
  }
};

export const renderActiveStringChord = (
  currentLine: Line,
  n: Renderable<GuitarChordNote>,
  lastChordStartIndex: number,
  t: TotalLength
): Line => {
  const isChordStart = n.inChord == 'start';
  if (isChordStart) {
    return currentLine + renderNote(n, t)('= ');
  } else if (n.inChord == 'in' || n.inChord == 'end') {
    return (
      currentLine.substring(0, lastChordStartIndex) + renderNote(n, t)('= ')
    );
  } else {
    return currentLine;
  }
};

export const renderActiveStringSingleNote = (
  currentLine: Line,
  n: Renderable<GuitarNote>,
  t: TotalLength
): Line => {
  let sustainSymbol = isSilence(n) ? '- ' : '= ';
  return currentLine + renderNote(n, t)(sustainSymbol);
};

export const renderHeader = (title: string): string => {
  const headerText = `Title: ${title}`;
  const headerBar = repeat(headerText.length)('=').join('');
  const header = [headerBar, headerText, headerBar].join('\n');
  return header;
};

export const addPadding = (
  columns: GuitarNote[][]
): Renderable<GuitarNote>[][] => {
  const paddedColumns = columns.map((col: GuitarNote[]) => {
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

export const withRenderedFrets = (
  notes: GuitarNote[]
): Renderable<GuitarNote>[] => {
  const columns = asColumns(notes);
  const paddedColumns = addPadding(columns);
  return columnsToArray(paddedColumns);
};

type Lines = { [k in number]: string };

const emptyLinesForTuning = (tuning: Tuning): Lines => {
  if (tuning.type === 6) {
    return {
      1: '',
      2: '',
      3: '',
      4: '',
      5: '',
      6: '',
    };
  } else {
    return {
      1: '',
      2: '',
      3: '',
      4: '',
      5: '',
      6: '',
      7: '',
    };
  }
};

type Processed = { lines: Lines };

export const renderStrings = (
  rawNotes: GuitarNote[],
  tuning: Tuning
): Processed => {
  // const defaultStrings = Object.keys(tuning).sort((a, b) => (a > b ? -1 : 1));
  const emptyLines: Lines = emptyLinesForTuning(tuning);
  const initialState: { lines: Lines; totalLength: TotalLength } = {
    lines: emptyLines,
    totalLength: 0,
  };
  const notes: Renderable<GuitarNote>[] = withRenderedFrets(rawNotes);
  let lastChordStartIndex: number | undefined = undefined;
  // (number, string)[]
  // where number is an index, and string is the message to place at that index
  const processed = notes.reduce((acc, n: Renderable<GuitarNote>) => {
    const lines = { ...acc.lines };
    let totalLength = acc.totalLength;
    // sort of a "playhead" along the "tracks"
    const FIRST_STRING = 1;
    for (let i = FIRST_STRING; i <= Object.keys(emptyLines).length; i++) {
      let tabLineKey = i;
      // one tab line per string
      let currentTabLine = acc.lines[tabLineKey];
      if (currentTabLine !== undefined) {
        // step the "playhead" forward (for annotation purposes)
        let isSilentString = i !== n.str;
        let updatedTabLine = '';
        if (isSilentString) {
          updatedTabLine = renderSilentString(currentTabLine, n, totalLength);
        } else {
          let inChord = n.inChord;
          if (inChord !== undefined) {
            let chordNote: Renderable<GuitarChordNote> = { ...n, inChord };
            let isChordStart = inChord == 'start';
            if (isChordStart) {
              lastChordStartIndex = currentTabLine.length;
            }
            if (lastChordStartIndex) {
              updatedTabLine = renderActiveStringChord(
                currentTabLine,
                chordNote,
                lastChordStartIndex,
                totalLength
              );
            }
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
    }
    if (n.inChord == undefined || n.inChord == 'end') {
      totalLength += n.length;
    }
    return { ...acc, lines, totalLength };
  }, initialState);
  return processed;
};

type FormattedLines = { [k in number]: string[] };

export const formatLines = (
  processed: Processed,
  tuning: Tuning
): FormattedLines => {
  const lines = processed.lines;
  const formattedLines = Object.keys(lines)
    .reverse()
    .reduce((acc, k: string) => {
      const l: Line | undefined = lines[+k];
      return l
        ? {
            ...acc,
            [k]: l
              .split('[bar-end]')
              .filter((s: string) => s.length > 0)
              .map((s: string) => `${pitch(+k)(tuning)} ${s}`),
          }
        : acc;
    }, {});
  return formattedLines;
};

export const renderFormattedLines = (
  formattedLines: FormattedLines
): string => {
  const o: { [key: number]: string[] } = {};
  Object.keys(formattedLines).forEach((k: string) => {
    const xs: Line[] | undefined = formattedLines[+k];
    if (xs) {
      xs.forEach((s: Line, i: number) => {
        o[i] = (o[i] || []).concat([s]);
      });
    }
  });
  return Object.keys(o)
    .map((k: string) => {
      const s: string[] | undefined = o[+k];
      return s ? s.join('\n') : '';
    })
    .join('\n\n');
};

type Config = { tuning: Tuning; title: string };

export const renderASCII = (
  program: Program<Guitar>,
  config: Config
): string => {
  const { tuning, title } = config;
  const notes = compile(program);
  const processed = renderStrings(notes, tuning);
  const formattedLines = formatLines(processed, tuning);
  const out = [renderHeader(title), renderFormattedLines(formattedLines)].join(
    '\n'
  );
  return out;
};
