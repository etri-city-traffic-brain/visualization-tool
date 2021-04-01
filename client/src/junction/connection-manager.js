/*!
 * Manage connection states
 *
 * Copyright(c) 2019-2019 Modutech
 * Copyright(c) 2019-2019 ETRI
 *
 */
import * as vis from 'vis'
import * as R from 'ramda'

import utils from './utils'
import curveType from './link-curve-type'
import drawLane from './draw-lanes'
import drawJunction from './draw-junction'
import getOptions from './network-option'
import generateLanes from './generate-lanes'
import connectionUtils from './connection-utils'
import signalColor from './signal-colors'

const {
  signalCodeToColor,
  changeColor
} = signalColor

const { degree } = utils
const { getCurrentConnectionSorted } = connectionUtils

const isSameEdge = edge1 => edge2 => edge1.from === edge2.from && edge1.to === edge2.to
const findEdgeIndex = (edges = [], edge) => edges.findIndex(isSameEdge(edge))

const eventBusFactory = () => {
  let bus = null
  function notify (event, param) {
    if (bus) {
      bus.$emit(event, param)
    }
  }
  function setEventBus (events) {
    bus = events
  }
  return {
    notify,
    setEventBus
  }
}

const edgeTmpl = () => ({
  arrows: {
    to: {
      enabled: true,
      type: 'arrow'
    }
  },
  arrowStrikethrough: false,
  smooth: {
    enabled: true,
    forceDirection: false,
    roundness: 0.5
  },
  color: {
    color: 'gray',
    highlight: 'gray',
    hover: 'skyblue'
  }
})

/**
 * manage connection and signal
 * @param {*} junction
 * @param {*} connectedLinks
 * @param {*} element
 */
function ConnectionManager ({ junction, connectedLinks, element }) {
  const lanes = generateLanes(connectedLinks)

  const nodes = new vis.DataSet(lanes)
  const connections = new vis.DataSet([])
  const data = { nodes, edges: connections }
  const eventBus = eventBusFactory()
  const network = new vis.Network(element, data)

  const notify = (event, param) => {
    eventBus.notify(event, param)
    if (network) {
      network.addEdgeMode()
    }
  }

  const addEdge = ({ from, to }, callback) => {
    if (from === to) {
      console.log('start and end are same')
      return
    }
    // const positions = network.getPositions([from, to]);
    const fromNode = nodes.get(from)
    const toNode = nodes.get(to)
    let dirAngle = degree(toNode.angle - fromNode.angle)
    dirAngle = dirAngle < 0 ? 360 + dirAngle : dirAngle
    const { type, direction } = curveType(dirAngle)
    const edge = Object.assign(edgeTmpl(), {
      angle: dirAngle,
      smooth: {
        type
      },
      from,
      to,
      direction
    })

    if (from !== to) {
      callback(edge)
      const idx = findEdgeIndex(getCurrentConnectionSorted(nodes, connections), edge)
      notify('edge:added', { idx })
    }
  }

  network.setOptions(getOptions(addEdge))
  network.fit()

  function beforeDrawing (ctx) {
    drawJunction(ctx, junction)
    drawLane(ctx, lanes)
    // drawLane(ctx, generateLanes(connectedLinks));
  }

  function afterDrawing (ctx) {
    // drawDirectionArrow(ctx, connections, network, nodes)
  }

  const click = (params) => {
    const { event: { srcEvent: { shiftKey } } } = params
    const id = params.edges[0]
    if (!id) {
      return
    }
    // delete mode
    if (shiftKey) {
      const selectedEdge = connections.get(id)
      const idx = findEdgeIndex(getCurrentConnectionSorted(nodes, connections), selectedEdge)
      connections.remove(selectedEdge.id)
      notify('edge:removed', { idx })
      return
    }

    const edge = connections.get(id)
    const color = changeColor(edge.color.color)
    connections.update({
      id,
      color: {
        color,
        highlight: color,
        hover: color
      }
    })
    const idx = findEdgeIndex(getCurrentConnectionSorted(nodes, connections), edge)
    notify('states:changed', { id: idx, color })
  }

  function updateState (phase) {
    const conns = getCurrentConnectionSorted(nodes, connections)
    conns.forEach((con, idx) => {
      const color = signalCodeToColor(phase[idx])
      connections.update({
        id: con.id,
        color: {
          color,
          highlight: color,
          hover: color
        }
      })
    })
  }

  network.on('beforeDrawing', beforeDrawing)
  network.on('afterDrawing', afterDrawing)
  network.on('click', click)
  // network.addEdgeMode();

  function deleteSelected () {
    network.getSelectedEdges().forEach(edge => connections.remove(edge))
    network.addEdgeMode()
  }

  /**
   * load connection from server
   * and visualize it
   */
  function loadConnection (rawConnections = []) {
    rawConnections.forEach((conn) => {
      const from = `${conn.from}${conn.fromLane}`
      const to = `${conn.to}${conn.toLane}`

      const fromNode = nodes.get(from)
      const toNode = nodes.get(to)
      // console.log('from', fromNode, toNode)

      if (fromNode && toNode) {
        const dirAngle = degree(toNode.angle - fromNode.angle)
        // console.log('dirAngle', dirAngle)
        // dirAngle = dirAngle < 0 ? 360 + dirAngle : dirAngle
        // dirAngle = dirAngle < 0 ? 360 + dirAngle : dirAngle
        const { type, direction } = curveType(dirAngle)
        const edge = Object.assign(edgeTmpl(), {
          angle: dirAngle,
          smooth: {
            type
          },
          from,
          to,
          direction
        })
        // console.log('add', edge)
        connections.add(edge)
      }
    })
    // network.addEdgeMode();
    // network.disableEditMode();
  }

  function editMode () {
    network.addEdgeMode()
  }
  function moveMode () {
    network.disableEditMode()
  }

  /**
   * return current connections information
   */
  function getConnections () {
    const sort = R.sortWith([
      R.ascend(R.prop('loc')),
      R.ascend(R.prop('angle'))
    ])

    return sort(connections.map((conn) => {
      const from = nodes.get(conn.from)
      const to = nodes.get(conn.to)
      return {
        from: from.LINK_ID,
        fromLane: from.LANE_ID,
        to: to.LINK_ID,
        toLane: to.LANE_ID,
        angle: from.loc,
        direction: conn.direction
      }
    }))
  }

  const obj = {
    loadConnection,
    getConnections,
    deleteSelected,
    updateState,
    editMode,
    moveMode
  }
  return Object.assign(obj, eventBus)
}

export default ConnectionManager
