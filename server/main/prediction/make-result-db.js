const path = require('path');
const fs = require('fs');

const config = require('../config');

const {
  prediction: {
    predictionDir
  }
} = config;
function parseValues(str) {
  return str.trim()
    .split('\n')
    .map(v => parseFloat(v.trim()));
}

function createDB(target) {

  const directoryPath = path.join(predictionDir, target);

  const files = fs.readdirSync(directoryPath);

  const rows = files.map((file) => {
    // Do whatever you want to do with the file
    const row = file.split('-');
    row[0] = row[0].substring(0, row[0].indexOf('.'));
    row[4] = row[4].substring(0, row[4].lastIndexOf('.'));
    const values = parseValues(fs.readFileSync(path.join(directoryPath, file), 'utf-8'));
    row.push(values);
    return row;
  });
  
  fs.writeFileSync(path.join(predictionDir, `${target}.json`), JSON.stringify(rows));

}

if (require.main === module) {
  createDB('prediction1');
}