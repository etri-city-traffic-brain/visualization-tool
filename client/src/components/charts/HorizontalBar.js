import { HorizontalBar } from './BaseChart';

function chartData(data) {

  // data = data.slice(0, 48).map(d => d < 1 ? 1 : d);
  // const labels = data.slice(0, 48).map((d, idx) => (Math.floor(idx / 2)) + ':00');

  return {
    labels: [
      'link1098732',
      'link2098732',
      'link3098732',
      'link4098732',
      'link5098732',
      'link6098732',
      'link7098732',
      'link8098732',
    ],
    datasets: [{
      label: '',
      backgroundColor: '#187179',
      data,
    },
    {
      label: '',
      backgroundColor: '#881797',
      data: data.reverse(),
    }], 
  }
}

export default {
  extends: HorizontalBar,
  mounted () {
    this.renderChart(chartData([40, 20, 12, 39, 15, 40, 39, 80]), {
      responsive: true,
      maintainAspectRatio: false
    }
  )
  }
}