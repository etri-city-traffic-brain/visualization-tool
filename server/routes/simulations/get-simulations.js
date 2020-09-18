//    Simulation list API
//    2019
const paginate = require('paginate-array');

// const { db: { getSimulations } } = global.SALT;

const db = require('../../main/dbms/db');

const { getSimulations } = db;
const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

/**
 * return simulation list for user
 * if user is guest
 *  return all
 */
module.exports = (req, res) => {
  const {
    page = DEFAULT_PAGE,
    perPage = DEFAULT_PER_PAGE,
    user = '',
  } = req.query;
  if (user === 'guest') {
    const array = getSimulations().sortBy('created', 'asc').value().reverse();
    res.json(paginate(array, page, perPage));
    return;
  }
  const array = getSimulations()
    .filter({ user })
    .sortBy('created', 'asc')
    .value()
    .reverse();
  res.json(paginate(array, page, perPage));
};
