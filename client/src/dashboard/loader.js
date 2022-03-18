import * as THREE from 'three'
import * as maptalks from 'maptalks'
import { ThreeLayer, BaseObject } from 'maptalks.three'
import { MeshLineMaterial } from '../dashboard/THREE.MeshLine.js'
import SpriteLine from '../dashboard/sprite-line.js'
import axios from 'axios'
import { lineLength } from '../dashboard/geoutils.js'
const { log, warn } = console
const makeId = tile => tile.idx + '_' + tile.idy
const urlTemplateBuildings = (x, y) =>
  `https://data.osmbuildings.org/0.2/anonymous/tile/15/${x}/${y}.json`

// eslint-disable-next-line no-undef
const env = process && process.env

function getColorCode () {
  const makeColorCode = '0123456789ABCDEF'
  let code = '#'
  for (let count = 0; count < 6; count++) {
    code = code + makeColorCode[Math.floor(Math.random() * 16)]
  }
  return code
}

let mediumT, highT, lowT
function makeRoadTexture (url) {
  const texture = new THREE.TextureLoader().load(url)
  texture.anisotropy = 16
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}
if (env.NODE_ENV === 'development') {
  mediumT = makeRoadTexture('http://localhost:8080/public/road1.png')
  highT = makeRoadTexture('http://localhost:8080/public/road2.png')
  lowT = makeRoadTexture('http://localhost:8080/public/road3.png')
} else {
  mediumT = makeRoadTexture('/public/road1.png')
  highT = makeRoadTexture('/public/road2.png')
  lowT = makeRoadTexture('/public/road3.png')
}

const getTexture = speed => {
  if (speed < 50) {
    return lowT
  }
  if (speed >= 50 && speed <= 60) {
    return mediumT
  } else {
    return highT
  }
}

function getColor (height) {
  let rgb
  if (height < 61.4) {
    rgb = '112,112,123'
  } else if (height >= 61.4 && height < 104.8) {
    rgb = '135,139,155'
  } else if (height >= 104.8 && height < 148.2) {
    rgb = '231,241,245'
  } else if (height >= 148.2 && height < 236) {
    rgb = '162,169,183'
  } else {
    rgb = '1,0,0'
  }
  return `rgb(${rgb})`
}

function loadBuildings (map, threeLayer, obj) {
  const tilesNew = map.getBaseLayer().getTiles(15).tileGrids[0].tiles
  const tilesWillBeAdded = []
  const tilesWillBeDeleted = []
  const meshWillBeDeleted = []

  Object.values(obj.tiles).forEach(tileOld => {
    const result = tilesNew.find(tileNew => makeId(tileOld) === makeId(tileNew))

    if (!result) {
      tilesWillBeDeleted.push(tileOld)
    }
  })

  tilesNew.forEach(tile => {
    if (makeId(tile) in obj.tiles) {
      // exists
    } else {
      tilesWillBeAdded.push(tile)
    }
  })

  tilesWillBeAdded.forEach(tile => (obj.tiles[makeId(tile)] = tile))
  tilesWillBeDeleted.forEach(tile => delete obj.tiles[makeId(tile)])

  threeLayer.getMeshes().forEach(mesh => {
    tilesWillBeDeleted.some(tile => {
      if (makeId(tile) === mesh.$id) {
        meshWillBeDeleted.push(mesh)
        return true
      }
      return false
    })
  })

  threeLayer.removeMesh(meshWillBeDeleted)

  tilesWillBeAdded.forEach(tile => {
    console.log(tile)
    window
      .fetch(urlTemplateBuildings(tile.x, tile.y))
      .then(response => response.json())
      .then(data => data.features)
      .then(features => {
        return features.map(function (g) {
          const heightPerLevel = 20
          const levels = g.properties.levels || 2

          const material = new THREE.MeshPhongMaterial({
            color: getColor(levels)
          })

          const mesh = threeLayer.toExtrudePolygon(
            maptalks.GeoJSON.toGeometry(g),
            {
              interactive: false,
              height: levels * heightPerLevel,
              topColor: '#bbb'
            },
            material
          )

          mesh.$id = makeId(tile)
          obj.buildings.push(mesh)

          return mesh
        })
      })
      .then(meshes => threeLayer.addMesh(meshes))
      .catch(() => {
        // console.log('err', err)
        // ignore
      })
  })
}
// let lines = []
async function loadLinks (mapManager, threeLayer, obj) {
  threeLayer.removeMesh(obj.links)
  obj.links = []
  const gs = mapManager.getCurrentLinks()

  const camera = threeLayer.getCamera()

  for (const multiLineString of gs) {
    const speed = multiLineString.properties.SPEEDLH

    if (speed < 60) {
      continue
    }
    const material = new MeshLineMaterial({
      map: getTexture(speed),
      useMap: true,
      lineWidth: 10,
      sizeAttenuation: false,
      transparent: true,
      near: camera.near,
      far: camera.far
    })

    const line = new SpriteLine(
      multiLineString,
      {
        altitude: 0,
        speed: (multiLineString.getLength() / 5000) * speed
      },
      material,
      threeLayer
    )

    obj.links.push(line)
  }
  threeLayer.addMesh(obj.links)
}

const ms = new Array(10).fill(0).map(() => {
  const highlightmaterial = new THREE.MeshBasicMaterial({
    color: getColorCode(),
    transparent: true
  })
  return highlightmaterial
})

async function loadLineTrip (obj, num = 10) {
  const geoJson = await axios({
    url: '/salt/v1/dashboard/dtg/by/vehicleid'
  }).then(res => res.data)
  const threeLayer = obj.threeLayer
  const gemetries = maptalks.GeoJSON.toGeometry(geoJson).slice(1, num)

  threeLayer.removeMesh(obj.lineTrips)

  gemetries.forEach((geometry, i) => {
    setTimeout(() => {
      const line = threeLayer.toExtrudeLineTrail(
        geometry,
        {
          altitude: 0,
          width: 13,
          height: 22,
          chunkLength: geometry.getLength() / (geometry.getLength() / 30),
          speed: 1,
          trail: 3,
          interactive: false
        },
        ms[i % ms.length]
      )
      threeLayer.addMesh(line)
      obj.lineTrips.push(line)
    }, 200)
  })
}

const { requestAnimationFrame } = window

function initThree (map) {
  // const threeLayer = new ThreeLayer(maptalks.Util.GUID(), {
  const threeLayer = new ThreeLayer('three', {
    forceRenderOnMoving: true,
    forceRenderOnRotating: true
    // animation: true
  })

  threeLayer.prepareToDraw = function (gl, scene, camera) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    camera.add(new THREE.SpotLight(0xffffff, 0.6, 0, Math.PI))

    animation()
  }

  threeLayer.addTo(map)

  function animation () {
    // layer animation support Skipping frames
    threeLayer._needsUpdate = !threeLayer._needsUpdate
    if (threeLayer._needsUpdate) {
      threeLayer.redraw()
    }
    requestAnimationFrame(animation)
  }
  return threeLayer
}

export { loadBuildings, loadLinks, loadLineTrip, initThree }
