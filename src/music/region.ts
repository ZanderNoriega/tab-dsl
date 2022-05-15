import { Note } from './primitives';

export type Region<T> = { type: 'region'; notes: Note<T>[] };

export const region = <T>(xs: Note<T>[]): Region<T> => ({
  type: 'region',
  notes: xs,
});
