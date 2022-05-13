const { isObject } = require('../std');

const isGroup = (x) => Array.isArray(x.notes);
const isNote = (x) => x.fret !== undefined;
const isSilence = (x) => x.fret == '-';
const isTuning = (x) =>
  isObject(x) && Object.keys(x).every((k) => k.match(/^s\d$/) !== null);

exports.isNote = isNote;

exports.isSilence = isSilence;

exports.isTuning = isTuning;

exports.isGroup = isGroup;
