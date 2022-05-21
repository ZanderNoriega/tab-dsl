// Music

export type Length = number;

export type ChordState = 'start' | 'end' | 'in';

export type Note<T> = {
  type: 'note';
  length: Length;
  dotted?: boolean | undefined;
  inChord?: ChordState | undefined;
} & T;

export const note =
  (length: Length) =>
  <T>(x: T): Note<T> => ({ type: 'note', length, ...x });

export const dotted = <T>(x: Note<T>): Note<T> => ({ ...x, dotted: true });

type RemoveInChordField<Type> = {
  [Property in keyof Type as Exclude<Property, 'inChord'>]: Type[Property];
};

export type ChordNote<T> = RemoveInChordField<Note<T>> & {
  inChord: ChordState;
};
