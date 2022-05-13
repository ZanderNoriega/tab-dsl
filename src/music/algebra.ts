import { Note } from './primitives';

export const asColumns = <T>(notes: readonly Note<T>[]): Note<T>[][] => {
  const columns = notes.reduce(
    (acc: { currentColumn: Note<T>[]; columns: Note<T>[][] }, n: Note<T>) => {
      let columns = acc.columns.concat([]);
      let currentColumn = acc.currentColumn.concat([]);
      if (n.inChord == 'end' || n.inChord == undefined) {
        currentColumn.push(n);
        columns.push(currentColumn);
        currentColumn = [];
      } else {
        currentColumn.push(n);
      }
      return { ...acc, currentColumn, columns };
    },
    { currentColumn: [], columns: [] }
  ).columns;
  return columns;
};
