const {
  checkAllAreNotes,
  checkNoDuplicates,
  checkAllEqual,
  checkNumberGreaterThan,
  checkNumberGreaterThanZero,
} = require('./exceptions');

const { string, modifiers } = require('./composition');

const { flatten } = require('./flatten');

// src/music/guitar/chords.js
const chord = (xs) => {
  const notes = flatten(xs).map(modifiers);
  checkAllAreNotes(notes);
  checkNoDuplicates(notes.map((x) => x.string));
  checkAllEqual(notes.map((x) => x.length));
  const length = notes.length;
  const marked = notes.map((x, i) => ({
    ...x,
    inChord: i == 0 ? 'start' : i == length - 1 ? 'end' : 'in',
  }));
  return marked;
};
// src/music/guitar/chords.js
const bar = (size) => (rootString) => (noteCons) => (rootFret) => {
  checkNumberGreaterThan(size, 1);
  checkNumberGreaterThan(rootString, 1);
  checkNumberGreaterThan(rootFret, -1);
  checkNumberGreaterThan(rootString + 1, size);
  let notes = [];
  for (let i = rootString; i > 0 && notes.length < size; i--) {
    notes.push(string(i)(noteCons(rootFret)));
  }
  return chord(notes);
};
// src/music/guitar/chords.js
const dropBar = bar(3);
const dropBar7 = dropBar(7);
const dropBar6 = dropBar(6);
const open = (size) => (rootString) => (noteCons) =>
  bar(size)(rootString)(noteCons)(0);
const open3 = open(3);

// src/music/guitar/chords.js
const powerChord = (rootString) => (noteCons) => (rootFret) => {
  checkNumberGreaterThan(rootString, 2);
  checkNumberGreaterThanZero(rootFret);
  return chord([
    string(rootString)(noteCons(rootFret)),
    string(rootString - 1)(noteCons(rootFret + 2)),
    string(rootString - 2)(noteCons(rootFret + 2)),
  ]);
};
const powerChord7 = powerChord(7);
const powerChord6 = powerChord(6);
const powerChord5 = powerChord(5);

exports.chord = chord;

exports.bar = bar;

exports.dropBar = dropBar;

exports.dropBar7 = dropBar7;

exports.dropBar6 = dropBar6;

exports.open = open;

exports.open3 = open3;

exports.powerChord = powerChord;

exports.powerChord7 = powerChord7;

exports.powerChord6 = powerChord6;

exports.powerChord5 = powerChord5;
