import { ChordState } from '../primitives';
import { GuitarNote } from './primitives';
import {
  checked,
  NoDupesArray,
  noDupes,
  TwoOrMoreArray,
  twoOrMore,
} from '../../std/checked-array';

type ChordStringArray =
  | (NoDupesArray<GuitarNote> & TwoOrMoreArray<GuitarNote>)
  | null;

export const chord = (xs: GuitarNote[]): GuitarNote[] => {
  let checkedStrs: ChordStringArray = twoOrMore(
    noDupes((x: GuitarNote) => x.str)(checked(xs))
  );
  if (checkedStrs == null) {
    return xs;
  } else {
    const notes: GuitarNote[] = checkedStrs.values;
    const length = notes.length;
    const marked = notes.map((x: GuitarNote, i: number) => {
      const inChord: ChordState =
        i == 0 ? 'start' : i == length - 1 ? 'end' : 'in';
      return { ...x, inChord };
    });
    return marked;
  }
};
