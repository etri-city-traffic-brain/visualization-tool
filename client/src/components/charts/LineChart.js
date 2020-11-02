
import { Line } from 'vue-chartjs'
import { reactiveProp } from './mixins';

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['chartData', 'options'],
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
