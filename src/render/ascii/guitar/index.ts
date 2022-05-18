import { GuitarNote, silence } from '../../../music/guitar/primitives';

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
) => {
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
