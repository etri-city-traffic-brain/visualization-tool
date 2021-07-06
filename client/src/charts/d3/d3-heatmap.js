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
      const linkIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
      const time = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10']

      // Build X scales and axis:
      const x = d3.scaleBand()
        .range([0, width])
        .domain(linkIds)
        .padding(0.01)
      svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))

      // Build X scales and axis:
      const y = d3.scaleBand()
        .range([height, 0])
        .domain(time)
        .padding(0.01)
      svg.append('g')
        .attr('class', 'axisRed')
        .call(d3.axisLeft(y))

      // Build color scale
      const myColor = d3.scaleLinear()
        .range(['white', '#69b3a2'])
        .domain([1, 100])

      const data = [
        { group: 'A', variable: 'v1', value: '10' },
        { group: 'A', variable: 'v2', value: '20' },
        { group: 'A', variable: 'v3', value: '30' }
      ]
      svg.selectAll()
        .data(data, function (d) { return d.group + ':' + d.variable })
        .enter()
        .append('rect')
        .attr('x', function (d) { return x(d.group) })
        .attr('y', function (d) { return y(d.variable) })
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .style('fill', function (d) { return myColor(d.value) })
    }
  }
}
