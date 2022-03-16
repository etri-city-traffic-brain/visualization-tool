
// import { Bar } from 'vue-chartjs'
import { Bar } from './BaseChart';
import { reactiveProp } from './mixins';

export default {
  extends: Bar,
  mixins: [reactiveProp],
  prop: ['chartData', 'height'],
  data() {
    return {
      options: {
        legend: { display: false },
        scales: {
          xAxes: [{
            display: false,
            // barPercentage: 1,
            categoryPercentage: 1,
            ticks: {
              max: 70,
              fontColor: 'white',
              display: false,
            },
            gridLines: { display: false, },
          },
          {
            // barPercentage: 1,
            categoryPercentage: 1,
            ticks: {
              display: true,
              fontColor: 'white',
            },
            gridLines: { display: false, },
          }],
          yAxes: [{
            ticks: {
              display: true,
              fontColor: 'white'
            },
            gridLines: { display: false, },
          }]
        },
      },
    };
  },
  mounted() {
    this.renderChart(
      this.chartData,
      this.options,
    );
  },
};
