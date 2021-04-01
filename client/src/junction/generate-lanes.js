/*!
 * Generate lanes from link
 *
 * Copyright(c) 2019-2019 Modutech
 * Copyright(c) 2019-2019 ETRI
 *
 */

import nodeOption from './lane-node-option'
import utils from './utils'

const { angleBetween } = utils

const OFFSET_START = 250
const OFFSET_END = 460

const LINE_OFFSET = 40

/**
 *
 */
function makeLane (edge, idx) {
  const { geometry, isForward } = edge

  const P1 = geometry[0]
  const P2 = geometry[1]
  let p1, p2
  if (isForward) {
    p1 = { x: P2[0], y: P2[1] }
    p2 = { x: P1[0], y: P1[1] }
  } else {
    p1 = { x: P1[0], y: P1[1] }
    p2 = { x: P2[0], y: P2[1] }
  }

  const lineOffset = LINE_OFFSET * idx
  const META = isForward ? -1 : 1

  const angle = angleBetween(p2, p1)

  const sx = Math.cos(angle) * OFFSET_START
  const ex = Math.cos(angle) * OFFSET_END

  const sdx = sx - lineOffset * Math.sin(angle) * META
  const sdy = (sdx * Math.tan(angle) + lineOffset / Math.cos(angle) * META) * -1

  const edx = ex - lineOffset * Math.sin(angle) * META
  const edy = (edx * Math.tan(angle) + lineOffset / Math.cos(angle) * META) * -1

  return {
    id: edge.id,
    x: sdx,
    y: sdy,
    ex: edx,
    ey: edy,
    angle,
    angleLane: angleBetween({ x: sdx, y: sdy }, { x: edx, y: edy }),
    isForward,
    lanes: edge.LANE,
    LINK_ID: edge.LINK_ID
  }
}

function generateLanes (links = []) {
  const lanes = []
  links.forEach((link) => {
    for (let i = 0; i < link.LANE; i += 1) {
      const lane = makeLane(link, i + 1)
      lane.id = `${lane.LINK_ID}${lane.lanes - i - 1}`

      lanes.push({
        ...lane,
        ...nodeOption,
        LINK_ID: link.LINK_ID,
        lane: lane.lanes - i - 1,
        label: ' ' + (lane.lanes - i - 1) + ' ',
        font: { size: 35, color: 'white' },
        shape: 'circle',
        color: 'black'
      })
    }
  })
  return lanes
}

export default generateLanes
