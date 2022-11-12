import * as echarts from 'echarts/dist/echarts.js'

function makeOption (data) {
  if (!data) {
    return {}
  }
  return {
    series: [
      {
        name: 'Pressure',
        type: 'gauge',
        progress: {
          show: true
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}'
        },
        pointer: {
          show: false
        },
        splitLine: {
          show: false,
          distance: 0,
          length: 10
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false,
          distance: 50
        },
        data: [
          {
            value: data,
            name: ''
          }
        ]
      }
    ]
  }
}

function drawChart (el, data) {
  const chart = echarts.init(el)
  const option = makeOption(data)
  chart.setOption(option)
  return chart
}
drawChart.makeOption = makeOption
export default drawChart
