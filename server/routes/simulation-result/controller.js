
const service = require('./service')

// 특정 링크별 결과 반환
async function getValueByLink (req, res, next) {
  const { simulationId, linkOrCellId } = req.params
  res.send(await service.getValueByLinkOrCell(simulationId, linkOrCellId))
}

module.exports = {
  getValueByLink
}
