// (Note|Group)[] => Note[]
const flatten = (program) => {
  return program.reduce((acc, x) => {
    return acc.concat(x.notes ? x.notes : x);
  }, []);
};

exports.flatten = flatten;
