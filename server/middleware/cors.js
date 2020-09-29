// @ts-nocheck

module.exports = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  next();
};
