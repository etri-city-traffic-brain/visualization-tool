const barChartOption = () => ({
  title: {
    display: false,
    text: ''
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
        stacked: false,
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
