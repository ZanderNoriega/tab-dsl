const { isDefined, isNumber, isString, toString } = require('../std');

const { isNote, isTuning } = require('./predicates');

const { assert } = require('../std');

function checkAllAreDefined(xs) {
  if (!xs.every(isDefined)) {
    throw 'checkAllAreDefined';
  }
}

function checkIsArray(x) {
  if (!Array.isArray(x)) {
    throw 'checkIsArray';
  }
}

function checkAllAreStrings(xs) {
  if (!xs.every(isString)) {
    throw 'checkAllAreStrings';
  }
}

function checkAllAreNumbers(xs) {
  xs.forEach((x) => {
    assert(isNumber(x), `${x} is a number`);
  });
}

function checkAllAreNotes(xs) {
  if (!xs.every(isNote)) {
    throw `checkAllAreNotes: ${toString(xs)}`;
  }
}

function checkAllNotesTuningConsistency(notes, tuning) {
  const stringQty = Object.keys(tuning).length;
  notes.forEach((n) => {
    assert(n.string !== undefined, `note (${toString(n)}) has string`);
    assert(
      n.string <= stringQty,
      `note (${toString(
        n
      )}) has string number <= to amount of strings in tuning (${stringQty})`
    );
  });
}

function checkAllNotesHaveStrings(notes) {
  if (!notes.every((n) => n.string !== undefined)) {
    throw 'checkAllNotesHaveStrings';
  }
}

function checkAllAreTuning(xs) {
  if (!xs.every(isTuning)) {
    throw 'checkAllAreTuning';
  }
}

function checkNoDuplicates(xs) {
  const ys = new Set();
  xs.forEach((x) => {
    ys.add(x);
  });
  if (ys.size !== xs.length) {
    throw `checkNoDuplicates: ${toString(xs)}`;
  }
}

function checkAllEqual(xs) {
  const ys = new Set();
  xs.forEach((x) => {
    ys.add(x);
  });
  if (ys.size !== 1) {
    throw `checkAllEqual: ${JSON.stringify(xs)}`;
  }
}

function checkNumberGreaterThan(a, b) {
  checkAllAreNumbers([a, b]);
  if (a <= b) {
    throw `checkNumberGreaterThan(${a}, ${b})`;
  }
}

const checkNumberGreaterThanZero = (n) => checkNumberGreaterThan(n, 0);

exports.checkIsArray = checkIsArray;

exports.checkAllAreStrings = checkAllAreStrings;

exports.checkAllAreNumbers = checkAllAreNumbers;

exports.checkAllAreNotes = checkAllAreNotes;

exports.checkAllNotesTuningConsistency = checkAllNotesTuningConsistency;

exports.checkAllNotesHaveStrings = checkAllNotesHaveStrings;

exports.checkAllAreTuning = checkAllAreTuning;

exports.checkNoDuplicates = checkNoDuplicates;

exports.checkAllEqual = checkAllEqual;

exports.checkNumberGreaterThan = checkNumberGreaterThan;

exports.checkAllAreDefined = checkAllAreDefined;

exports.checkNumberGreaterThanZero = checkNumberGreaterThanZero;
