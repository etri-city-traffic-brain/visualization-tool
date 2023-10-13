
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
            scaleLabel: {
              display: true,
              labelString: '속도(km)',
              fontColor: 'white',
            },
            ticks: {
              display: true,
              fontColor: 'white',
              // callback: function (value) {
              //   if (!value) return ''
              //   return value + ' (km)'
              // },
            },
            gridLines: { display: false, },
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: '통과차량수',
              fontColor: 'white',
            },
            ticks: {
              display: true,
              fontColor: 'white',
              // callback: function (value) {
              //   return value.toLocaleString("en-US") + ' (대)'
              // }
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
