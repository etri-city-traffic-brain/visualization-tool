module.exports = (getChartData, simulationId, step) => new Promise((resolve, reject) => {
  getChartData(simulationId, 'pie')
    .then(({
      labels,
      backgroundColor,
      totalData,
      stepDatas,
    }) => {
      const data = stepDatas[step] || totalData;
      resolve({
        labels,
        datasets: [{
          backgroundColor,
          data,
        }],
      });
    }).catch(err => reject(err));
});
