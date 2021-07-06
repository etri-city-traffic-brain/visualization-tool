const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  linkId: { type: String, required: true, unique: true },
  cellId: { type: String, required: true, unique: true },

  values: [Number],
  travelTimes: [Number],
  vehPassed: [Number],
  waitingTime: [Number]

},
{
  timestamps: false
})

module.exports = mongoose.model('SimulationResult', schema)
