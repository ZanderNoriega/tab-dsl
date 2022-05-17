const CHECKED = Symbol('CHECKED');

export type CheckedArray<T> = { values: T[]; __checked: typeof CHECKED };

export const checked = <T>(values: T[]): CheckedArray<T> => ({
  values,
  __checked: CHECKED,
});

const NO_DUPES = Symbol('NO_DUPES');

export type NoDupesArray<T> = CheckedArray<T> & {
  values: T[];
  __noDupes: typeof NO_DUPES;
};

export const noDupes =
  <U, T extends CheckedArray<U>>(f: (a: U) => number) =>
  (o: T | null): (T & NoDupesArray<U>) | null => {
    if (o === null) {
      return null;
    } else {
      const db: Set<number> = new Set();
      o.values.forEach((x) => {
        let y = f(x);
        db.add(y);
      });
      if (db.size !== o.values.length) {
        return null;
      } else {
        return { ...o, __noDupes: NO_DUPES };
      }
    }
  };

const TWO_OR_MORE = Symbol('TWO_OR_MORE');

export type TwoOrMoreArray<T> = CheckedArray<T> & {
  values: T[];
  __twoOrMore: typeof TWO_OR_MORE;
};

export const twoOrMore = <U, T extends CheckedArray<U>>(
  o: T | null
): (T & TwoOrMoreArray<U>) | null => {
  if (o === null) {
    return null;
  } else {
    if (o.values.length < 2) {
      return null;
    } else {
      return { ...o, values: o.values, __twoOrMore: TWO_OR_MORE };
    }
  }
};
