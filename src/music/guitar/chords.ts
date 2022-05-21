import { ChordState } from '../primitives';
import {
  GuitarNote,
  GuitarString,
  setString,
  Fret,
  NoteCons,
} from './primitives';
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

export const bar =
  (size: number) =>
  (rootString: GuitarString) =>
  (noteCons: NoteCons) =>
  (rootFret: Fret) => {
    let notes = [];
    for (let i = rootString; i > 0 && notes.length < size; i--) {
      notes.push(setString(i)(noteCons(rootFret)));
    }
    return chord(notes);
  };

export const dropBar = bar(3);
export const dropBar7 = dropBar(7);
export const dropBar6 = dropBar(6);
export const open =
  (size: number) => (rootString: GuitarString) => (noteCons: NoteCons) =>
    bar(size)(rootString)(noteCons)(0);
export const open3 = open(3);
