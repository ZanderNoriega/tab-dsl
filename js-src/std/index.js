// lib debug
const log = console.log.bind(console);
const toString = JSON.stringify.bind(JSON);
const logString = (x) => log(toString(x));
const assert = require('assert');

exports.log = log;
exports.toString = toString;
exports.logString = logString;
exports.assert = assert;

// lib typecheck

const isNumber = (x) => typeof x == 'number';
const isString = (x) => typeof x == 'string';
const isObject = (x) => typeof x == 'object';
const isDefined = (x) => x !== undefined;

exports.isNumber = isNumber;
exports.isString = isString;
exports.isObject = isObject;
exports.isDefined = isDefined;

// lib collection

const repeat = (n) => (x) => {
  let xs = [];
  for (let i = 0; i < n; i++) {
    xs.push(x);
  }
  return xs;
};

const flatRepeat = (n) => (x) => repeat(n)(x).flatMap((x) => x);

const columnsToArray = (columns) => {
  return columns.flatMap((x) => x);
};

exports.repeat = repeat;
exports.flatRepeat = flatRepeat;
exports.columnsToArray = columnsToArray;
