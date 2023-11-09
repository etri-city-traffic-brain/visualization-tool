// @ts-nocheck

import * as maptalks from 'maptalks'

const { Map, TileLayer } = maptalks

const DEFAULT_CENTER = [127.34029, 36.34586] // 도안
const DEFAULT_ZOOM = 18

const { log } = console

export default function MakeMap({
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
      position: 'top-left',
      slider: false,
      zoomLevel: true
    },
    // layerSwitcherControl: {
    //   position: 'top-left',
    //   baseTitle: 'Base Layers',
    //   overlayTitle: 'Layers',
    //   excludeLayers: ['c', 'toolLayer'],
    //   containerClass: 'maptalks-layer-switcher'
    // },
    baseLayer: new maptalks.GroupTileLayer('Base TileLayer', [
      new TileLayer('vworld', {
        urlTemplate:
          'https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        attribution:
          '&copy; <a href="http://xdworld.vworld.kr">vworld</a> contributors, &copy;'
      })
    ])
  })

  map.on('click', param => {
    const coord = param.coordinate.toFixed(7)
    log(coord)
  })

  return map
}
