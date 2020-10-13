
const test = require('tape');
const events = require('events');

const { EventEmitter } = events;

test('test extends EventEmitter', (assert) => {
  // const obj = {};

  // Object.assign(obj, EventEmitter.prototype);
  const obj = Object.create(EventEmitter.prototype);

  obj.on('my-event', (value) => {
    assert.equal('xxx', value);
    assert.end();
  });

  obj.emit('my-event', 'xxx');
});
