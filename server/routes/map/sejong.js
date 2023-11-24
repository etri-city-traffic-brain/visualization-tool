const mongoose = require('mongoose')

// 수요 가시화를 위해서 유성과 서구 일부 지역에 대한 링크목록 반환
// 2023-11-3
module.exports = async (req, res) => {
  try {
    const collection = mongoose.connection.db.collection('ulinks')
    const link = await collection.find({
      'properties.dongCd': {
        $in: [
          '2901060',
          '2901059',
          '2901056',
          '2901067',
          '2901061',
          '2901064',
          '2901066',
          // '2901031',
          '2901061',
          '2901053',
          '2901068'
        ]
      }
    })
    const links = await link.toArray()
    res.json({ features: links })
  } catch (err) {
    res.send({ features: [] })
  }
}
