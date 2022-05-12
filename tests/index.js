const tests = {
  flatRepeat: () => {
    const xs0 = [
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies]),
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies]),
    ];
    const xs1 = flatRepeat(2)([
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies, de(2), pe(0), pe(0)]),
        ...s7([chuggies]),
    ]);
    assert(toString(xs0) === toString(xs1));
  },
  powerChord6: () => {
    const p0 = chord([
      s6(dotted(eighth(1))),
      s5(dotted(eighth(3))),
      s4(dotted(eighth(3))),
    ]);
    const p1 = powerChord6(de)(1);
    assert(toString(p0) === toString(p1));
  },
  open3: () => {
    const x = open3(5)(e);
    const y = chord([
      s5(e(0)),
      s4(e(0)),
      s3(e(0)),
    ]);
    assert.deepEqual(x, y);
  },
  asColumns: () => {
    const tuning = {
      s1: 'Eb',
      s2: 'Bb',
      s3: 'Gb',
      s4: 'Db',
      s5: 'Ab',
      s6: 'Eb',
      s7: 'Ab',
    };
    const notes = [
      ...chord([
        s6(eighth(0)),
        s5(eighth(2)),
        s4(eighth(2)),
      ]),
      s6(eighth(5)),
      s5(eighth(3)),
      s4(eighth(2)),
    ];
    const r = asColumns(notes, tuning).map(xs => xs.map(n => n.fret));
    assert.deepEqual(r, [
      [ 0, 2, 2],
      [ 5 ],
      [ 3 ],
      [ 2 ],
    ]);
  }
};

Object.keys(tests).forEach(k => {
  tests[k]();
});
