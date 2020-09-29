
const paginate = require('paginate-array');

const { getSimulations } = require('../../globals');

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 15;

module.exports = (req, res) => {
  const {
    page = DEFAULT_PAGE,
    perPage = DEFAULT_PER_PAGE,
    user = '',
  } = req.query;

  const array = getSimulations()
    .filter({ user })
    .sortBy('created', 'asc')
    .value()
    .reverse();
  res.json(paginate(array, page, perPage));
};
