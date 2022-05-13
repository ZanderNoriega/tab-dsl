const snapshotType = process.argv[2];

switch (snapshotType) {
  case 'ascii':
    const { examples } = require('./examples/ascii');
    const fs = require('fs');
    const path = require('path');
    const snapshotFilename = path.join('./', 'tests', 'snapshots', 'ascii.txt');
    fs.writeFileSync(snapshotFilename, examples);
    break;
  default:
    throw Error(`Invalid snapshot type: ${snapshotType}`);
}
