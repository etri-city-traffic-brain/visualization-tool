// const { getSimulations } = require('../../main/dbms/db');
const { getSimulations } = global.SALT.db;

function get(req, res) {
  const { params: { id } } = req;

  const obj = getSimulations().find({ id }).value();
  if (!obj) {
    res.statusMessage = 'Not Found';
    res.status(404).end();
    return;
  }

  res.json(obj);
}

module.exports = get;
