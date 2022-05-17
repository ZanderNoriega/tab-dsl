import { ChordState } from '../primitives';
import { GuitarNote } from './primitives';
import {
  checked,
  NoDupesArray,
  noDupes,
  TwoOrMoreArray,
  twoOrMore,
} from '../../std/checked-array';

type ChordStringArray = NoDupesArray<GuitarNote> & TwoOrMoreArray<GuitarNote>;

export const chord = (xs: GuitarNote[]): GuitarNote[] => {
  let checkedStrs: ChordStringArray | null = twoOrMore(
    noDupes((x: GuitarNote) => x.str)(checked(xs))
  );
  if (checkedStrs == null) {
    return xs;
  } else {
    return buildChord(checkedStrs);
  }
};

export const buildChord = (xs: ChordStringArray): GuitarNote[] => {
  const notes: GuitarNote[] = xs.values;
  const length = notes.length;
  const marked = notes.map((x: GuitarNote, i: number) => {
    const inChord: ChordState =
      i == 0 ? 'start' : i == length - 1 ? 'end' : 'in';
    return { ...x, inChord };
  });
  return marked;
};
