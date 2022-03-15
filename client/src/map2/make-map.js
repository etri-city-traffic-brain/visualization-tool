// @ts-nocheck

import * as maptalks from 'maptalks'

const { Map, TileLayer } = maptalks

// const LOC_SEOUL = [127.141195, 37.540903]
// const DEFAULT_CENTER = [127.34054, 36.34834]; // 도안
const DEFAULT_CENTER = [127.34029, 36.34586] // 도안
const DEFAULT_ZOOM = 18

const { log } = console
/**
 * return maptalks.Map instance
 *
 */
export default function MakeMap ({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  mapId
} = {}) {
  const map = new Map(mapId, {
    center,
    zoom,
    maxZoom: 25,
    minZoom: 12,
    seamlessZoom: false,
    zoomControl: {
      position: 'top-right',
      slider: false,
      zoomLevel: true
    },
    baseLayer: new TileLayer('base', {
      // urlTemplate: 'http://xdworld.vworld.kr:8080/2d/Base/201411/{z}/{x}/{y}.png',
      urlTemplate:
        'https://api.mapbox.com/styles/v1/yeonheon/ckmpoihi20bp917pg47jpypm1/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWVvbmhlb24iLCJhIjoiY2o3YTIza3YyMDl1dTJxbzFrN2tjc2tiOSJ9.vAzYQZxcOCxgTrGxE_Zq5g',
      // urlTemplate: 'https://api.mapbox.com/styles/v1/geunii/cktm93o3t9vrj17pfxngxtd6k/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZ2V1bmlpIiwiYSI6ImNrdGw3aDFwNjF0MWUyb3FuZHhsMHp2M3UifQ.LhTy9DE32CO59gxGKxwtDg',
      subdomains: ['a', 'b', 'c', 'd'],
      attribution:
        '&copy; <a href="http://xdworld.vworld.kr">vworld</a> contributors, &copy;',
      renderer: 'gl'
    })
  })

  map.on('click', param => {
    const coord = param.coordinate.toFixed(7)
    // log(coord.x, coord.y)
    // log(param)
  })

  return map
}
