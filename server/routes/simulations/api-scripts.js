/**
 * 시뮬레이션 실행을 위한 스크립트 목록을 반환한다.
 */
const fs = require('fs')
const debug = require('debug')('api:get-scripts');

const { config } = require('../../globals')

module.exports = async (req, res) => {
  const isPython = file => file.endsWith('.py')
  try {
    res.send(
      fs.readdirSync(config.saltPath.scripts).filter(isPython)
    )
  } catch (err) {
    debug(err.message)
    res.send([])
  }
};
