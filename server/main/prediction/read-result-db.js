const R = require('ramda');

const path = require('path');
const fs = require('fs');

const config = require('../../config');

const {
  prediction: {
    predictionDir,
  },
} = config;

function find(rows, query) {
  return rows.filter((row) => {
    const target = row.slice(1, row.length - 1);
    const source = Object.values(query);
    return R.equals(target, source);
  });
}

function getDB(file) {
  const filePath = path.join(predictionDir, `${file}.json`);
  const str = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(str);
}

module.exports = {
  find,
  getDB,
};

function main() {
  const db = getDB('prediction1');

  const result = find(db, {
    day: 'Fri',
    rain: 'Rain0',
    weather: 'Thunderstorm0',
    accidents: 'sudn_st_large_cd0',
  });
}

if (require.main === module) {
  main();
}
