
const {
  download,
  makeUrlForScenarioByRegion,
  makeUrlForScenarioByCoordinate
} = require('./scenario-downloader');

async function testDownloadByRegion(term, dir) {
  const scenarioByRegionUrl = makeUrlForScenarioByRegion({
    ...term,
    include: 0,
    region: '11250',
    subregion: 0,
    partitions: 1,
    signal: 1,
    route: 1,
    event: 1,
    weather: 1,
  });
  await download(scenarioByRegionUrl, dir);
}

async function testDownloadByCoordinates(term, dir) {
  const ScenarioByCoordinateUrl = makeUrlForScenarioByCoordinate({
    ...term,
    include: 0,
    minX: '127.1219',
    minY: '37.5553',
    maxX: '127.1558',
    maxY: '37.5373',
    partitions: 1,
    signal: 1,
    route: 1,
    event: 1,
    weather: 1,
  });
  await download(ScenarioByCoordinateUrl, dir);
}

if (require.main === module) {
  const term = {
    fromDate: '20181029',
    toDate: '20181029',
    fromTime: '000000',
    toTime: '230000',
  };

  (async () => {
    try {
      await testDownloadByRegion();
    } catch (err) {
      console.log(err);
    }
  })();
}
