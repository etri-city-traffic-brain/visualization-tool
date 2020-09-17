
// import { Bar } from 'vue-chartjs'
import { Bar } from './BaseChart';
import { reactiveProp } from './mixins';

export default {
  extends: Bar,
  mixins: [reactiveProp],
  prop: ['chartData'],
  data() {
    return {
      options: {
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
            // display: false,
            barPercentage: 1,
            // categoryPercentage: 1,
            ticks: {
              // max: 10,
            },
            gridLines: {
              display: false,
            }
          },

          ],
        },
      },
    }
  },
  mounted() {
    this.renderChart(
      this.chartData,
      this.options,
    )
  }
}
