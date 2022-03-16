/**
 * speed bar chart for prediction
 * reference: https://www.d3-graph-gallery.com/graph/heatmap_basic.html
 * author: beanpole
 * last modified: 2018-11-19
 */

import * as d3 from 'd3'

export default {
  name: 'd3-heatmap',
  props: ['value'],
  mounted () {
    this.init()
  },
  data () {
    return {
      width: 250,
      height: 50,
      xScale: null
    }
  },
  watch: {
    value () {
      this.update()
    }
  },

  methods: {
    update () {
      this.init()
    },
    init () {
      const margin = { top: 30, right: 30, bottom: 30, left: 30 }
      const width = 250 - margin.left - margin.right
      const height = 150 - margin.top - margin.bottom

      // const { width, height } = this
      const svg = d3.select(this.$el)

        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform',
          'translate(' + margin.left + ',' + margin.top + ')')

      // Labels of row and columns
      const times = [
        '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
        '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'
      ]
      const links = ['v1', 'v2', 'v3', 'v4', 'v5']

      // Build X scales and axis:
      const x = d3.scaleBand()
        .range([0, width])
        .domain(times)
        .padding(0.01)
      svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'axis')
        .call(d3.axisBottom(x).ticks(5))

      // Build X scales and axis:
      const y = d3.scaleBand()
        .range([height, 0])
        .domain(links)
        .padding(0.01)
      svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y))

      // Build color scale
      const myColor = d3.scaleLinear()
      // .range(['black', 'red', 'yellow'])
      // .domain([1, 50, 100])
        .domain([0, 25, 50, 70])
        .range(['black', 'red', 'orange', 'yellow'])

      const data = [
        { time: '00', linkId: 'v1', value: '3' },
        { time: '00', linkId: 'v2', value: '50' },
        { time: '00', linkId: 'v3', value: '100' },
        { time: '01', linkId: 'v1', value: '100' },
        { time: '01', linkId: 'v2', value: '10' },
        { time: '01', linkId: 'v3', value: '10' }
      ]
      svg.selectAll()
        .data(data, function (d) { return d.time + ':' + d.linkId })
        .enter()
        .append('rect')
        .attr('x', function (d) { return x(d.time) })
        .attr('y', function (d) { return y(d.linkId) })
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .style('fill', function (d) { return myColor(d.value) })
    }
  }
}
