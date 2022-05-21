type Naturals = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
type Sharps = 'C#' | 'D#' | 'E#' | 'F#' | 'G#' | 'A#' | 'B#';
type Flats = 'Cb' | 'Db' | 'Eb' | 'Fb' | 'Gb' | 'Ab' | 'Bb';
export type TuningPitch = Naturals | Sharps | Flats;
export type GuitarString = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Six = {
  type: 6;
  1: TuningPitch;
  2: TuningPitch;
  3: TuningPitch;
  4: TuningPitch;
  5: TuningPitch;
  6: TuningPitch;
};
export type Seven = {
  type: 7;
  1: TuningPitch;
  2: TuningPitch;
  3: TuningPitch;
  4: TuningPitch;
  5: TuningPitch;
  6: TuningPitch;
  7: TuningPitch;
};
// export type Tuning = { [k in GuitarString]: TuningPitch };
export type Tuning = Six | Seven;
