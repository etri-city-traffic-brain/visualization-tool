module.exports = (getChartData, simulationId, step) => new Promise((resolve, reject) => {
  getChartData(simulationId, 'grid')
    .then((result) => {
      const numStep = Math.floor(Number(step));
      if (isNaN(numStep) || numStep < 0 || numStep >= result.steps) {
        return resolve(result);
      }
      resolve(
        Object.keys(result)
          .filter(key => key !== 'steps')
          .map((gridId) => {
            const obj = {};
            obj[gridId] = result[gridId][numStep];
            return obj;
          }),
      );
    })
    .catch(err => reject(err));
});
