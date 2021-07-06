/**
 * speed bar chart for prediction
 * reference: https://bl.ocks.org/duspviz-mit/9b6dce37101c30ab80d0bf378fe5e583
 * author: beanpole
 * last modified: 2018-11-19
 */

import * as d3 from 'd3'

export default {
  name: 'd3-speed-bar',
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
      // d3.select(this.$el)
      //   .select('#speed-bar')
      //   .transition(d3.transition().duration(750).ease(d3.easeLinear))
      //   .attr('width', this.width)
      //   .attr('x', this.xScale(this.value))
      //   .attr('height', this.height - 30)
      //   .style('fill', 'white')
      //   .attr('transform', 'translate(5,10)')
      this.init()
    },
    init () {
      const { width, height } = this
      const svg = d3.select(this.$el)
      svg.selectAll('*').remove()
      svg.attr('height', height)
      // const arr = d3.range(10).map(d => Math.floor(Math.random() * 70))
      if (this.value.datasets.length < 1) {
        return
      }
      const data = this.value.datasets[0].data.map((d, i) => ({
        time: i,
        speed: d
      }))
      const x = d3.scaleBand()
        .range([0, width])
        .padding(0.0)
      const y = d3.scaleLinear()
        .range([height, 0])

      // Scale the range of the data in the domains
      x.domain(data.map(function (d) { return d.time }))
      y.domain([0, d3.max(data, function (d) { return d.speed })])

      const colorScale = d3.scaleLinear()
        .domain([0, 25, 50, 70])
        .range(['red', 'orange', 'yellow', 'green'])

      // append the rectangles for the bar chart
      svg.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d.time))
        .attr('width', x.bandwidth())
        .attr('y', 0)
        // .attr('y', function (d) { return y(d.speed) })
        // .attr('height', function (d) { return height - y(d.speed) })
        .attr('height', height)
        .style('fill', (d) => colorScale(d.speed))
    }
  }
}
