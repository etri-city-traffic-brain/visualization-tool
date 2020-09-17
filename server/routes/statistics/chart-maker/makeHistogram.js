// module.exports = (getChartData, simulationId, step) => new Promise((resolve, reject) => {
//   getChartData(simulationId, 'histogram')
//     .then(({
//       labels,
//       backgroundColor,
//       totalData,
//       stepDatas,
//     }) => {
//       const data = stepDatas[step] || totalData;
//       resolve({
//         labels,
//         datasets: [{
//           backgroundColor,
//           data,
//         }],
//       });
//     })
//     .catch(err => reject(err));
// });
module.exports = async (getChartData, simulationId, step) => {
  const {
    labels,
    backgroundColor,
    totalData,
    stepDatas,
  } = await getChartData(simulationId, 'histogram');

  const data = stepDatas[step] || totalData;

  return {
    labels,
    datasets: [{
      backgroundColor,
      data,
    }],
  };
};
