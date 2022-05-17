export const repeat =
  (n: number) =>
  <T>(x: T): T[] => {
    let xs = [];
    for (let i = 0; i < n; i++) {
      xs.push(x);
    }
    return xs;
  };

export const flatRepeat =
  (n: number) =>
  <T>(x: T[]): T[] =>
    repeat(n)(x).flatMap((x: T[]) => x);

export const columnsToArray = <T>(columns: T[][]): T[] => {
  return columns.flatMap((x) => x);
};
