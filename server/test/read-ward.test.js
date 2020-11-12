var test = require('tape');
var read = require('../main/signal-optimization/read-reward')

test('read reward test', async function (t) {

  const data = await read(`${__dirname}/reward.csv`)
  t.equal(10, data[0]);
  t.end()
});
