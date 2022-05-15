import { Note } from './primitives';
import { Region } from './region';

export type Program<T> = (Note<T> | Region<T>)[];

export const flatten = <T>(program: Program<T>): Note<T>[] => {
  return program.reduce((acc: Note<T>[], x: Note<T> | Region<T>) => {
    if (x.type == 'region') {
      return acc.concat(x.notes);
    } else {
      return acc.concat([x]);
    }
  }, []);
};
