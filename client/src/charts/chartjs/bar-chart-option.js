const barChartOption = () => ({
  title: {
    display: false,
    text: 'Chart.js Bar Chart - Stacked'
  },
  legend: {
    display: false
  },
  tooltips: {
    mode: 'index',
    intersect: false
  },
  responsive: true,
  scales: {
    xAxes: [
      {
        stacked: true,
        ticks: {
          autoSkip: true,
          autoSkipPadding: 50,
          maxRotation: 0,
          display: true,
          fontColor: 'white'
        }
      }
    ],
    yAxes: [
      {
        stacked: true,
        ticks: {
          autoSkip: true,
          autoSkipPadding: 10,
          maxRotation: 0,
          display: true,
          fontColor: 'white'
        }
      }
    ]
  }
})

export default barChartOption
