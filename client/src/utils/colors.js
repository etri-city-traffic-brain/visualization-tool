// reference: https://bl.ocks.org/EfratVil/903d82a7cde553fb6739fe55af6103e2

import { scaleLinear, interpolateHcl } from 'd3'

export default scaleLinear()
  .domain([10, 20, 30, 40, 50, 60, 70])
  .range([
    '#d73027',
    '#f46d43',
    '#fdae61',
    // '#fee08b',
    // '#d9ef8b',
    '#a6d96a',
    '#66bd63',
    '#198426',
    '#176c22'
  ])
  // .range(['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'])
  .interpolate(interpolateHcl)
