
const refineDate = text => text.replace(/-/g, '');
const refineTime = text => text.replace(/:/g, '');

const refineParam = param => ({
  include: 0,
  fromDate: refineDate(param.fromDate),
  toDate: refineDate(param.toDate),
  fromTime: refineTime(param.fromTime),
  toTime: refineTime(param.toTime),
  region: param.region,
  partitions: param.partitions,
  subregion: 0,
  signal: 1,
  route: 1,
  event: 1,
  weather: 1,
});
/**
 * 시나리오 파일(.zip)을 다운로드한 후
 * 시뮬레이션 디렉토리(dir)에 압축해제 한다.
 */
async function prepareScenarioFile(dir, param, downloader) {
  const scenarioFilePath = await downloader(refineParam(param), dir);
  return scenarioFilePath;
}

module.exports = prepareScenarioFile;
