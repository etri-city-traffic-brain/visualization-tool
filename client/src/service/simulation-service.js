import { HTTP } from '@/http-common';
import moment from 'moment';

const { log, table } = console;

async function getSimulationInfo(simulationId) {
  try {
    const { data: simulation } = await HTTP.get(`/simulations/get/${simulationId}`);
    const {
      period,
      fromDate,
      fromTime,
      toDate,
      toTime,
    } = simulation.configuration;
    // console.log(begin, end, period);
    // const slideMax = (end - begin) / period + (60 / period);
    const timeDiff = moment(`${toDate} ${toTime}`).diff(moment(`${fromDate} ${fromTime}`));

    const slideMax = Math.ceil(timeDiff / (period * 1000)) // unit: miliseconds
    // table({simulationId, period, slideMax})
    return {
      simulation,
      slideMax,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return {
      simulation: null,
      slideMax: -1,
    };
  }
}

const query = ({ min, max, zoom }) => `extent=[${min.x},${min.y},${max.x},${max.y}]&zoom=${zoom}`;

async function getSimulationResult(simulationId, extent) {
  return (await HTTP.get(`simulation/${simulationId}?${query(extent)}`)).data;
}

async function startSimulation(simulationId) {
  return HTTP.post(`/simulations/start?id=${simulationId}`);
}

async function stopSimulation(simulationId) {
  return HTTP.post(`/simulations/stop/${simulationId}`);
}

async function getSimulations(userId, currentPage) {
  return HTTP.get(`/simulations/?page=${currentPage}&user=${userId}`);
}

async function uploadResult(item, formData) {
  return HTTP.post(`/simulations/upload/result?id=${item.id}&map=${item.configuration.map}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

async function create(userId, obj) {
  return HTTP.post('/simulations/create', obj);
}

async function remove(simulationId) {
  return HTTP.delete(`/simulations/remove/${simulationId}`);
}

export default {
  create,
  remove,
  getSimulationInfo,
  getSimulationResult,
  startSimulation,
  stopSimulation,
  getSimulations,
  uploadResult,
};
