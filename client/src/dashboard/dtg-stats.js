import * as d3 from 'd3'

const defaultOption = () => ({
  responsive: true,
  title: {
    display: false,
    text: 'Line Chart'
  },
  tooltips: {
    mode: 'index',
    intersect: false
  },
  hover: {
    mode: 'nearest',
    intersect: true
  },
  scales: {
    xAxes: [
      {
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
        ticks: {
          autoSkip: true,
          autoSkipPadding: 10,
          maxRotation: 0,
          display: true,
          fontColor: 'white'
        }
      }
    ]
  },
  legend: {
    display: true,
    labels: {
      fontColor: 'white',
      fontSize: 12
    }
  }
})

const color = d3
  .scaleLinear()
  .domain([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 40])
  .range([
    'rgb(244, 225, 83)',
    'rgb(248, 191, 79)',
    'rgb(243, 159, 83)',
    'rgb(230, 130, 89)',
    'rgb(209, 104, 95)',
    'rgb(183, 84, 99)',
    'rgb(152, 67, 98)',
    'rgb(119, 55, 93)',
    'rgb(85, 44, 82)',
    'rgb(54, 33, 66)'
  ])
  .interpolate(d3.interpolateHcl)

const makeLinkSpeedChartData = (data1, data2, data3) => {
  const dataset = (label, color, data) => ({
    label,
    fill: false,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 0.5,
    pointRadius: 1,
    data
  })

  return {
    labels: new Array(data1.length).fill(0).map((_, i) => i),
    datasets: [
      dataset('속도', '#7FFFD4', data2),
      dataset('볼륨', '#1E90FF', data1)
    ]
  }
}

export { defaultOption, color, makeLinkSpeedChartData }
