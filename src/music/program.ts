import { Note } from './primitives';
import { Region } from './region';

export type Event<T> = Note<T> | Region<T>;
export type Program<T> = Event<T>[];

export const flatten = <T>(program: Program<T>): Note<T>[] => {
  return program.reduce((acc: Note<T>[], x: Note<T> | Region<T>) => {
    if (x.type == 'region') {
      return acc.concat(x.notes);
    } else {
      return acc.concat([x]);
    }
  }, []);
};

export const modifiers = <T>(note: Note<T>): Note<T> => {
  const n = { ...note };
  delete n.dotted;
  return note.dotted ? { ...n, length: n.length + n.length / 2 } : n;
};

export const trim =
  (n: number) =>
  <T>(xs: Program<T>): Program<T> => {
    const notes = flatten(xs).map(modifiers);
    let totalLength = 0;
    let trimmed: Program<T> = [];
    for (let i = 0; i < xs.length && totalLength < n; i++) {
      let note = notes[i];
      if (note != undefined) {
        trimmed.push(note);
        totalLength += note.length;
      }
    }
    return trimmed;
  };
