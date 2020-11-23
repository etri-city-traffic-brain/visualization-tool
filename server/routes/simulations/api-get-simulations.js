
const paginate = require('paginate-array');

const { getSimulations } = require('../../globals');

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 15;

module.exports = (req, res) => {
  const {
    page = DEFAULT_PAGE,
    perPage = DEFAULT_PER_PAGE,
    user = '',
    type
  } = req.query;

  let array;
  if (type === 'optimization') {
    array = getSimulations()
      .filter({ type, role: 'training' })
      .sortBy('created', 'asc')
      .value()
      .reverse();
  } else {
    array = getSimulations()
      .filter({ role: 'simulation' })
      .sortBy('created', 'asc')
      .value()
      .reverse();
  }
  res.json(paginate(array, page, perPage));
};
