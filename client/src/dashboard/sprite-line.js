import * as maptalks from 'maptalks'
import * as THREE from 'three'
import { BaseObject } from 'maptalks.three'

import { MeshLine } from './THREE.MeshLine.js'
import { getLinePosition, _getLinePosition } from './geoutils.js'

class SpriteLine extends BaseObject {
  constructor (lineString, options, material, layer) {
    options.offset = material.uniforms.offset.value
    options.clock = new THREE.Clock()
    super()
    const { positions } = getLinePosition(lineString, layer)
    const positions1 = _getLinePosition(lineString, layer).positions

    const nOptions = maptalks.Util.extend({}, options, {
      layer,
      lineString,
      positions: positions1
    })
    this._initOptions(nOptions)

    const geometry = new THREE.Geometry()
    for (let i = 0; i < positions.length; i += 3) {
      geometry.vertices.push(
        new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2])
      )
    }
    const meshLine = new MeshLine()
    meshLine.setGeometry(geometry)

    const map = layer.getMap()
    const size = map.getSize()
    const width = size.width
    const height = size.height
    material.uniforms.resolution.value.set(width, height)

    const line = new THREE.Mesh(meshLine.geometry, material)
    this._createGroup()
    this.getObject3d().add(line)
    const { altitude } = options
    const z = layer.distanceToVector3(altitude, altitude).x
    const center = lineString.getCenter()
    const v = layer.coordinateToVector3(center, z)
    this.getObject3d().position.copy(v)
  }

  _animation () {
    const length = this.options.positions.length
    this.options.offset.x -=
      (this.options.speed * this.options.clock.getDelta()) / length
  }
}

export default SpriteLine
