// Music

type Length = number;

type Note<T> = T & { length: Length, dotted?: boolean }

export const dotted = <T>(x: Note<T>): Note<T> => ({ ...x, dotted: true });

type Group<T> = { notes: Note<T>[] }

export const group = <T>(xs: Note<T>[]): Group<T> => ({ notes: xs });

// Guitar

type GuitarString = number;

type Fret = number | '-';

type Guitar = { str: GuitarString; fret: Fret; }

type GuitarNote = Note<Guitar>

export const guitarNote = (length: Length) => (fret: Fret, str: GuitarString = 7): GuitarNote =>
  ({ str, fret, length })

export const half:      (x: Fret) =>  GuitarNote  = guitarNote(1/2);
export const quarter:   (x: Fret) =>  GuitarNote  = guitarNote(1/4);
export const eighth:    (x: Fret) =>  GuitarNote  = guitarNote(1/8);
export const sixteenth: (x: Fret) =>  GuitarNote  = guitarNote(1/16);

export const eighths    = (xs: Fret[]): Group<Guitar> => group(xs.map(eighth));
export const sixteenths = (xs: Fret[]): Group<Guitar> => group(xs.map(sixteenth));

export const silence = (x: GuitarNote): GuitarNote => ({ ...x, fret: '-' });

// Convenience
export const e = eighth;
export const de = (fret: Fret) => dotted(eighth(fret));
export const s = sixteenth;
export const ss = (fret: Fret) => silence(s(fret));
