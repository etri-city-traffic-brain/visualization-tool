
const { connect } = require('../db')

/**
 * 시뮬레이션 결과는 셀단위로 저장 되어 있다고 가정한다.
 * 셀 단위란 엘리먼트 하나가 셀아이디로 구분된다는 의미이다.
 *
 * 화면에서 셀단위로 요청을 하면 단순히 같은 셀 아이디를 찾아서 반환하면 된다.
 *
 * 화면에서 링크단위로 요청을 하는 경우에는 링크 아이디로 검색후 aggregation 과정을 거친 후 반환하도록 해야 한다.
 */
async function run() {
  const { connection } = await connect('simulation_results')
  const collection = 'inventory'
  const option = [
    {
      $match: {
        linkId: {
          $in: [1, 2, 3]
        }
      }
    },
    {
      $group: {
        _id: '$linkId',
        linkId: { $first: '$linkId' },
        values: { $push: '$values' }
      }
    }
  ]

  // const start = +new Date()
  // const result = await connection.db.collection(collection).aggregate(option).toArray()

  connection.close()
}

run()
