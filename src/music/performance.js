const {
  isNote,
  isGroup,
} = require('./predicates');

const {
  eighth,
  s,
} = require('./primitives');

const annotate = a => x => {
  if (isNote(x)) {
    const note = x;
    const marked = { ...note, annotation: a };
    return marked;
  } else if (isGroup(x)) {
    return { ...x, notes: x.notes.map(annotate(a)) };
  } else if (Array.isArray(x)) {
    return x.map(annotate(a));
  } else {
    throw `Cannot annotate: ${toString(x)}`;
  }
}

const muted = note => ({...note, fret: 'x'});

const palmMuted = annotate("'");

exports.muted = muted; 

exports.palmMuted = palmMuted; 

exports.annotate = annotate; 

const ms = fret => muted(s(fret));

const pe = fret => palmMuted(eighth(fret));

exports.ms = ms; 

exports.pe = pe; 

