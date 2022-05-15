import { eighth, sixteenth, Guitar, Fret } from './primitives';
import { Region, region } from '../region';

export const eighths = (xs: readonly Fret[]): Region<Guitar> =>
  region(xs.map(eighth));
export const sixteenths = (xs: readonly Fret[]): Region<Guitar> =>
  region(xs.map(sixteenth));
