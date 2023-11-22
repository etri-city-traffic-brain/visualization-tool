const mongoose = require('mongoose')

// 수요 가시화를 위해서 유성과 서구 일부 지역에 대한 링크목록 반환
// 2023-11-3
module.exports = async (req, res) => {
  try {
    const collection = mongoose.connection.db.collection('ulinks')
    const link = await collection.find({
      'properties.dongCd': {
        $in: [
          '2503066',
          '2503070',
          '2504054',
          '2504059',
          '2504064',
          '2504065',
        ]
      }
    })
    const links = await link.toArray()
    res.json({ features: links })
  } catch (err) {
    res.send({ features: [] })
  }
}
