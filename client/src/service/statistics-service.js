//    Statistics service API
//    2019

import { HTTP } from '@/http-common';

const uriBase = 'salt/v1/statistics';

const query = (type, sId, step) => `${uriBase}/${type}?simulationId=${sId}&step=${step}`;

async function getSummaryChart(simulationId, step) {
  try {
    const res = await HTTP.get(query('summary', simulationId, step))
    const data = res.data
    return data
  } catch (err) {
    console.log(" e r r o r ", err.message);
    return null;
  }
}

async function getHistogramChart(simulationId, step) {
  try {
    return (await HTTP.get(query('histogram', simulationId, step))).data;
  } catch (err) {
    // return {
    //   datasets: [],
    // };
    return null;
  }
}

async function getPieChart(simulationId, step) {
  try {
    return (await HTTP.get(query('pie', simulationId, step))).data;
  } catch (err) {
    // return {
    //   datasets: [],
    // };
    return null;
  }
}

async function getSpeedsPerGrid(simulationId, step) {
  try {
    const { data } = await HTTP.get(query('grid', simulationId, step));
    return data;
  } catch (err) {
    return null;
  }
}

export default {
  getSummaryChart,
  getHistogramChart,
  getPieChart,
  getSpeedsPerGrid,
};
