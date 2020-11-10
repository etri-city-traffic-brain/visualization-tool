

const debug = require('debug')('api:remove');

const removeSimulation = require('./utils/fn-remove-simulation');
const { getSimulations, getSimulation } = require('../../globals');
//    remove simulation by simulation_id
//    have to remove local and remote
async function remove(req, res) {
  const { params: { id } } = req;

  try {

    const sim = await getSimulation(id)

    if(sim && sim.slaveId) {
      try {
        await removeSimulation(sim.slaveId);
      } catch (err) {

      }
    }

    console.log('delete', id)
    await removeSimulation(id);


    res.send({
      id,
    });
  } catch (err) {
    if (err.name === 'MongoError') {
      debug(err.message);
      debug('ignore MongoError');
      res.send({
        id,
      });
      return;
    }
    debug(err);
    console.log(err)
    res.status(500).send({
      error: err.message,
    });
  }
}

module.exports = remove;
