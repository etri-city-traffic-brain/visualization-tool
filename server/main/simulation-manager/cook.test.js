const cook = require('./cook')

if (require.main === module) {
  const connectDB = require('../dbms')

  const { db } = require('../../config')

  connectDB(db)

  setTimeout(async () => {
    await cook({
      simulationId: 'SIMU_202104_00622',
      duration: 600,
      period: 600
    })
    process.exit(1)
  }, 1000)
}
