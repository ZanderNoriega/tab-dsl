const { checkAllAreTuning, checkAllAreNotes } = require('./exceptions');

const asColumns = (notes, tuning) => {
  checkAllAreTuning([tuning]);
  checkAllAreNotes(notes);
  const columns = notes.reduce(
    (acc, n) => {
      let columns = acc.columns.concat([]);
      let currentColumn = acc.currentColumn.concat([]);
      let stringQty = Object.keys(tuning).length;
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

exports.asColumns = asColumns;
