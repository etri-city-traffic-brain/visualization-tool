import axios from 'axios';

const query = ({ min, max, zoom }) => `extent=[${min.x},${min.y},${max.x},${max.y}]&zoom=${zoom}`;
const get = async (param = '') => axios.get(`${param}`);

const uriBase = 'salt/v1/map';

export default {
  async getMap(extent) {
    // console.log('getMap')
    const { min, max } = extent;
    min.x -= min.x * 0.00001;
    min.y -= min.y * 0.00003;
    max.x += max.x * 0.00001;
    max.y += max.y * 0.00001;
    return (await get(`${uriBase}?${query(extent)}`)).data;
  },
  async getLinks(extent) {
    // console.log('getLinks')
    const { min, max } = extent;
    min.x -= min.x * 0.00001;
    min.y -= min.y * 0.00001;
    max.x += max.x * 0.00001;
    max.y += max.y * 0.00001;
    const { data } = await get(`${uriBase}/links/?${query(extent)}`);
    return data;
  },
  async getGrids() {
    return (await get(`${uriBase}/grids`)).data;
  },
  async getTrafficLights(extent) {
    return (await get(`${uriBase}/traffic_lights/?${query(extent)}`)).data;
  },
};
