

const debug = require('debug')('api:remove');

const { getSimulations } = require('../../globals');

const removeSimulation = require('./utils/fn-remove-simulation');

async function remove(req, res) {
  const { params: { id: user } } = req;
  const simulations = getSimulations()
    .filter({ user })
    .value();

  // eslint-disable-next-line no-restricted-syntax
  for (const simulation of simulations) {
    // eslint-disable-next-line no-await-in-loop
    await removeSimulation(simulation.id);
  }
  res.send({});
}

module.exports = remove;
