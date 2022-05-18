import { GuitarNote } from './primitives';

export const isSilence = (x: GuitarNote) => x.fret == '-';
