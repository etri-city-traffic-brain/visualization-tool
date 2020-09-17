
import { Line } from 'vue-chartjs'
import { reactiveProp } from './mixins';

const option = {
  responsive: true,
  title: {
    display: false,
    text: 'speed comparison'
  },
  tooltips: {
    mode: 'index',
    intersect: false,
  },
  hover: {
    mode: 'nearest',
    intersect: true
  },
  scales: {
    xAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 50,
        maxRotation:0,
        display: true,
      },
    }],
    yAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 10,
        maxRotation:0,
        display: true,
      },
    }]
  }
}
export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['chartData', 'options'],
  mounted () {
    this.renderChart(this.chartData, option)
  }
}
