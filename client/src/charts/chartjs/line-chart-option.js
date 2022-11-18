export default (
  { title, displayLegend = true, fontColor = 'white' } = {},
  callback
) => ({
  animation: false,
  spanGaps: true, // enable for all datasets
  responsive: true,
  showLine: true, // disable for a single dataset
  title: {
    display: !!title,
    text: title
  },
  interaction: {
    mode: 'index'
  },
  tooltips: {
    mode: 'index',
    intersect: false
  },
  // hover: {
  //   mode: 'nearest',
  //   intersect: false,
  //   onHover: function (e) {
  //     const point = this.getElementAtEvent(e)
  //     if (point.length) e.target.style.cursor = 'pointer'
  //     else e.target.style.cursor = 'default'
  //   }
  // },
  scales: {
    xAxes: [
      {
        ticks: {
          autoSkip: true,
          autoSkipPadding: 50,
          maxRotation: 0,
          display: true,
          fontColor
        }
      }
    ],
    yAxes: [
      {
        ticks: {
          autoSkip: true,
          autoSkipPadding: 10,
          maxRotation: 0,
          display: true,
          fontColor,
          callback: function (value, index, values) {
            return value + '(s)'
          }
        }
      }
    ]
  },
  legend: {
    display: displayLegend,
    labels: {
      fontColor,
      fontSize: 12
    }
  },
  onClick: function (evt, item) {
    if (callback && item.length > 0) {
      callback(item[0]._index)
    }
  }
})
