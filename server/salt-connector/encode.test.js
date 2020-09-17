

const test = require('tape');
const { Header } = require('./msg');

const encode = require('./encode');

test('test encode', (assert) => {
  const buffer = encode(Header, {
    type: 1,
    timestamp: 1,
  });

  const result = Header(buffer);
  assert.equals(result.type, 1);
  assert.end();
});
