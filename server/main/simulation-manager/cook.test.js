const cook = require('./cook')

if (require.main === module) {
  const connectDB = require('../dbms')

  const { db } = require('../../config')

  connectDB(db)

  setTimeout(async () => {
    const start = Date.now()
    await cook({
      simulationId: 'SIMU_202307_00448',
      duration: 7080,
      period: 300
    })
    process.exit(1)
  }, 1000)
}
