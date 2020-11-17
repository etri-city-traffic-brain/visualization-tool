export default ({ title, fontColor = 'white'} = {}) => ({
  responsive: true,
  title: {
    display: !!title,
    text: title
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
        fontColor,
      },
    }],
    yAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 10,
        maxRotation:0,
        display: true,
        fontColor,
      },
    }]
  },
  legend: {
    display: true,
    labels: {
      fontColor,
      fontSize: 12
    }
  },
})
