import { Note, note, dotted, Length, ChordNote } from '../primitives';

// Guitar

export type GuitarString = number;

export type Fret = number | '-';

export type Guitar = { str: GuitarString; fret: Fret };

export type GuitarNote = Note<Guitar>;

export type GuitarChordNote = ChordNote<Guitar>;

export const guitarNote =
  (length: Length) =>
  (fret: Fret, str: GuitarString = 7): GuitarNote =>
    note(length)({ str, fret });

export const half: (x: Fret) => GuitarNote = guitarNote(1 / 2);
export const quarter: (x: Fret) => GuitarNote = guitarNote(1 / 4);
export const eighth: (x: Fret) => GuitarNote = guitarNote(1 / 8);
export const sixteenth: (x: Fret) => GuitarNote = guitarNote(1 / 16);
export const silence = (x: GuitarNote): GuitarNote => ({ ...x, fret: '-' });

// Convenience

export const e = eighth;
export const de = (fret: Fret) => dotted(eighth(fret));
export const s = sixteenth;
export const ss = (fret: Fret) => silence(s(fret));

export const setString =
  (n: GuitarString) =>
  (x: GuitarNote): GuitarNote => {
    return { ...x, str: n };
  };

export const s9 = setString(9);

export const s8 = setString(8);

export const s7 = setString(7);

export const s6 = setString(6);

export const s5 = setString(5);

export const s4 = setString(4);

export const s3 = setString(3);

export const s2 = setString(2);

export const s1 = setString(1);
