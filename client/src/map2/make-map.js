// @ts-nocheck

import * as maptalks from 'maptalks';

const { Map, TileLayer } = maptalks;

// const LOC_SEOUL = [127.141195, 37.540903]
// const DEFAULT_CENTER = [127.34054, 36.34834]; // 도안
const DEFAULT_CENTER = [127.34029, 36.34586]; // 도안
const DEFAULT_ZOOM = 18

const { log } = console
/**
 * return maptalks.Map instance
 *
 */
export default function MakeMap({ center = DEFAULT_CENTER, zoom = DEFAULT_ZOOM, mapId } = {}) {
  const map = new Map(mapId, {
    center,
    zoom,
    maxZoom: 19,
    minZoom: 12,
    zoomControl: {
      position: 'top-right',
      slider: true,
      zoomLevel: true,
    },
    baseLayer: new TileLayer('base', {
      urlTemplate: 'http://xdworld.vworld.kr:8080/2d/Base/201411/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      attribution: '&copy; <a href="http://xdworld.vworld.kr">vworld</a> contributors, &copy;',
      renderer: 'gl',
    }),
  });

  map.on('click', (param) => {
    log(param.coordinate.toFixed(5))
  });

  return map
}
