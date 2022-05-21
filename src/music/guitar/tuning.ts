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

export type Tuning = Six | Seven;

export const pitch =
  (n: number) =>
  (tuning: Tuning): TuningPitch => {
    switch (tuning.type) {
      case 6:
        switch (n) {
          case 6:
            return tuning[6];
          case 5:
            return tuning[5];
          case 4:
            return tuning[4];
          case 3:
            return tuning[3];
          case 2:
            return tuning[2];
          case 1:
            return tuning[1];
          default:
            return tuning[6];
        }
      case 7:
        switch (n) {
          case 7:
            return tuning[7];
          case 6:
            return tuning[6];
          case 5:
            return tuning[5];
          case 4:
            return tuning[4];
          case 3:
            return tuning[3];
          case 2:
            return tuning[2];
          case 1:
            return tuning[1];
          default:
            return tuning[7];
        }
      default:
        return tuning[6];
    }
  };
