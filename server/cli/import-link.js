#!/usr/bin/env node

const fs = require('fs');
const { connect } = require('./db');

const { log } = console;

const data = {
  links: '../data/map-link.geojson',
  sections: '../data/map-section.geojson',
  cells: '../data/map-cell.geojson',
  signals: '../data/map-traffic-light.geojson',
};

async function run(connection, collectionName, geojson) {
  const { db } = connection;
  const collection = db.collection(collectionName);
  try {
    log('drop existing collection:', collectionName);
    await db.collection(collectionName).drop();
  } catch (err) {
    // ignore
  }
  const bulk = collection.initializeOrderedBulkOp();
  geojson.features.forEach(bulk.insert.bind(bulk));
  const result = await bulk.execute();
  await collection.createIndex({ geometry: '2dsphere' });
  return result;
}

async function importData(collectionName, fileName) {
  const { connection } = await connect('map');

  try {
    const geojson = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    const result = await run(connection, collectionName, geojson);
    log('finished', result);
    process.exit(1);
  } catch (err) {
    log('fail to load ', collectionName);
  }
}

if (require.main === module) {
  // if (process.argv.length < 3) {
  //   log('usage', 'node import-link [file.geojson]');
  //   process.exit(1);
  // }
  // const collectionName = process.argv[2];
  // if (!['links', 'sections', 'cells', 'signals'].includes(collectionName)) {
  //   log('enter links or sections or cells');
  //   process.exit(1);
  // }

  // importData('dlinks', '../data/daejeon-link.geojson');
  importData('ulinks', '../../../uniq-cell-builder/outputs/link.geojson');
  // importData('ucells', '../../../uniq-cell-builder/outputs/cell.geojson');
}
