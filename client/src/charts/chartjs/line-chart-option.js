export default ({ title, displayLegend = true, fontColor = 'white' } = {}, callback) => ({
  responsive: true,
  title: {
    display: !!title,
    text: title
  },
  tooltips: {
    mode: 'index',
    intersect: false
  },
  hover: {
    mode: 'nearest',
    intersect: true,
    onHover: function (e) {
      const point = this.getElementAtEvent(e)
      if (point.length) e.target.style.cursor = 'pointer'
      else e.target.style.cursor = 'default'
    }
  },
  scales: {
    xAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 50,
        maxRotation: 0,
        display: true,
        fontColor
      }
    }],
    yAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 10,
        maxRotation: 0,
        display: true,
        fontColor
      }
    }]
  },
  legend: {
    display: displayLegend,
    labels: {
      fontColor,
      fontSize: 12
    }
  },
  onClick: function (evt, item) {
    if (callback) {
      callback(item[0]._index)
    }
  }
})
