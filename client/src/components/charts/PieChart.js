import { Pie } from './BaseChart';
import { reactiveProp } from './mixins';

export default {
  extends: Pie,
  mixins: [reactiveProp],
  props: ['chartData'],
  data() {
    return {
      options: {
        responsive: false,
        maintainAspectRatio: false,
      }
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options);
  }
}