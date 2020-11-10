#!/usr/bin/env node

const fs = require('fs');
const fse = require('fs-extra')
const { connect } = require('./db');
const chalk = require('chalk')
const { log } = console;

// const data = {
//   links: '../data/map-link.geojson',
//   sections: '../data/map-section.geojson',
//   cells: '../data/map-cell.geojson',
//   signals: '../data/map-traffic-light.geojson',
// };

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
  log('start bulk insert')
  geojson.features.forEach(bulk.insert.bind(bulk));
  const result = await bulk.execute();
  log('create index')
  await collection.createIndex({ geometry: '2dsphere' });
  log('end bulk insert')
  return result;
}

async function importData(collectionName, filePath) {
  log('start processing', filePath)
  const { connection } = await connect('map');
  const exists = await fse.pathExists(filePath)
  if(!exists) {
    log(`${filePath} not exists`)
    return false
  }
  try {
    const geojson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    await run(connection, collectionName, geojson);
    log(chalk.green(`${filePath} finished`));
  } catch (err) {
    log('fail to load ', collectionName);
    log(err.message)
  }
}


if (require.main === module) {



  importData('signals', `./signals.geojson`).then(() => {
    console.log('finished')
  }).catch(err => console.log(err))

}
