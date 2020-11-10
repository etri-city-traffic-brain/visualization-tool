

const fs = require('fs');

function make(NODE_ID, coordinates) {
  return {
    type: 'Feature',
    properties: {
      VERSION: 20150128,
      NODE_ID,
    },
    geometry: {
      type: 'Point',
      coordinates,
    },
  };
}


const str = fs.readFileSync('./signallist.csv', 'utf-8');
const features = str.split('\n').map((row) => {
  const values = row.split(',');
  return make(values[0], [Number(values[1]), Number(values[2])]);
});

const obj = {
  type: 'FeatureCollection',
  name: 'mnodes',
  crs: {
    type: 'name',
    properties: {
      name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
    },
  },
  features,
};

//  CSV 형태의 노드 목록을 GEO JSON 객체로 변환한다.
if (require.main === module) {
  fs.writeFileSync('signals.geojson', JSON.stringify(obj, false, 2));
}
