import * as echarts from 'echarts/dist/echarts.js'

function makeOption (data) {
  if (!data) {
    return {}
  }
  const dReward = data.map(v => v.reward)
  const ppp = data.map(v => v.phase)
  const dPhase = data.map((v, idx) => {
    return {
      name: v.phase,
      value: [v.phase, idx, idx + 1],
      itemStyle: {
        normal: {
          color: phaseColors[Number(v.phase)] || 'cyan'
        }
      }
    }
  })

  return {
    backgroundColor: '#2c343c',
    grid: {
      top: '20',
      bottom: '65',
      left: '90',
      right: '10'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    xAxis: {
      data: new Array(data.length).fill(0).map((v, i) => data[i].step),
      axisLabel: {
        textStyle: {
          color: '#ccc'
        }
      }
      // boundary
    },
    yAxis: [
      {
        type: 'value',
        max: 10,
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: 'black'
          }
        },
        axisLabel: {
          formatter: '{value} phase',
          textStyle: {
            color: '#ccc'
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#ccc',
            opacity: 0.1
          }
        }
      },
      {
        // name: 'reward',
        // max: 100,
        type: 'value',
        position: 'left',
        offset: 60,
        axisLine: {
          show: true,
          lineStyle: {
            color: 'black'
          }
        },
        axisLabel: {
          // formatter: '{value} phase',
          textStyle: {
            color: '#ccc'
          }
        },
        splitLine: { show: false }

        // inverse: true
      }
    ],
    series: [
      {
        name: 'reward',
        type: 'line',
        yAxisIndex: 1,
        // data: dReward.slice(1),
        data: dReward,
        areaStyle: {
          opacity: 0.6
        }
      },
      {
        name: 'phase',
        // type: 'custom',
        type: 'line',
        clip: 'true',
        // renderItem: renderItem,
        data: ppp,
        itemStyle: {
          opacity: (0.8).toExponential,
          normal: {
            color: 'red'
          }
        }
        // encode: {
        //   x: [1, 2],
        //   y: 0
        // },
        // data: dPhase
      }
    ],
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 0,
        end: 20
      },
      {
        type: 'slider',
        start: 0,
        end: 20
      }
    ]
  }
}

const phaseColors = {
  1: 'yellow',
  2: 'green',
  3: 'orange',
  4: 'red',
  5: 'gray',
  6: 'blue',
  7: 'skyblue',
  8: 'cyan',
  9: 'purple'
}

function renderItem (params, api) {
  const categoryIndex = api.value(0)
  const start = api.coord([api.value(1), categoryIndex])
  const end = api.coord([api.value(2), categoryIndex])
  // const height = api.size([0, 1])[1] * 1.5
  const height = api.size([0, 1])[1] * 10

  const rectShape = echarts.graphic.clipRectByRect(
    {
      x: start[0],
      y: start[1] - height / 2,
      width: end[0] - start[0],
      height: height / 10
    },
    {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height
    }
  )

  return (
    rectShape && {
      type: 'rect',
      transition: ['shape'],
      shape: rectShape,
      style: api.style()
    }
  )
}

function drawChart (el, data) {
  const chart = echarts.init(el)
  const option = makeOption(data)
  chart.setOption(option)
  chart.group = 'rewardGroup'
  return chart
}
drawChart.makeOption = makeOption
export default drawChart
