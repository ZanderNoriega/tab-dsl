type Naturals = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
type Sharps = 'C#' | 'D#' | 'E#' | 'F#' | 'G#' | 'A#' | 'B#';
type Flats = 'Cb' | 'Db' | 'Eb' | 'Fb' | 'Gb' | 'Ab' | 'Bb';
export type TuningPitch = Naturals | Sharps | Flats;
export type GuitarString = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Tuning = { [k in GuitarString]: TuningPitch };
