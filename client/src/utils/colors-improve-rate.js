// reference: https://bl.ocks.org/EfratVil/903d82a7cde553fb6739fe55af6103e2

import { scaleLinear, interpolateHcl } from 'd3'

// export default scaleLinear()
//   .domain([-30, -20, -10, 0, 10, 20, 30, 40, 50])
//   .range(['#A9A9A9', 'gray', 'white', '#F0FFFF', 'yellow', 'orange', 'skyblue', 'yellow', '#7FFF00'])
//   .interpolate(interpolateHcl)
// export default scaleLinear()
//   .domain([-30, -20, -10, 0, 10, 20])
//   .range(['#A9A9A9', 'gray', 'white', 'yellow', 'orange', '#7FFF00'])
//   .interpolate(interpolateHcl)

// export default scaleLinear()
//   .domain([-30, 10, 0, 20, 30])
//   .range(['darkgray', 'gray', 'white', 'yellow', 'green'])
//   .interpolate(interpolateHcl)

export default scaleLinear()
  .domain([-100, -30, 10, 0, 20, 100])
  .range(['darkgray', 'gray', '#D3D3D3', 'white', 'GreenYellow', '#7CFC00'])
  .interpolate(interpolateHcl)
