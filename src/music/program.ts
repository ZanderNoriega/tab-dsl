import { Note } from './primitives';
import { Region } from './region';

export type Event<T> = Note<T> | Region<T>;
export type Program<T> = Event<T>[];

export const fold =
  <T, U>(f: (a: Note<T>) => U, g: (a: Region<T>) => U) =>
  (e: Event<T>): U => {
    if (e.type == 'note') {
      return f(e);
    } else {
      return g(e);
    }
  };

export const flatten = <T>(program: Program<T>): Note<T>[] => {
  return program.reduce((acc: Note<T>[], x: Event<T>) => {
    let xs: Note<T>[] = fold<T, Note<T>[]>(
      (note) => [note],
      (r) => r.notes
    )(x);
    return acc.concat(xs);
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
