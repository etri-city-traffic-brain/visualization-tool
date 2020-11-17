
// import { Bar } from 'vue-chartjs'
import { Bar } from './BaseChart';
import { reactiveProp } from './mixins';

export default {
  extends: Bar,
  mixins: [reactiveProp],
  props: ['chartData', 'options'],
  data() {
    return {
      // options: {
      //   legend: {
      //     display: false,
      //   },
      //   scales: {
      //     xAxes: [{
      //       stacked: true,
      //       ticks: {
      //         // fontColor: 'white',
      //       },
      //     }],
      //     yAxes: [{
      //       stacked: true,
      //       ticks: {
      //         // fontColor: 'white',
      //       },
      //     }]
      //   },
      // },
    }
  },
  mounted() {
    this.renderChart(
      this.chartData,
      this.options,
    )
  }
}
