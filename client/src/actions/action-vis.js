import * as vis from 'vis'

const CIRCLE = {
  shape: 'circle',
  color: '#2d5986',
  font: { size: 12, color: 'lime', face: 'Verdana' }
}

const EDGE_COLOR = {
  color: '#848484',
  highlight: '#848484',
  hover: '#848484',
  inherit: 'from',
  opacity: 1.0
}

const EDGE = {
  arrows: 'to',
  color: EDGE_COLOR,
  length: 120,
  smooth: {
    type: 'curvedCW' // dynamic
  }
}
/**
 * 신호정보를 가시화 한다.
 */
function SignalSystem(container, action = { duration: [], offset: 0 }) {
  const durInitial = action.duration
  let offsetUpdated = action.offset
  let durUpdated = durInitial.slice()

  const dataset = action.duration
    .map((n, id) => ({
      id,
      label: 'signal' + id + '\n\n',
      offset: n,
      ...CIRCLE
    }))
    .map((node, index, arr) => {
      const angle = 2 * Math.PI * (index / arr.length + 0.75)
      node.x = 130 * Math.cos(angle)
      node.y = 130 * Math.sin(angle)
      if (index % 2 === 0) {
        node.value = index + 1
      }
      return node
    })

  const nodes = new vis.DataSet(dataset)

  const edgeItems = []
  for (let i = 0; i < action.duration.length; i++) {
    if (i === action.duration.length - 1) {
      edgeItems.push({ from: i, to: 0, ...EDGE })
    } else {
      edgeItems.push({ from: i, to: i + 1, ...EDGE })
    }
  }

  // create an array with edges
  const edges = new vis.DataSet(edgeItems)

  // create a network
  const networkData = {
    nodes: nodes,
    edges: edges
  }
  const options = {
    physics: true,
    layout: { randomSeed: 2 },
    edges: {
      width: 2,
      arrows: 'to'
    },
    nodes: {
      fixed: true
    },
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true
    }
  }
  const network = new vis.Network(container, networkData, options)

  network.on('afterDrawing', ctx => {
    const nodeIds = dataset.map(v => v.id)
    const nodePosition = network.getPositions(dataset.map(v => v.id))

    ctx.textAlign = 'center'

    for (let i = 0; i < nodeIds.length; i++) {
      const node = nodePosition[nodeIds[i]]
      ctx.textAlign = 'center'
      ctx.beginPath()
      ctx.fillStyle = '#A6D5F7'
      ctx.font = '20px Verdana'
      ctx.fillText(durInitial[i], node.x, node.y + 20)
      ctx.fillStyle = 'yellow'
      ctx.font = '15px Verdana'

      const d = durUpdated[i] - durInitial[i]
      const str = d > 0 ? '+' + d : d
      ctx.fillText(str, node.x, node.y + 40)
      ctx.closePath()

      ctx.fill()
      ctx.stroke()
    }

    ctx.fillStyle = 'cyan'
    ctx.lineWidth = 1
    ctx.font = '30px Verdana'
    const offset = offsetUpdated - action.offset
    const osffsetStr = offset > 0 ? '+' + offset : offset
    ctx.fillText('Offset', 0, -40)
    ctx.fillText(action.offset, 0, -5)
    ctx.fillStyle = 'yellow'
    ctx.fillText(osffsetStr, 0, 25)

    ctx.fill()
    ctx.stroke()
  })

  return {
    update(action) {
      durUpdated = action.duration
      offsetUpdated = action.offset
      network.redraw()
    }
  }
}

export default SignalSystem
