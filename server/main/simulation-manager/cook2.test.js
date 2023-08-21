const cook = require('./cook2')

if (require.main === module) {
  const connectDB = require('../dbms')

  const { db } = require('../../config')

  connectDB(db)

  setTimeout(async () => {
    const start = Date.now()
    await cook({
      simulationId: 'SIMU_202306_00609',
      duration: 7080,
      period: 300
    })
    console.log(`${(Date.now() - start) / 1000} sec`)
    process.exit(1)
  }, 1000)
}
