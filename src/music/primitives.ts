// Music

export type Length = number;

export type ChordState = 'start' | 'end' | 'in';

export type Note<T> = {
  type: 'note';
  length: Length;
  dotted?: boolean | undefined;
  inChord?: ChordState | undefined;
} & T;

type RemoveInChordField<Type> = {
  [Property in keyof Type as Exclude<Property, 'inChord'>]: Type[Property];
};

// ie. same as Note<T> but ChordState property not optional.
export type ChordNote<T> = RemoveInChordField<Note<T>> & {
  inChord: ChordState;
};

export const note =
  (length: Length) =>
  <T>(x: T): Note<T> => ({ type: 'note', length, ...x });

export const dotted = <T>(x: Note<T>): Note<T> => ({ ...x, dotted: true });
