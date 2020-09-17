
import axios from 'axios';

async function downloadScenarioByRegion({
  fromDate,
  toDate,
  fromTime,
  toTime,
  region = 0,
  subregion = 0,
  signal = 1,
  partitions = 1,
}) {
  const reqestParameter = `
    fromDate=${fromDate}&
    toDate=${toDate}&
    fromTime=${fromTime}&
    toTime=${toTime}&
    region=${region}&
    subregion=${subregion}&
    signal=${signal}&
    partitions=${partitions}
  `.replace(/\s/g, '');
  console.log(reqestParameter);
  const { data } = await axios({
    url: `/simulations/download/scenarioByRegion?${reqestParameter}`,
    method: 'GET',
    responseType: 'blob', // important
  });
  return data;
}

async function downloadScenarioByCoordinate({
  fromDate,
  toDate,
  fromTime,
  toTime,
  minX,
  minY,
  maxX,
  maxY,
  signal = 1,
  partitions = 1,
}) {
  const reqestParameter = `
    fromDate=${fromDate}&
    toDate=${toDate}&
    fromTime=${fromTime}&
    toTime=${toTime}&
    minX=${minX}&
    minY=${minY}&
    maxX=${maxX}&
    maxY=${maxY}&
    signal=${signal}&
    partitions=${partitions}
  `.replace(/\s/g, '');
  console.log(reqestParameter);
  const { data } = await axios({
    url: `/simulations/download/scenarioByCoordinate?${reqestParameter}`,
    method: 'GET',
    responseType: 'blob', // important
  });
  return data;
}

export default {
  downloadScenarioByRegion,
  downloadScenarioByCoordinate,
};
