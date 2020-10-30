import * as d3 from 'd3'

var bins = d3.histogram()
  .value(d => {
    return d.speed
  })
  .domain([0, 70])
  .thresholds([10, 20, 30, 40, 50, 60]);

export default bins
