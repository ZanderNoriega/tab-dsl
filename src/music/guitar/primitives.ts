import { Note, note, dotted, Length } from '../primitives';

// Guitar

export type GuitarString = number;

export type Fret = number | '-';

export type Guitar = { str: GuitarString; fret: Fret };

export type GuitarNote = Note<Guitar>;

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
