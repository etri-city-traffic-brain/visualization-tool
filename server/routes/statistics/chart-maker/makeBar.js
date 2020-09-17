
// module.exports = (getChartData, simulationId) => new Promise((resolve, reject) => getChartData(simulationId, 'bar')
//   .then(({
//     labels,
//     datasets,
//   }) => resolve({ labels, datasets }))
//   .catch(err => reject(err)));

module.exports = async (getChartData, simulationId) => getChartData(simulationId, 'bar');
