import * as vis from 'vis'

const bShape = {
  shape: 'circle',
  color: '#2d5986',
  font: { size: 12, color: 'lime', face: 'Verdana' }
}

const edgeColor = {
  color: '#848484',
  highlight: '#848484',
  hover: '#848484',
  inherit: 'from',
  opacity: 1.0
}

const edgeBasic = {
  arrows: 'to',
  color: edgeColor,
  length: 120,
  smooth: {
    type: 'curvedCW' // dynamic
  }
}

function SignalSystem (container, ns = {}) {
  const durInitial = ns.duration
  let offsetUpdated = ns.offset
  let durUpdated = durInitial.slice()
  const items = ns.duration
    .map((n, id) => ({
      id,
      label: 'signal' + id + '\n\n',
      offset: n,
      ...bShape
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

  const nodes = new vis.DataSet(items)

  const edgeItems = []
  for (let i = 0; i < ns.duration.length; i++) {
    if (i === ns.duration.length - 1) {
      edgeItems.push({ from: i, to: 0, ...edgeBasic })
    } else {
      edgeItems.push({ from: i, to: i + 1, ...edgeBasic })
    }
  }

  // create an array with edges
  const edges = new vis.DataSet(edgeItems)

  // create a network
  const data = {
    nodes: nodes,
    edges: edges
  }
  const options = {
    physics: false,
    layout: { randomSeed: 2 },
    edges: {
      width: 2,
      arrows: 'to'
    }
  }
  const network = new vis.Network(container, data, options)

  network.on('afterDrawing', ctx => {
    // const nodeIds = [1, 2, 3, 4]
    const nodeIds = items.map(v => v.id)
    const nodePosition = network.getPositions(items.map(v => v.id))

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
    const offset = offsetUpdated - ns.offset
    const osffsetStr = offset > 0 ? '+' + offset : offset
    ctx.fillText(ns.offset, 0, -15)
    ctx.fillStyle = 'yellow'
    ctx.fillText(osffsetStr, 0, 15)

    ctx.fill()
    ctx.stroke()
  })

  return {
    update (off, nis) {
      console.log('updateed')
      durUpdated = nis
      offsetUpdated = off
    }
  }
}

export default SignalSystem
