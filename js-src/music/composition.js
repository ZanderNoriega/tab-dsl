const { isNote, isGroup } = require('./predicates');

const { flatten } = require('./flatten');

const { checkAllAreNotes } = require('./exceptions');

const modifiers = (note) => {
  const n = { ...note };
  delete n.dotted;
  return note.dotted ? { ...n, length: n.length + n.length / 2 } : n;
};

const trim = (n) => (xs) => {
  const notes = flatten(xs).map(modifiers);
  checkAllAreNotes(notes);
  let totalLength = 0;
  let trimmed = [];
  for (let i = 0; i < xs.length && totalLength < n; i++) {
    trimmed.push(notes[i]);
    totalLength += notes[i].length;
  }
  return trimmed;
};

// number => A => A
const string = (n) => (x) => {
  if (isGroup(x)) {
    return { ...x, notes: x.notes.map(string(n)) };
  } else if (isNote(x)) {
    return { ...x, string: n };
  } else if (Array.isArray(x)) {
    return x.map(string(n));
  } else {
    throw new Error(`Unknown type: ${JSON.stringify(x)}`);
  }
};

const s7 = string(7);
const s6 = string(6);
const s5 = string(5);
const s4 = string(4);
const s3 = string(3);
const s2 = string(2);
const s1 = string(1);

exports.trim = trim;

exports.string = string;

exports.s7 = s7;

exports.s6 = s6;

exports.s5 = s5;

exports.s4 = s4;

exports.s3 = s3;

exports.s2 = s2;

exports.s1 = s1;

exports.modifiers = modifiers;
