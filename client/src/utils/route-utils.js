
import lineOffset from '@turf/line-offset'
import lineString from 'turf-linestring'

import * as maptalks from 'maptalks';

function scaleLine(line, scaleFactor = 0.9) {

  const centerX = line.reduce((sum, point) => sum + point[0], 0) / line.length;
  const centerY = line.reduce((sum, point) => sum + point[1], 0) / line.length;

  // Define a scaling factor (e.g., 0.5 will reduce the distance to the center by half)
  // const scaleFactor = 0.9

  // Scale points towards the center
  const scaledPoints = line.map(point => {
    const deltaX = (point[0] - centerX) * scaleFactor;
    const deltaY = (point[1] - centerY) * scaleFactor;
    return [centerX + deltaX, centerY + deltaY];
  })
  return scaledPoints
}

function makeArrow(from, to, volume = 3) {
  const points = [
    [from.getCenter().x, from.getCenter().y],
    [to.getCenter().x, to.getCenter().y]
  ]

  const scaledPoints = scaleLine(points)

  const line = lineString(scaledPoints, { name: 'line1' })

  const offsetLine = lineOffset(line, 0.1)

  try {
    return new maptalks.LineString(offsetLine.geometry.coordinates, {
      arrowStyle: 'classic', // arrow-style : now we only have classic
      arrowPlacement: 'point', // arrow's placement: vertex-first, vertex-last, vertex-firstlast, point
      visible: true,
      draggable: false,
      dragShadow: false, // display a shadow during dragging
      drawOnAxis: null,  // force dragging stick on a axis, can be: x, y
      symbol: {
        lineColor: 'orange',
        lineWidth: volume
      }
    });

  } catch (err) {
    return new maptalks.LineString(line.geometry.coordinates, {
      arrowStyle: 'classic', // arrow-style : now we only have classic
      arrowPlacement: 'point', // arrow's placement: vertex-first, vertex-last, vertex-firstlast, point
      visible: false,
      draggable: false,
      dragShadow: false, // display a shadow during dragging
      drawOnAxis: null,  // force dragging stick on a axis, can be: x, y
      symbol: {
        lineColor: 'black',
        lineWidth: volume
      }
    });
  }
}


export { scaleLine, makeArrow }
