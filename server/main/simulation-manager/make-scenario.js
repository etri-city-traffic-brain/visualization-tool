/**
 * make simulation scenario file
 * author: beanpole
 */
const R = require('ramda');

function buildInput(id, route, partitions) {
  if (partitions === 0) {
    // return {
    //   fileType: 'SALT',
    //   node: `${id}/node.xml`,
    //   link: `${id}/edge.xml`,
    //   connection: `${id}/connection.xml`,
    //   trafficLightSystem: `${id}/tss.xml`,
    //   route: `routes/${route}`,
    // };
    return {
      fileType: 'SALT',
      node: 'node.xml',
      link: 'edge.xml',
      connection: 'connection.xml',
      trafficLightSystem: 'tss.xml',
      route,
    };
  }

  // const results = R.range(0, partitions).map((value, idx) => ({
  //   'sub-id': (idx + 1).toString(),
  //   fileType: 'SALT',
  //   node: `${id}/sub${idx}.node.xml`,
  //   link: `${id}/sub${idx}.edge.xml`,
  //   connection: `${id}/sub${idx}.connection.xml`,
  //   trafficLightSystem: `${id}/sub${idx}.tss.xml`,
  //   route: `routes/${route}`,
  // }));
  const results = R.range(0, partitions).map((value, idx) => ({
    'sub-id': (idx + 1).toString(),
    fileType: 'SALT',
    node: `sub${idx}.node.xml`,
    link: `sub${idx}.edge.xml`,
    connection: `sub${idx}.connection.xml`,
    trafficLightSystem: `sub${idx}.tss.xml`,
    route,
  }));

  return {
    input: results,
  };
}

/**
 *
 * @param {level} string
 */
function generate({
  id,
  begin,
  end,
  route,
  level = 'cell',
  period,
  partitions,
}) {
  const property = buildInput(id, route, partitions * 1);
  const propertyName = partitions === 0 ? 'input' : 'inputs';
  return {
    scenario: {
      id,
      time: {
        // begin: begin * 60 * 60, // to seconds
        // end: (end + 1) * 60 * 60, // to seconds
        begin,
        end,
      },
      [propertyName]: property,
      parameter: {
        minCellLength: 30.0,
        vehLength: 5.0,
      },
      output: {
        fileDir: `output/${id}/`,
        period,
        level,
        save: 1,
      },
    },
  };
}

module.exports = generate;
