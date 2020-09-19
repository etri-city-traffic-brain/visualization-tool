// @ts-nocheck

import * as maptalks from 'maptalks';

const { Map, TileLayer } = maptalks;

const LOC_SEOUL = [127.141195, 37.540903]
const ZOOM_DEFAULT = 18
/**
 * this function return maptalks.Map instance
 *
 */
// function MakeMap({ center = [127.25002469150205, 36.287444873322], zoom = 17, mapId } = {}) {
export default function MakeMap({ center = LOC_SEOUL, zoom = ZOOM_DEFAULT, mapId } = {}) {
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
  return map
}
