const cook = require('./cook')

if (require.main === module) {
  const connectDB = require('../dbms')

  const { db } = require('../../config')

  connectDB(db)

  setTimeout(async () => {
    await cook({
      simulationId: 'SIMU_202209_00089',
      duration: 7080,
      period: 300
    })
    process.exit(1)
  }, 1000)
}
