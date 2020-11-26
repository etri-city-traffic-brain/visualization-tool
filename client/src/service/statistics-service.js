//    Statistics service API
//    2019

import { HTTP } from '@/http-common';

const uriBase = 'salt/v1/statistics';

const query = (type, sId, step) => `${uriBase}/${type}?simulationId=${sId}&step=${step}`;

const { log } = console

async function getSummaryChart(simulationId, step) {
  try {
    const res = await HTTP.get(query('summary', simulationId, step))
    return res.data
  } catch (err) {
    log(err.message);
    return {};
  }
}

async function getHistogramChart(simulationId, step) {
  try {
    return (await HTTP.get(query('histogram', simulationId, step))).data;
  } catch (err) {
    return null;
  }
}

async function getPieChart(simulationId, step) {
  try {
    return (await HTTP.get(query('pie', simulationId, step))).data;
  } catch (err) {
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
