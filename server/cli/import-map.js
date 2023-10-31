#!/usr/bin/env node

// 입력으로 받은 GeoJSON을 MongoDB 에 추가한다.
// GeoJSON은 edge.xml 을 사용하여 변환한 결과물이다.
const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')
const chalk = require('chalk')

const { connect } = require('./db')

const { log } = console

async function insertBulk(collection, geojson) {
  try {
    log('drop existing collection')
    // await collection.drop()
  } catch (err) {
    // ignore
    log(err.message)
  }
  const bulk = collection.initializeOrderedBulkOp()
  log('start bulk insert')
  geojson.features.forEach(bulk.insert.bind(bulk))
  const result = await bulk.execute()
  log('create index')
  await collection.createIndex({ geometry: '2dsphere' })
  log('end bulk insert')
  return result
}

async function loadData(dbName, collectionName, filePath) {
  log('target file:', chalk.green(filePath))
  const { connection } = await connect(dbName)
  const exists = await fse.pathExists(filePath)
  if (!exists) {
    log(`${filePath} not exists`)
    return false
  }

  const { db } = connection
  const collection = db.collection(collectionName)

  try {
    const geojson = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    await insertBulk(collection, geojson)
    log(chalk.green(`${filePath} finished`))
  } catch (err) {
    log('fail to load ', collectionName)
    log(err.message)
  }
}

function makeLoader(db) {
  return loadData.bind(null, db)
}

if (require.main === module) {

  // fse.readdir('d://tmp/sejeong_data').then(list => {
  //   console.log(list)
  // })

  if (process.argv.length < 3) {
    log('usage:', 'node import-map [directory path]')
    process.exit(1)
  }
  const DATABASE = 'map'
  const targetDir = process.argv[2]
  const load = makeLoader(DATABASE)

  fse.pathExists(targetDir).then(async exists => {
    if (!exists) {
      log(chalk.red(`[${targetDir}] not exists`))
      return
    }

    // daejeon
    // await load('ulinks', `${dir}/link.geojson`)
    // await load('ucells', `${targetDir}/cell.geojson`)
    // await load('ucells', `${targetDir}/sample.geojson`)

    // sejeong
    // await load('ulinks', `${targetDir}/sejeong_edge.link.geojson`)
    await load('ucells', `${targetDir}/sejeong_edge.cell.geojson`)

    process.exit(1)
  })
}
