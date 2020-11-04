
import test from 'tape'

import convert from '../src/utils/array2obj'

test('convert is function test', function (assert) {

  assert.equal('function', typeof convert, 'convert must be a function')

  const input = [
    {properties: { LINK_ID: 'link1' }},
    {properties: { LINK_ID: 'link2' }}
  ]




  const result = convert(input, ['properties', 'LINK_ID'])
  const expected = {
    link1: {properties: { LINK_ID: 'link1' }},
    link2: {properties: { LINK_ID: 'link2' }}
  }
  assert.deepEqual(result, expected);

  assert.end()

});
