
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
      .filter({ user, type, role: 'master' })
      .sortBy('created', 'asc')
      .value()
      .reverse();
  } else {
    array = getSimulations()
      // .filter({ user })
      .sortBy('created', 'asc')
      .value()
      .reverse();
    console.log(array.length)
  }
  res.json(paginate(array, page, perPage));
};
